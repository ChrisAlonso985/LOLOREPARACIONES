import { NextResponse } from "next/server";
import { processPaymentById,processPreapprovalById } from "@/app/lib/security";

export const runtime="nodejs";

export async function POST(req:Request){
  try{
    const url=new URL(req.url);
    const body=await req.json().catch(()=>({}));
    const type=String(body?.type||body?.topic||url.searchParams.get("type")||url.searchParams.get("topic")||"");
    const id=String(body?.data?.id||url.searchParams.get("data.id")||url.searchParams.get("id")||"");
    if(!id)return NextResponse.json({ok:true});
    if(type==="payment")await processPaymentById(id);
    else if(type.includes("preapproval")||type.includes("subscription"))await processPreapprovalById(id);
    return NextResponse.json({ok:true});
  }catch(e){
    console.error("[LOLO Mercado Pago webhook]",e);
    return NextResponse.json({ok:true});
  }
}
export async function GET(){return NextResponse.json({ok:true})}
