import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req:Request){
  try{
    const body=await req.json().catch(()=>null);
    console.log("Mercado Pago webhook",body);
    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({ok:true});
  }
}

export async function GET(){
  return NextResponse.json({ok:true});
}
