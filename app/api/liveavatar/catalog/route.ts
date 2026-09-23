import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API="https://api.liveavatar.com";

function getItems(body:any):any[]{
  const d=body?.data??body;
  const candidates=[
    d?.avatars,d?.items,d?.results,
    body?.avatars,body?.items,body?.results,
    Array.isArray(d)?d:null,
    Array.isArray(body)?body:null
  ];
  return candidates.find(Array.isArray)||[];
}

function safeAvatar(a:any){
  return {
    id:a?.avatar_id??a?.id??a?.avatarId??"",
    name:a?.name??a?.avatar_name??a?.display_name??"",
    gender:a?.gender??a?.metadata?.gender??a?.attributes?.gender??"",
    status:a?.status??a?.state??"",
    type:a?.type??a?.avatar_type??"",
    isPublic:a?.is_public??a?.public??(a?.ownership?String(a.ownership).toLowerCase()==="public":null)
  };
}

export async function GET(){
  const key=process.env.LIVEAVATAR_API_KEY;
  if(!key) return NextResponse.json({error:"LIVEAVATAR_API_KEY no configurada"},{status:503});
  const res=await fetch(API+"/v1/avatars",{
    headers:{"X-API-KEY":key},
    cache:"no-store"
  });
  const body=await res.json().catch(()=>null);
  if(!res.ok) return NextResponse.json({error:body?.message||"No se pudo leer el catálogo",status:res.status},{status:502});
  const avatars=getItems(body).map(safeAvatar).filter((a:any)=>a.id);
  return NextResponse.json({count:avatars.length,avatars});
}
