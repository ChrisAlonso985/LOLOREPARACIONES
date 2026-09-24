import { NextResponse } from "next/server";
import { getCurrentUser,getAccessForUser } from "@/app/lib/security";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
  try{const user=await getCurrentUser();if(!user)return NextResponse.json({authenticated:false,access:{active:false,plan:null,status:"unpaid",label:"Sin acceso activo"}});return NextResponse.json({authenticated:true,user,access:await getAccessForUser(user,true)})}
  catch(e){console.error("[LOLO auth/me]",e);return NextResponse.json({authenticated:false,error:"No pude verificar la cuenta."},{status:503})}
}
