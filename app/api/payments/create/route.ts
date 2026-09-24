import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

function originFrom(req:Request){
  const h=req.headers.get("x-forwarded-host")||req.headers.get("host");
  const p=req.headers.get("x-forwarded-proto")||"https";
  return h?`${p}://${h}`:new URL(req.url).origin;
}

export async function POST(req:Request){
  try{
    const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
    if(!token) return NextResponse.json({error:"Mercado Pago todavía no está vinculado en el servidor."},{status:503});

    const {plan,email}=await req.json();
    const payerEmail=String(email||"").trim().toLowerCase();
    const at=payerEmail.indexOf("@");
    const lastAt=payerEmail.lastIndexOf("@");
    const local=at>0?payerEmail.slice(0,at):"";
    const domain=at>0?payerEmail.slice(at+1):"";
    const validEmail=
      at>0 &&
      at===lastAt &&
      !/\s/.test(payerEmail) &&
      local.length>0 &&
      domain.includes(".") &&
      !domain.startsWith(".") &&
      !domain.endsWith(".") &&
      !domain.includes("..");
    if(!validEmail){
      return NextResponse.json({error:"Ingresá un correo válido."},{status:400});
    }
    if(plan!=="monthly"&&plan!=="lifetime"){
      return NextResponse.json({error:"Plan inválido."},{status:400});
    }

    const origin=originFrom(req);
    const id=crypto.randomUUID();

    if(plan==="lifetime"){
      const mp=await fetch("https://api.mercadopago.com/checkout/preferences",{
        method:"POST",
        headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
        body:JSON.stringify({
          items:[{
            id:"lolo-lifetime",
            title:"LOLO - Acceso permanente",
            description:"Acceso permanente a LOLO, tu profesor IA de reparación",
            quantity:1,
            currency_id:"ARS",
            unit_price:120000
          }],
          payer:{email:payerEmail},
          external_reference:`LOLO-LIFETIME-${id}`,
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
      if(!mp.ok) return NextResponse.json({error:data?.message||"Mercado Pago rechazó la preferencia."},{status:502});
      return NextResponse.json({url:data.init_point,id:data.id});
    }

    const mp=await fetch("https://api.mercadopago.com/preapproval",{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        reason:"LOLO - Plan mensual",
        external_reference:`LOLO-MONTHLY-${id}`,
        payer_email:payerEmail,
        auto_recurring:{
          frequency:1,
          frequency_type:"months",
          transaction_amount:12000,
          currency_id:"ARS"
        },
        back_url:`${origin}/?payment=subscription&plan=monthly`,
        status:"pending"
      })
    });
    const data=await mp.json();
    if(!mp.ok) return NextResponse.json({error:data?.message||"Mercado Pago rechazó la suscripción."},{status:502});
    return NextResponse.json({url:data.init_point,id:data.id});
  }catch(error:any){
    return NextResponse.json({error:error?.message||"Error al iniciar Mercado Pago."},{status:500});
  }
}
