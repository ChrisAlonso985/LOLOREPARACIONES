import { NextResponse } from "next/server";
import { getCurrentUser,getAccessForUser,getFreeTrialStatus } from "@/app/lib/security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
  try{
    const user=await getCurrentUser();
    if(user){
      const access=await getAccessForUser(user,false);
      if(access.active) return NextResponse.json({available:false,used:false,paid:true});
    }
    const trial=await getFreeTrialStatus();
    return NextResponse.json({...trial,paid:false});
  }catch(e){
    console.error("[LOLO trial/status]",e);
    return NextResponse.json({available:false,used:true,paid:false},{status:503});
  }
}
