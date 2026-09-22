import { NextResponse } from "next/server";

export async function GET(){
  return NextResponse.json({
    ok:true,
    app:"LOLO",
    aiConfigured:Boolean(process.env.OPENAI_API_KEY),
    chatModel:process.env.LOLO_CHAT_MODEL || "gpt-5.6-sol",
    visionModel:process.env.LOLO_VISION_MODEL || "gpt-5.6-sol",
    ttsModel:process.env.LOLO_TTS_MODEL || "gpt-4o-mini-tts",
    transcribeModel:process.env.LOLO_TRANSCRIBE_MODEL || "gpt-4o-transcribe"
  });
}
