import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AVATAR_URL="https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Sakurada_Fumiriya.vrm";

export async function GET(){
  try{
    const r=await fetch(AVATAR_URL,{next:{revalidate:86400}});
    if(!r.ok) return NextResponse.json({error:"No pude cargar el avatar 3D."},{status:502});
    const bytes=await r.arrayBuffer();
    return new NextResponse(bytes,{
      status:200,
      headers:{
        "Content-Type":"application/octet-stream",
        "Cache-Control":"public, max-age=86400, s-maxage=86400",
        "Content-Length":String(bytes.byteLength)
      }
    });
  }catch{
    return NextResponse.json({error:"No pude cargar el avatar 3D."},{status:502});
  }
}
