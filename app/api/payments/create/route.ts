import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser,ensureSchema,query } from "@/app/lib/security";

export const runtime="nodejs";
export const maxDuration=30;

function originFrom(req:Request){
  const h=req.headers.get("x-forwarded-host")||req.headers.get("host");
  const p=req.headers.get("x-forwarded-proto")||"https";
  return h?`${p}://${h}`:new URL(req.url).origin;
}

export async function POST(req:Request){
  let localPaymentId="";
  try{
    const user=await getCurrentUser();
    if(!user)return NextResponse.json({error:"Primero iniciá sesión.",code:"AUTH_REQUIRED"},{status:401});
    const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
    if(!token)return NextResponse.json({error:"Mercado Pago todavía no está vinculado en el servidor."},{status:503});
    const {plan}=await req.json();
    if(plan!=="monthly"&&plan!=="lifetime")return NextResponse.json({error:"Plan inválido."},{status:400});

    await ensureSchema();
    localPaymentId=crypto.randomUUID();
    const short=localPaymentId.replace(/-/g,"").slice(0,20);
    const externalReference=`LOLO-${plan==="monthly"?"M":"L"}-${short}`;
    const amount=plan==="monthly"?12000:120000;
    await query("INSERT INTO payments(id,user_id,plan,external_reference,status,amount,currency) VALUES($1,$2,$3,$4,'created',$5,'ARS')",[localPaymentId,user.id,plan,externalReference,amount]);

    const origin=originFrom(req);
    if(plan==="lifetime"){
      const mp=await fetch("https://api.mercadopago.com/checkout/preferences",{
        method:"POST",
        headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
        body:JSON.stringify({
          items:[{id:"lolo-lifetime",title:"LOLO - Acceso permanente",description:"Acceso permanente a LOLO, tu profesor IA de reparación",quantity:1,currency_id:"ARS",unit_price:120000}],
          payer:{email:user.email},
          external_reference:externalReference,
          back_urls:{
            success:`${origin}/?payment=approved&plan=lifetime`,
            pending:`${origin}/?payment=pending&plan=lifetime`,
            failure:`${origin}/?payment=failure&plan=lifetime`
          },
          notification_url:`${origin}/api/payments/webhook`,
          auto_return:"approved"
        })
      });
      const data=await mp.json();
      if(!mp.ok)throw new Error(data?.message||"Mercado Pago rechazó la preferencia.");
      await query("UPDATE payments SET provider_ref=$1,status='pending',updated_at=NOW() WHERE id=$2",[String(data.id||""),localPaymentId]);
      return NextResponse.json({url:data.init_point,id:data.id});
    }

    const mp=await fetch("https://api.mercadopago.com/preapproval",{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        reason:"LOLO - Plan mensual",
        external_reference:externalReference,
        payer_email:user.email,
        auto_recurring:{frequency:1,frequency_type:"months",transaction_amount:12000,currency_id:"ARS"},
        back_url:`${origin}/?payment=subscription&plan=monthly`,
        status:"pending"
      })
    });
    const data=await mp.json();
    if(!mp.ok)throw new Error(data?.message||"Mercado Pago rechazó la suscripción.");
    await query("UPDATE payments SET provider_ref=$1,status='pending',updated_at=NOW() WHERE id=$2",[String(data.id||""),localPaymentId]);
    return NextResponse.json({url:data.init_point,id:data.id});
  }catch(e:any){
    if(localPaymentId)await query("UPDATE payments SET status='failed',updated_at=NOW() WHERE id=$1",[localPaymentId]).catch(()=>{});
    return NextResponse.json({error:e?.message||"Error al iniciar Mercado Pago."},{status:500});
  }
}
