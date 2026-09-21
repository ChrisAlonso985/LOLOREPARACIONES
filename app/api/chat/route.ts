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
    const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!token) {
      const last = Array.isArray(messages) ? messages.filter((m:any)=>m?.role === "user").slice(-1)[0]?.content || "" : "";
      const q = String(last).toLowerCase();
      let text = "Decime marca, modelo, síntoma y qué herramientas tenés, y te guío paso a paso.";
      if (/tester|mult[ií]metro|vbus|gnd|d[oó]nde.*med/.test(q)) text = "Para decirte exactamente dónde apoyar el tester necesito ver tu placa. Entrá en ‘Tu placa’, subí una foto nítida y decime si querés medir voltaje, continuidad o resistencia. Si todavía no está habilitada la visión IA del servidor, vas a poder usar el modo guiado sin que LOLO invente un punto.";
      else if (/pin de carga|no carga|carga/.test(q)) text = "Antes de cambiar el pin, probá cable y cargador conocidos, revisá suciedad o daño mecánico y verificá si la alimentación entra a la placa. Después seguimos con mediciones.";
      else if (/soldar|soldadura|caut[ií]n|estaci[oó]n/.test(q)) text = "Antes de aplicar calor, desconectá la batería, protegé flex y plásticos y trabajá con la mínima temperatura efectiva. No hagas palanca hasta que la soldadura esté completamente fundida.";
      else if (/bater[ií]a/.test(q)) text = "Con baterías de litio: no perforar, aplastar, calentar directamente ni puentear. Si está hinchada o dañada, se reemplaza y se manipula con precaución.";
      return NextResponse.json({ text, demo: true });
    }
    const client = new OpenAI({ apiKey: token, baseURL: "https://ai-gateway.vercel.sh/v1" });
    const input = [
      { role: "system", content: SYSTEM },
      ...(Array.isArray(messages) ? messages.slice(-16) : []),
    ] as any;

    const response = await client.responses.create({
      model: process.env.LOLO_CHAT_MODEL || "openai/gpt-5.6-sol",
      input,
    } as any);

    return NextResponse.json({ text: response.output_text || "No pude generar una respuesta." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error de chat" }, { status: 500 });
  }
}
