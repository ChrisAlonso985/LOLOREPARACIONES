import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(){
  return NextResponse.json({
    configured:Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
    monthly:12000,
    lifetime:120000,
    currency:"ARS"
  });
}
