import { NextResponse } from "next/server";
import { loginUser,getAccessForUser } from "@/app/lib/security";
export const runtime="nodejs";
export async function POST(req:Request){
  try{const {email,password}=await req.json();const user=await loginUser(String(email||""),String(password||""));return NextResponse.json({authenticated:true,user,access:await getAccessForUser(user,true)})}
  catch(e:any){return NextResponse.json({error:e?.message||"No pude iniciar sesión."},{status:401})}
}
