import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { createHash,randomBytes,randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const g=globalThis as unknown as {loloPool?:Pool;loloSchema?:Promise<void>};
const COOKIE="lolo_session";
const MONTHLY=12000;
const LIFETIME=120000;
const SESSION_SECONDS=60*60*24*30;

function pool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL no configurada");
  if(!g.loloPool) g.loloPool=new Pool({connectionString:process.env.DATABASE_URL,max:6,idleTimeoutMillis:30000,connectionTimeoutMillis:10000});
  return g.loloPool;
}
export async function query(text:string,params:any[]=[]){return pool().query(text,params)}

export async function ensureSchema(){
  if(!g.loloSchema){
    g.loloSchema=(async()=>{
      await query(`
        CREATE TABLE IF NOT EXISTS users(
          id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS sessions(
          token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
        CREATE TABLE IF NOT EXISTS entitlements(
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          plan TEXT NOT NULL,status TEXT NOT NULL,provider TEXT NOT NULL DEFAULT 'mercadopago',
          provider_ref TEXT,expires_at TIMESTAMPTZ,last_verified_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS payments(
          id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          plan TEXT NOT NULL,provider TEXT NOT NULL DEFAULT 'mercadopago',provider_ref TEXT,
          external_reference TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'created',
          amount NUMERIC(12,2) NOT NULL,currency TEXT NOT NULL DEFAULT 'ARS',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id,created_at DESC);
        CREATE INDEX IF NOT EXISTS payments_provider_ref_idx ON payments(provider_ref);

        CREATE TABLE IF NOT EXISTS guest_trials(
          visitor_hash TEXT PRIMARY KEY,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })().catch(e=>{g.loloSchema=undefined;throw e});
  }
  return g.loloSchema;
}

export type LoloUser={id:string;email:string;role:"admin"|"student"};
export type AccessInfo={active:boolean;plan:"admin"|"monthly"|"lifetime"|null;status:string;label:string};

function hashToken(token:string){return createHash("sha256").update(token).digest("hex")}
export function normalizeEmail(v:string){return String(v||"").trim().toLowerCase()}
function validEmail(email:string){
  const at=email.indexOf("@"),domain=at>0?email.slice(at+1):"";
  return at>0&&at===email.lastIndexOf("@")&&!/\s/.test(email)&&domain.includes(".")&&!domain.startsWith(".")&&!domain.endsWith(".")&&!domain.includes("..");
}

async function createSession(userId:string){
  await ensureSchema();
  const token=randomBytes(32).toString("hex");
  const expires=new Date(Date.now()+SESSION_SECONDS*1000);
  await query("DELETE FROM sessions WHERE expires_at<NOW()");
  await query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)",[hashToken(token),userId,expires]);
  const jar=await cookies();
  jar.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_SECONDS});
}

export async function registerUser(emailInput:string,password:string){
  await ensureSchema();
  const email=normalizeEmail(emailInput);
  if(!validEmail(email)) throw new Error("Ingresá un correo válido.");
  if(password.length<8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
  if((await query("SELECT 1 FROM users WHERE email=$1",[email])).rowCount) throw new Error("Ya existe una cuenta con ese correo.");
  const adminEmail=normalizeEmail(process.env.LOLO_ADMIN_EMAIL||"");
  const role=email===adminEmail?"admin":"student";
  const id=randomUUID(),hash=await bcrypt.hash(password,12);
  await query("INSERT INTO users(id,email,password_hash,role) VALUES($1,$2,$3,$4)",[id,email,hash,role]);
  await createSession(id);
  return {id,email,role} as LoloUser;
}

export async function loginUser(emailInput:string,password:string){
  await ensureSchema();
  const email=normalizeEmail(emailInput);
  const adminEmail=normalizeEmail(process.env.LOLO_ADMIN_EMAIL||"");
  let r=await query("SELECT id,email,password_hash,role FROM users WHERE email=$1 LIMIT 1",[email]);

  if(!r.rowCount){
    if(email===adminEmail){
      if(password.length<8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
      const id=randomUUID();
      const hash=await bcrypt.hash(password,12);
      await query("INSERT INTO users(id,email,password_hash,role) VALUES($1,$2,$3,'admin')",[id,email,hash]);
      await createSession(id);
      return {id,email,role:"admin"} as LoloUser;
    }
    throw new Error("No existe una cuenta con ese correo. Elegí Crear cuenta.");
  }

  const row=r.rows[0];
  if(!await bcrypt.compare(password,row.password_hash)) throw new Error("Contraseña incorrecta.");

  if(email===adminEmail&&row.role!=="admin"){
    await query("UPDATE users SET role='admin' WHERE id=$1",[row.id]);
    row.role="admin";
  }

  await createSession(row.id);
  return {id:row.id,email:row.email,role:row.role} as LoloUser;
}

export async function destroySession(){
  const jar=await cookies(),token=jar.get(COOKIE)?.value;
  if(token){await ensureSchema();await query("DELETE FROM sessions WHERE token_hash=$1",[hashToken(token)]).catch(()=>{})}
  jar.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
}

export async function getCurrentUser():Promise<LoloUser|null>{
  await ensureSchema();
  const token=(await cookies()).get(COOKIE)?.value;
  if(!token)return null;
  const r=await query(`SELECT u.id,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW() LIMIT 1`,[hashToken(token)]);
  return r.rowCount?r.rows[0] as LoloUser:null;
}

async function mpGet(path:string){
  const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!token) throw new Error("Mercado Pago no configurado");
  const r=await fetch("https://api.mercadopago.com"+path,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
  const body=await r.json().catch(()=>null);
  if(!r.ok) throw new Error(body?.message||"Mercado Pago rechazó la consulta");
  return body;
}

async function upsertEntitlement(userId:string,plan:string,status:string,providerRef:string|null){
  await query(`
    INSERT INTO entitlements(user_id,plan,status,provider_ref,last_verified_at,updated_at)
    VALUES($1,$2,$3,$4,NOW(),NOW())
    ON CONFLICT(user_id) DO UPDATE SET plan=EXCLUDED.plan,status=EXCLUDED.status,provider_ref=EXCLUDED.provider_ref,last_verified_at=NOW(),updated_at=NOW()
  `,[userId,plan,status,providerRef]);
}

export async function processPaymentById(paymentId:string){
  await ensureSchema();
  const p=await mpGet("/v1/payments/"+encodeURIComponent(paymentId));
  const ext=String(p?.external_reference||"");
  if(!ext)return {matched:false,status:p?.status||"unknown"};
  const r=await query("SELECT * FROM payments WHERE external_reference=$1 LIMIT 1",[ext]);
  if(!r.rowCount)return {matched:false,status:p?.status||"unknown"};
  const row=r.rows[0],status=String(p?.status||"unknown");
  await query("UPDATE payments SET provider_ref=$1,status=$2,updated_at=NOW() WHERE id=$3",[String(p.id),status,row.id]);
  if(row.plan==="lifetime"&&status==="approved"&&Number(p?.transaction_amount||0)===LIFETIME&&String(p?.currency_id||"")==="ARS"){
    await upsertEntitlement(row.user_id,"lifetime","active",String(p.id));
  }
  return {matched:true,status,userId:row.user_id,plan:row.plan};
}

export async function processPreapprovalById(preapprovalId:string){
  await ensureSchema();
  const p=await mpGet("/preapproval/"+encodeURIComponent(preapprovalId));
  const ext=String(p?.external_reference||"");
  if(!ext)return {matched:false,status:p?.status||"unknown"};
  const r=await query("SELECT * FROM payments WHERE external_reference=$1 LIMIT 1",[ext]);
  if(!r.rowCount)return {matched:false,status:p?.status||"unknown"};
  const row=r.rows[0],status=String(p?.status||"unknown");
  await query("UPDATE payments SET provider_ref=$1,status=$2,updated_at=NOW() WHERE id=$3",[String(p.id),status,row.id]);
  const amount=Number(p?.auto_recurring?.transaction_amount||0),currency=String(p?.auto_recurring?.currency_id||"");
  if(row.plan==="monthly"&&status==="authorized"&&amount===MONTHLY&&currency==="ARS"){
    await upsertEntitlement(row.user_id,"monthly","active",String(p.id));
  }else if(row.plan==="monthly"&&["cancelled","canceled","paused"].includes(status)){
    await query("UPDATE entitlements SET status='inactive',last_verified_at=NOW(),updated_at=NOW() WHERE user_id=$1 AND plan='monthly' AND provider_ref=$2",[row.user_id,String(p.id)]);
  }
  return {matched:true,status,userId:row.user_id,plan:row.plan};
}

async function syncPendingForUser(userId:string){
  const r=await query(`SELECT * FROM payments WHERE user_id=$1 AND status NOT IN ('approved','authorized','cancelled','canceled') ORDER BY created_at DESC LIMIT 5`,[userId]);
  for(const row of r.rows){
    try{
      if(row.plan==="monthly"&&row.provider_ref)await processPreapprovalById(String(row.provider_ref));
      if(row.plan==="lifetime"){
        const qs=new URLSearchParams({external_reference:String(row.external_reference),sort:"date_created",criteria:"desc"});
        const body=await mpGet("/v1/payments/search?"+qs.toString());
        const results=Array.isArray(body?.results)?body.results:[];
        const approved=results.find((p:any)=>String(p?.external_reference||"")===String(row.external_reference)&&p?.status==="approved");
        if(approved?.id)await processPaymentById(String(approved.id));
      }
    }catch(e){console.error("[LOLO payment sync]",e)}
  }
}

export async function getAccessForUser(user:LoloUser,sync=true):Promise<AccessInfo>{
  if(user.role==="admin")return {active:true,plan:"admin",status:"active",label:"Administrador"};
  await ensureSchema();
  let r=await query("SELECT * FROM entitlements WHERE user_id=$1 LIMIT 1",[user.id]),ent=r.rows[0];
  if(ent?.plan==="lifetime"&&ent?.status==="active")return {active:true,plan:"lifetime",status:"active",label:"Acceso permanente"};
  if(ent?.plan==="monthly"&&ent?.status==="active"&&ent?.provider_ref){
    const last=ent.last_verified_at?new Date(ent.last_verified_at).getTime():0;
    if(Date.now()-last>5*60*1000){
      try{
        const p=await mpGet("/preapproval/"+encodeURIComponent(String(ent.provider_ref)));
        const status=String(p?.status||"unknown");
        if(status==="authorized")await query("UPDATE entitlements SET last_verified_at=NOW(),updated_at=NOW() WHERE user_id=$1",[user.id]);
        else if(["cancelled","canceled","paused"].includes(status))await query("UPDATE entitlements SET status='inactive',last_verified_at=NOW(),updated_at=NOW() WHERE user_id=$1",[user.id]);
      }catch(e){console.error("[LOLO subscription verify]",e)}
    }
  }
  if(sync)await syncPendingForUser(user.id);
  r=await query("SELECT * FROM entitlements WHERE user_id=$1 LIMIT 1",[user.id]);ent=r.rows[0];
  if(ent?.status==="active")return {active:true,plan:ent.plan==="monthly"?"monthly":"lifetime",status:"active",label:ent.plan==="monthly"?"Suscripción mensual activa":"Acceso permanente"};
  return {active:false,plan:null,status:ent?.status||"unpaid",label:"Sin acceso activo"};
}

export async function requirePaidAccess(){
  const user=await getCurrentUser();
  if(!user)return {user:null,access:null,response:NextResponse.json({error:"Iniciá sesión para usar LOLO.",code:"AUTH_REQUIRED"},{status:401})};
  const access=await getAccessForUser(user,true);
  if(!access.active)return {user,access,response:NextResponse.json({error:"Necesitás un plan activo para usar LOLO.",code:"PAYMENT_REQUIRED"},{status:402})};
  return {user,access,response:null};
}


const TRIAL_COOKIE="lolo_trial";

async function getOrCreateTrialToken(){
  const jar=await cookies();
  let token=jar.get(TRIAL_COOKIE)?.value;
  if(!token){
    token=randomBytes(32).toString("hex");
    jar.set(TRIAL_COOKIE,token,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"lax",
      path:"/",
      maxAge:60*60*24*365
    });
  }
  return token;
}

export async function getFreeTrialStatus(){
  await ensureSchema();
  const jar=await cookies();
  const token=jar.get(TRIAL_COOKIE)?.value;
  if(!token) return {available:true,used:false};
  const visitorHash=hashToken(token);
  const r=await query("SELECT used_at FROM guest_trials WHERE visitor_hash=$1 LIMIT 1",[visitorHash]);
  const used=Boolean(r.rowCount&&r.rows[0]?.used_at);
  return {available:!used,used};
}

export async function requireVoiceInputAccess(){
  const user=await getCurrentUser();
  if(user){
    const access=await getAccessForUser(user,true);
    if(access.active)return {user,access,trial:false,response:null};
  }

  await ensureSchema();
  const token=await getOrCreateTrialToken();
  const visitorHash=hashToken(token);
  await query("INSERT INTO guest_trials(visitor_hash) VALUES($1) ON CONFLICT(visitor_hash) DO NOTHING",[visitorHash]);
  const r=await query("SELECT used_at FROM guest_trials WHERE visitor_hash=$1 LIMIT 1",[visitorHash]);
  const available=Boolean(r.rowCount&&!r.rows[0]?.used_at);
  if(available)return {user,access:null,trial:true,response:null};

  return {
    user,
    access:null,
    trial:false,
    response:NextResponse.json({
      error:"Ya usaste tu prueba gratis. Creá tu cuenta y elegí un plan para seguir hablando con LOLO.",
      code:"TRIAL_USED"
    },{status:402})
  };
}

export async function requireVoiceOutputAccess(){
  const user=await getCurrentUser();
  if(user){
    const access=await getAccessForUser(user,true);
    if(access.active)return {user,access,trial:false,response:null};
  }

  await ensureSchema();
  await query("ALTER TABLE guest_trials ADD COLUMN IF NOT EXISTS voice_output_used_at TIMESTAMPTZ");
  const jar=await cookies();
  const token=jar.get(TRIAL_COOKIE)?.value;
  if(token){
    const visitorHash=hashToken(token);
    const r=await query(
      "UPDATE guest_trials SET voice_output_used_at=NOW() WHERE visitor_hash=$1 AND used_at IS NOT NULL AND voice_output_used_at IS NULL AND used_at > NOW() - INTERVAL '10 minutes' RETURNING visitor_hash",
      [visitorHash]
    );
    if(r.rowCount===1)return {user,access:null,trial:true,response:null};
  }

  return {
    user,
    access:null,
    trial:false,
    response:NextResponse.json({
      error:"La respuesta hablada gratuita ya fue utilizada. Creá tu cuenta para seguir usando la voz de LOLO.",
      code:"TRIAL_VOICE_USED"
    },{status:402})
  };
}

async function consumeFreeTrial(){
  await ensureSchema();
  const token=await getOrCreateTrialToken();
  const visitorHash=hashToken(token);
  await query("INSERT INTO guest_trials(visitor_hash) VALUES($1) ON CONFLICT(visitor_hash) DO NOTHING",[visitorHash]);
  const r=await query("UPDATE guest_trials SET used_at=NOW() WHERE visitor_hash=$1 AND used_at IS NULL RETURNING visitor_hash",[visitorHash]);
  return r.rowCount===1;
}

export async function requireChatAccess(){
  const user=await getCurrentUser();
  if(user){
    const access=await getAccessForUser(user,true);
    if(access.active) return {user,access,trial:false,response:null};
  }

  const granted=await consumeFreeTrial();
  if(granted) return {user,access:null,trial:true,response:null};

  return {
    user,
    access:null,
    trial:false,
    response:NextResponse.json({
      error:"Ya usaste tu consulta gratis. Elegí un plan para seguir hablando con LOLO.",
      code:"TRIAL_USED"
    },{status:402})
  };
}
