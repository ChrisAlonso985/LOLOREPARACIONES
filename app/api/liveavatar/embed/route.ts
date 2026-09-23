import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = "https://api.liveavatar.com";
const SANDBOX_AVATAR = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

let cachedContextId = "";

const LOLO_PROMPT = `Sos LOLO, profesor virtual argentino de reparación de celulares y electrónica.
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

async function ensureContext(apiKey:string){
  if(process.env.LIVEAVATAR_CONTEXT_ID) return process.env.LIVEAVATAR_CONTEXT_ID;
  if(cachedContextId) return cachedContextId;

  const res=await liveFetch("/v1/contexts",apiKey,{
    method:"POST",
    body:JSON.stringify({
      name:"LOLO - Profesor IA de Reparación",
      prompt:LOLO_PROMPT,
      opening_text:"Hola, soy LOLO. Contame qué equipo tenés y qué falla hace, y lo vemos juntos paso a paso.",
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
    return NextResponse.json({
      configured:false,
      message:"Todavía no está cargada la clave de LiveAvatar en Railway. Generala en app.liveavatar.com/developers y guardala como LIVEAVATAR_API_KEY. No la pegues en el chat."
    },{status:503});
  }

  const sandbox=(process.env.LIVEAVATAR_SANDBOX??"true").toLowerCase()!=="false";
  const avatarId=process.env.LIVEAVATAR_AVATAR_ID || (sandbox?SANDBOX_AVATAR:"");
  if(!avatarId){
    return NextResponse.json({configured:false,message:"Falta configurar LIVEAVATAR_AVATAR_ID para el avatar de producción."},{status:503});
  }

  const contextId=await ensureContext(apiKey);

  const payload:any={
    avatar_id:avatarId,
    type:"DEFAULT",
    max_session_duration:sandbox?60:600,
    default_language:"es",
    is_sandbox:sandbox,
    orientation:"horizontal"
  };
  if(contextId) payload.context_id=contextId;
  if(process.env.LIVEAVATAR_VOICE_ID) payload.voice_id=process.env.LIVEAVATAR_VOICE_ID;

  let res=await liveFetch("/v2/embeddings",apiKey,{method:"POST",body:JSON.stringify(payload)});
  let body=await res.json().catch(()=>null);

  // Some accounts/avatars don't accept a custom context in sandbox.
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

  return NextResponse.json({
    configured:true,
    url,
    sandbox,
    avatarId
  });
}
