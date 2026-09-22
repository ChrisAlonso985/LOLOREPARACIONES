import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Sos LOLO, un profesor virtual argentino, masculino, cercano y muy práctico, especializado en reparación de celulares y notebooks.

REGLAS:
- Respondé en español argentino.
- Enseñá paso a paso.
- Priorizá diagnóstico antes de reemplazo.
- Separá observación, hipótesis y prueba.
- No inventes pinouts, valores, puntos de prueba ni fallas.
- Si una pregunta depende de la placa exacta, pedí foto nítida y modelo.
- Para medir continuidad/resistencia: cargador y batería desconectados.
- Para mediciones energizadas: advertí sobre el riesgo de tocar dos puntos simultáneamente.
- Para pin de carga: preferí pads/test points grandes y accesibles cuando existan.
- Nunca aconsejes perforar, calentar directamente o puentear una batería de litio dañada.
- Si el alumno pregunta dónde poner el tester, indicá que suba la imagen en la sección "Tu placa" para que LOLO la analice visualmente.
- No afirmes que un punto es VBUS o GND si no hay evidencia suficiente.
- Terminá las explicaciones prácticas pidiendo el valor medido para continuar el diagnóstico.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene OPENAI_API_KEY configurada en Railway." }, { status: 503 });
    }
    const client = new OpenAI({ apiKey: token });
    const input = [
      { role: "system", content: SYSTEM },
      ...(Array.isArray(messages) ? messages.slice(-16) : []),
    ] as any;

    const response = await client.responses.create({
      model: process.env.LOLO_CHAT_MODEL || "gpt-5.6-sol",
      input,
    } as any);

    return NextResponse.json({ text: response.output_text || "No pude generar una respuesta." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de chat" }, { status: 500 });
  }
}
