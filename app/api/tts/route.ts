import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Falta texto." }, { status: 400 });
    }

    const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "AI Gateway no está autenticado." }, { status: 503 });
    }

    const response = await fetch("https://ai-gateway.vercel.sh/v4/ai/speech-model", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ai-model-id": process.env.LOLO_TTS_MODEL || "openai/tts-1"
      },
      body: JSON.stringify({
        text: text.slice(0, 3500),
        voice: process.env.LOLO_TTS_VOICE || "onyx",
        outputFormat: "mp3",
        speed: 0.98,
        language: "es",
        instructions: "Voz masculina, cálida, clara, docente y tranquila. Español rioplatense/argentino cuando sea posible."
      })
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error(raw);
      return NextResponse.json({ error: "No se pudo generar la voz IA." }, { status: 502 });
    }
    const json = JSON.parse(raw);
    return NextResponse.json({ audio: json.audio, mime: "audio/mpeg", warnings: json.warnings || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de voz" }, { status: 500 });
  }
}
