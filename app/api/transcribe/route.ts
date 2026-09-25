import OpenAI from "openai";
import { NextResponse } from "next/server";
import { requireVoiceInputAccess } from "@/app/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const extensionFor=(mime:string)=>{
  if(mime.includes("mp4")) return "m4a";
  if(mime.includes("mpeg")||mime.includes("mp3")) return "mp3";
  if(mime.includes("ogg")) return "ogg";
  if(mime.includes("wav")) return "wav";
  return "webm";
};

export async function POST(req: Request) {
  const gate=await requireVoiceInputAccess();
  if(gate.response)return gate.response;
  try {
    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene configurado el servicio de voz." }, { status: 503 });
    }

    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "No recibí el audio. Tocá el micrófono y probá otra vez." }, { status: 400 });
    }

    if(audio.size < 1200){
      return NextResponse.json({ error: "La grabación quedó demasiado corta. Hablá un poco más y probá de nuevo." }, { status: 400 });
    }

    const mime=(audio.type||"audio/webm").split(";")[0].toLowerCase();
    const ext=extensionFor(mime);
    const bytes=await audio.arrayBuffer();

    // Recreamos el archivo con un MIME y una extensión coherentes.
    // Algunos WebView/Android envían "audio/webm;codecs=opus" y el proveedor
    // puede rechazar el contenedor si el nombre/tipo no coinciden.
    const cleanFile=new File([bytes],`voz-lolo.${ext}`,{type:mime});

    const client = new OpenAI({ apiKey: token });
    const result = await client.audio.transcriptions.create({
      file: cleanFile,
      model: process.env.LOLO_TRANSCRIBE_MODEL || "gpt-4o-transcribe",
      language: "es",
      prompt: "Español argentino. Contexto: reparación de celulares y notebooks, multímetro, tester, VBUS, GND, pin de carga, soldadura, placa, subplaca."
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("LOLO transcription error",error);
    const msg=String(error?.message||"");
    const invalid=/corrupt|unsupported|audio file|format/i.test(msg);
    if(invalid){
      return NextResponse.json({
        error:"No pude leer esa grabación. Tocá el micrófono otra vez y hablá normalmente durante uno o dos segundos.",
        retryable:true
      },{status:422});
    }
    return NextResponse.json({ error: "No pude procesar tu voz en este momento. Probá de nuevo." }, { status: 500 });
  }
}
