import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene OPENAI_API_KEY configurada en Railway." }, { status: 503 });
    }

    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "No se recibió audio." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: token });
    const result = await client.audio.transcriptions.create({
      file: audio,
      model: process.env.LOLO_TRANSCRIBE_MODEL || "gpt-4o-transcribe",
      language: "es",
      prompt: "Español argentino. Contexto: reparación de celulares y notebooks, multímetro, tester, VBUS, GND, pin de carga, soldadura, placa, subplaca."
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de transcripción" }, { status: 500 });
  }
}
