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

function likelyMaleName(name:string){
  const n=name.toLowerCase();
  const maleNames=[
    "wayne","josh","adrian","bryan","brian","matt","mike","james","john","david","daniel","alex",
    "jack","ryan","ethan","noah","liam","marcus","henry","eric","sam","will","adam","peter","robert",
    "george","chris","carlos","diego","juan","mateo","lucas","martin","santiago","sebastian","rafael",
    "ronan","elliot","damian","dante","brody","hayes","lasse","julian","fintan","beckett","kenji",
    "dashiell","cassian","rafi","kacper","henrik"
  ];
  return maleNames.some(m=>n.includes(m));
}

async function chooseAvatar(apiKey:string,sandbox:boolean){
  if(sandbox) return {id:SANDBOX_AVATAR,name:"Sandbox",gender:"male"};

  const configured=(process.env.LIVEAVATAR_AVATAR_ID||"").trim();
  if(configured && configured!=="auto-male"){
    return {id:configured,name:"LOLO",gender:"male"};
  }
  if(cachedMaleAvatar) return cachedMaleAvatar;

  // Official public catalogue endpoint; it does not require authentication.
  const res=await fetch(API+"/v1/avatars/public?page_size=100",{cache:"no-store"});
  const body=await res.json().catch(()=>null);
  if(!res.ok) throw new Error("No se pudo consultar el catálogo público de LiveAvatar.");

  const results=Array.isArray(body?.data?.results)?body.data.results:[];
  const active=results
    .filter((a:any)=>a?.id && String(a?.status||"").toUpperCase()==="ACTIVE")
    .filter((a:any)=>!a?.type || String(a.type).toUpperCase()==="VIDEO");

  const male=active.find((a:any)=>likelyMaleName(String(a?.name||"")));
  if(!male){
    const names=active.slice(0,12).map((a:any)=>String(a?.name||"")).filter(Boolean);
    console.error("[liveavatar] No male match. Public avatars:",names.join(", "));
    throw new Error("LiveAvatar no devolvió un avatar masculino identificable. Probá nuevamente en unos segundos.");
  }

  cachedMaleAvatar={id:String(male.id),name:String(male.name||"LOLO"),gender:"male"};
  console.log("[liveavatar] Avatar masculino seleccionado:",cachedMaleAvatar.name,cachedMaleAvatar.id);
  return cachedMaleAvatar;
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
