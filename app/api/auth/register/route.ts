import { NextResponse } from "next/server";
import { registerUser,getAccessForUser } from "@/app/lib/security";
export const runtime="nodejs";
export async function POST(req:Request){
  try{const {email,password}=await req.json();const user=await registerUser(String(email||""),String(password||""));return NextResponse.json({authenticated:true,user,access:await getAccessForUser(user,false)})}
  catch(e:any){return NextResponse.json({error:e?.message||"No pude crear la cuenta."},{status:400})}
}
