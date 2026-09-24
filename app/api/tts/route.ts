import OpenAI from "openai";
import { NextResponse } from "next/server";
import { requirePaidAccess } from "@/app/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const ttsCache = new Map<string,{audio:string;mime:string}>();
const rememberTts = (key:string,value:{audio:string;mime:string}) => {
  if(ttsCache.size>=32){
    const first=ttsCache.keys().next().value;
    if(first) ttsCache.delete(first);
  }
  ttsCache.set(key,value);
};

export async function POST(req: Request) {
  const gate=await requirePaidAccess();
  if(gate.response)return gate.response;
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Falta texto." }, { status: 400 });
    }

    const cacheKey=text.trim().slice(0,3500);
    const cached=ttsCache.get(cacheKey);
    if(cached) return NextResponse.json(cached,{headers:{"X-LOLO-TTS-Cache":"HIT"}});

    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene OPENAI_API_KEY configurada en Railway." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey: token });
    const speech = await client.audio.speech.create({
      model: process.env.LOLO_TTS_MODEL || "gpt-4o-mini-tts",
      voice: (process.env.LOLO_TTS_VOICE || "onyx") as any,
      input: text.slice(0, 3500),
      instructions: "Sos LOLO, un profesor joven argentino de reparación electrónica. Voz masculina, cálida, amigable y segura. Hablá con energía de profesor de taller, ritmo ágil, natural y conversacional, con entusiasmo moderado y buena dicción. Español rioplatense/argentino. Evitá pausas largas, tono solemne o lento. No susurres. Soná cercano, positivo y dinámico."
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    const payload={ audio: buffer.toString("base64"), mime: "audio/mpeg" };
    rememberTts(cacheKey,payload);
    return NextResponse.json(payload,{headers:{"X-LOLO-TTS-Cache":"MISS"}});
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de voz" }, { status: 500 });
  }
}
