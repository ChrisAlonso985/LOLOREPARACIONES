"use client";
import { useEffect,useState } from "react";
export type AccountSnapshot={authenticated:boolean;user?:{id:string;email:string;role:"admin"|"student"};access:{active:boolean;plan:"admin"|"monthly"|"lifetime"|null;status:string;label:string}};
export default function AccountPanel({account,onAccountChange}:{account:AccountSnapshot|null;onAccountChange:(a:AccountSnapshot)=>void}){
  const [mode,setMode]=useState<"login"|"register">("login"),[email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[paymentBusy,setPaymentBusy]=useState<"monthly"|"lifetime"|null>(null),[mpReady,setMpReady]=useState(false),[users,setUsers]=useState<any[]>([]);
  useEffect(()=>{fetch("/api/payments/status").then(r=>r.json()).then(j=>setMpReady(Boolean(j.configured))).catch(()=>{})},[]);
  useEffect(()=>{if(account?.authenticated&&account.user?.role==="admin")fetch("/api/admin/users").then(r=>r.json()).then(j=>setUsers(Array.isArray(j.users)?j.users:[])).catch(()=>{})},[account?.authenticated,account?.user?.role,account?.access?.status]);
  async function authSubmit(){setError("");setBusy(true);try{const r=await fetch("/api/auth/"+(mode==="login"?"login":"register"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const j=await r.json();if(!r.ok)throw new Error(j.error||"No pude completar el acceso.");onAccountChange(j);setPassword("")}catch(e:any){setError(e?.message||"Error de cuenta.")}finally{setBusy(false)}}
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});onAccountChange({authenticated:false,access:{active:false,plan:null,status:"unpaid",label:"Sin acceso activo"}})}
  async function pay(plan:"monthly"|"lifetime"){setError("");setPaymentBusy(plan);try{const r=await fetch("/api/payments/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});const j=await r.json();if(!r.ok)throw new Error(j.error||"No pude iniciar Mercado Pago.");if(!j.url)throw new Error("Mercado Pago no devolvió el enlace.");window.location.href=j.url}catch(e:any){setError(e?.message||"No pude iniciar el pago.");setPaymentBusy(null)}}
  if(account===null)return <div className="panel accountPanel"><h2>Mi cuenta LOLO</h2><p className="muted">Verificando tu cuenta…</p></div>;
  if(!account.authenticated)return <div className="panel accountPanel authPanel">
    <div className="accountHead"><div><h2>Ingresá a LOLO</h2><p className="muted">Para usar la IA necesitás una cuenta y un plan activo.</p></div><span className="paymentState pending">🔒 Protegido</span></div>
    <div className="authTabs"><button className={mode==="login"?"on":""} onClick={()=>{setMode("login");setError("")}}>Ya tengo cuenta</button><button className={mode==="register"?"on":""} onClick={()=>{setMode("register");setError("")}}>Crear cuenta</button></div>
    <div className="field"><label>Correo</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="alumno@email.com"/></div>
    <div className="field"><label>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="login"?"current-password":"new-password"} placeholder="Mínimo 8 caracteres"/></div>
    {error&&<div className="notice">{error}</div>}<button className="btn primary authMainBtn" onClick={()=>void authSubmit()} disabled={busy}>{busy?"Procesando…":mode==="login"?"Ingresar":"Crear cuenta"}</button>
    <div className="tip warn"><b>Sin pago no se consume IA.</b> Hablar con LOLO, analizar placas y las funciones inteligentes quedan bloqueadas hasta que Mercado Pago confirme el acceso.</div>
  </div>;
  return <div className="panel accountPanel">
    <div className="accountHead"><div><h2>Mi cuenta LOLO</h2><p className="muted">{account.user?.email}</p></div><span className={"paymentState "+(account.access.active?"ready":"pending")}>{account.access.active?"✓ "+account.access.label:"Sin plan activo"}</span></div>
    {error&&<div className="notice">{error}</div>}
    {account.access.active?<div className="accessActiveBox"><b>✓ Acceso habilitado</b><span>{account.access.label}. Ya podés usar todas las funciones de LOLO.</span></div>:<>
      <p className="muted">Elegí un plan. Mercado Pago queda vinculado automáticamente a esta cuenta.</p>
      <div className="plans"><article className="planCard featured"><div className="planTag">MENSUAL</div><h3>LOLO Mensual</h3><div className="price">$12.000 <small>/ mes</small></div><p>Acceso completo mientras la suscripción esté autorizada.</p><button className="btn primary payBtn" onClick={()=>void pay("monthly")} disabled={paymentBusy!==null||!mpReady}>{paymentBusy==="monthly"?"Abriendo Mercado Pago…":"Suscribirme con Mercado Pago"}</button></article>
      <article className="planCard"><div className="planTag">PAGO ÚNICO</div><h3>LOLO Permanente</h3><div className="price">$120.000</div><p>Un pago aprobado habilita esta cuenta de forma permanente.</p><button className="btn payBtn" onClick={()=>void pay("lifetime")} disabled={paymentBusy!==null||!mpReady}>{paymentBusy==="lifetime"?"Abriendo Mercado Pago…":"Comprar acceso permanente"}</button></article></div>
    </>}
    <div className="accountActions"><button className="btn" onClick={()=>void logout()}>Cerrar sesión</button></div>
    {account.user?.role==="admin"&&<div className="adminBox"><div className="adminHead"><div><b>Panel del administrador</b><span>Usuarios y pagos registrados</span></div><span>{users.length} cuentas</span></div><div className="adminUsers">{users.map((u:any)=><div className="adminUser" key={u.id}><div><b>{u.email}</b><small>{u.role==="admin"?"Administrador":u.plan==="lifetime"?"Permanente":u.plan==="monthly"?"Mensual":"Sin plan"}</small></div><span className={(u.access_status==="active"||u.role==="admin")?"ok":"off"}>{u.role==="admin"?"ADMIN":u.access_status==="active"?"ACTIVO":u.payment_status?String(u.payment_status).toUpperCase():"SIN PAGO"}</span></div>)}</div></div>}
  </div>;
}
