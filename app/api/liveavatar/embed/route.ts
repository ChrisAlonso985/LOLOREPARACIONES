import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = "https://api.liveavatar.com";
const SANDBOX_AVATAR = "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0";

let cachedContextId = "";
let cachedMaleAvatar:{id:string;name:string;gender:string}|null=null;

const LOLO_PROMPT = `Sos LOLO, profesor virtual argentino de reparación de celulares y electrónica.
Tu identidad es masculina. Hablá y presentate siempre como un profesor hombre.
Tu tarea es enseñar como un buen profesor de taller: cercano, claro, paciente y práctico.
Hablá en español rioplatense/argentino, con energía moderada y frases breves.
Primero preguntá marca/modelo, síntoma y qué ya probó el alumno.
Guiá de a un paso por vez y pedí el resultado antes de avanzar.
No inventes mediciones, pinouts, tensiones ni diagnósticos.
En continuidad o resistencia indicá desconectar cargador y batería cuando corresponda.
Con batería dañada o hinchada, frená la práctica y priorizá seguridad.
Si el alumno necesita análisis visual de placa, indicále que use la sección Tu placa de LOLO para subir una foto.
Tu objetivo es que el alumno entienda el diagnóstico, no solamente darle una respuesta.`;

async function liveFetch(path:string, apiKey:string, init?:RequestInit){
  return fetch(API+path,{
    ...init,
    headers:{
      "X-API-KEY":apiKey,
      "Content-Type":"application/json",
      ...(init?.headers||{})
    },
    cache:"no-store"
  });
}

function avatarItems(body:any):any[]{
  const d=body?.data??body;
  const candidates=[
    d?.avatars,d?.items,d?.results,
    body?.avatars,body?.items,body?.results,
    Array.isArray(d)?d:null,
    Array.isArray(body)?body:null
  ];
  return candidates.find(Array.isArray)||[];
}

function avatarMeta(a:any){
  return {
    id:String(a?.avatar_id??a?.id??a?.avatarId??""),
    name:String(a?.name??a?.avatar_name??a?.display_name??""),
    gender:String(a?.gender??a?.metadata?.gender??a?.attributes?.gender??"").toLowerCase(),
    status:String(a?.status??a?.state??"").toLowerCase()
  };
}

function likelyMaleName(name:string){
  return /\b(josh|adrian|bryan|brian|matt|mike|james|john|david|daniel|alex|jack|ryan|ethan|noah|liam|wayne|marcus|henry|eric|sam|will|adam|peter|robert|george|chris|carlos|diego|juan|mateo|lucas|martin|santiago)\b/i.test(name);
}

async function chooseAvatar(apiKey:string,sandbox:boolean){
  if(sandbox) return {id:SANDBOX_AVATAR,name:"Sandbox",gender:"female"};

  const configured=(process.env.LIVEAVATAR_AVATAR_ID||"").trim();
  if(configured && configured!=="auto-male"){
    return {id:configured,name:"Configurado",gender:""};
  }
  if(cachedMaleAvatar) return cachedMaleAvatar;

  const res=await liveFetch("/v1/avatars",apiKey,{method:"GET"});
  const body=await res.json().catch(()=>null);
  if(!res.ok) throw new Error(body?.message||"No se pudo leer el catálogo de LiveAvatar.");

  const avatars=avatarItems(body).map(avatarMeta).filter((a:any)=>a.id);
  const active=avatars.filter((a:any)=>!["inactive","disabled","failed","rejected"].includes(a.status));
  const male=active.find((a:any)=>a.gender==="male"||a.gender==="man")
    ||active.find((a:any)=>likelyMaleName(a.name));

  if(!male){
    throw new Error("No encontré un avatar masculino disponible en tu biblioteca de LiveAvatar.");
  }

  cachedMaleAvatar=male;
  return male;
}

async function ensureContext(apiKey:string){
  if(process.env.LIVEAVATAR_CONTEXT_ID) return process.env.LIVEAVATAR_CONTEXT_ID;
  if(cachedContextId) return cachedContextId;

  const res=await liveFetch("/v1/contexts",apiKey,{
    method:"POST",
    body:JSON.stringify({
      name:"LOLO - Profesor IA de Reparación",
      prompt:LOLO_PROMPT,
      opening_text:"Hola, soy LOLO. Soy tu profesor de reparación. Contame qué equipo tenés y qué falla hace, y lo vemos juntos paso a paso.",
      links:[]
    })
  });

  if(!res.ok) return "";
  const data=await res.json().catch(()=>null);
  cachedContextId=data?.data?.id||"";
  return cachedContextId;
}

export async function POST(){
  const apiKey=process.env.LIVEAVATAR_API_KEY;
  if(!apiKey){
    return NextResponse.json({configured:false,message:"LIVEAVATAR_API_KEY no está configurada."},{status:503});
  }

  const sandbox=(process.env.LIVEAVATAR_SANDBOX??"false").toLowerCase()==="true";
  let selected:{id:string;name:string;gender:string};
  try{
    selected=await chooseAvatar(apiKey,sandbox);
  }catch(e){
    return NextResponse.json({configured:true,error:e instanceof Error?e.message:"No se pudo elegir el avatar."},{status:502});
  }

  const contextId=await ensureContext(apiKey);
  const payload:any={avatar_id:selected.id,is_sandbox:sandbox};
  if(contextId) payload.context_id=contextId;

  let res=await liveFetch("/v2/embeddings",apiKey,{method:"POST",body:JSON.stringify(payload)});
  let body=await res.json().catch(()=>null);

  if(!res.ok && contextId){
    delete payload.context_id;
    res=await liveFetch("/v2/embeddings",apiKey,{method:"POST",body:JSON.stringify(payload)});
    body=await res.json().catch(()=>null);
  }

  const url=body?.data?.url;
  if(!res.ok || !url){
    const message=body?.message || body?.detail?.[0]?.msg || "LiveAvatar rechazó el inicio de la sesión.";
    return NextResponse.json({configured:true,error:message},{status:502});
  }

  const envRenew=Number(process.env.LIVEAVATAR_RENEW_SECONDS||"");
  const renewAfterSeconds=Number.isFinite(envRenew)&&envRenew>=30
    ?Math.round(envRenew)
    :(sandbox?45:105);

  return NextResponse.json({
    configured:true,
    url,
    sandbox,
    avatarId:selected.id,
    avatarName:selected.name,
    avatarGender:selected.gender||"male",
    renewAfterSeconds
  });
}
