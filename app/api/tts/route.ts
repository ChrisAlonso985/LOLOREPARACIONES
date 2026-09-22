import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Falta texto." }, { status: 400 });
    }

    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene OPENAI_API_KEY configurada en Railway." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey: token });
    const speech = await client.audio.speech.create({
      model: process.env.LOLO_TTS_MODEL || "gpt-4o-mini-tts",
      voice: (process.env.LOLO_TTS_VOICE || "onyx") as any,
      input: text.slice(0, 3500),
      instructions: "Sos LOLO, un profesor varón argentino de reparación electrónica. Usá una voz claramente masculina, adulta, de tono medio-grave, cálida y cercana. Español rioplatense/argentino, dicción clara, ritmo continuo y natural, pausas suaves solamente entre ideas. No uses voz femenina, no susurres y no cortes las frases."
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    return NextResponse.json({ audio: buffer.toString("base64"), mime: "audio/mpeg" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de voz" }, { status: 500 });
  }
}
