import OpenAI from "openai";
import { NextResponse } from "next/server";\nimport { requirePaidAccess } from "@/app/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const markerSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    can_mark: { type: "boolean" },
    need_better_photo: { type: "boolean" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    connector_type: { type: "string", enum: ["usb-c", "micro-usb", "unknown"] },
    image_quality: { type: "string", enum: ["good", "usable", "poor"] },
    summary: { type: "string" },
    explanation: { type: "string" },
    safety_warning: { type: "string" },
    follow_up_question: { type: "string" },
    expected_reading: { type: "string" },
    black_probe: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            x: { type: "number", minimum: 0, maximum: 1 },
            y: { type: "number", minimum: 0, maximum: 1 },
            label: { type: "string" },
            evidence: { type: "string" }
          },
          required: ["x","y","label","evidence"]
        },
        { type: "null" }
      ]
    },
    red_probe: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            x: { type: "number", minimum: 0, maximum: 1 },
            y: { type: "number", minimum: 0, maximum: 1 },
            label: { type: "string" },
            evidence: { type: "string" }
          },
          required: ["x","y","label","evidence"]
        },
        { type: "null" }
      ]
    },
    cautions: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          x: { type: "number", minimum: 0, maximum: 1 },
          y: { type: "number", minimum: 0, maximum: 1 },
          radius: { type: "number", minimum: 0.02, maximum: 0.35 },
          label: { type: "string" }
        },
        required: ["x","y","radius","label"]
      }
    }
  },
  required: [
    "can_mark","need_better_photo","confidence","connector_type","image_quality",
    "summary","explanation","safety_warning","follow_up_question","expected_reading",
    "black_probe","red_probe","cautions"
  ]
};

const PROMPT = `Sos LOLO, profesor argentino de reparación electrónica. Analizá una FOTO REAL de una placa o subplaca de celular para enseñar dónde medir con multímetro.

OBJETIVO:
Devolver coordenadas NORMALIZADAS x/y entre 0 y 1 para dibujar marcas sobre la misma foto:
- black_probe = punto de GND/masa razonablemente confirmable.
- red_probe = punto de medición de VBUS SOLO si puede identificarse con evidencia visual suficiente.
- cautions = zonas donde una punta podría puentear contactos o causar un corto.

REGLAS DE SEGURIDAD Y PRECISIÓN:
1. NO inventes VBUS. Una foto por sí sola muchas veces NO permite saber qué pad es VBUS sin esquema, modelo, serigrafía, continuidad o trazado visible.
2. Si no hay evidencia suficiente, can_mark=false, red_probe=null y pedí modelo exacto, foto del otro lado, esquema o una prueba de continuidad guiada.
3. GND puede proponerse sobre blindaje metálico SOLO si visualmente es un blindaje/masa probable; explicá que debe confirmarse.
4. Para voltaje: circuito energizado; advertí que no se deben tocar dos contactos simultáneamente.
5. Para continuidad/resistencia: cargador y batería desconectados.
6. Preferí pads grandes/test points accesibles a contactos diminutos.
7. Si la imagen está borrosa/lejana/oscura: need_better_photo=true y no marques.
8. No diagnostiques un componente como dañado únicamente por la foto.
9. En USB-C podés reconocer el conector, pero NO asumir qué pad de la subplaca es VBUS salvo que sea trazable/identificable.
10. Las coordenadas deben apuntar al centro del punto que realmente querés que el alumno toque.

Tu salida debe respetar estrictamente el JSON schema.`;

export async function POST(req: Request) {\n  const gate=await requirePaidAccess();\n  if(gate.response)return gate.response;
  try {
    const { imageDataUrl, deviceModel, connectorHint, measurement } = await req.json();

    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Falta una imagen válida." }, { status: 400 });
    }
    if (imageDataUrl.length > 7_500_000) {
      return NextResponse.json({ error: "La imagen es demasiado grande. Sacá una foto más liviana o dejá que la app la comprima." }, { status: 413 });
    }

    const token = process.env.OPENAI_API_KEY;
    if (!token) {
      return NextResponse.json({ error: "LOLO todavía no tiene OPENAI_API_KEY configurada en Railway." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey: token });

    const context = `
DATOS DEL ALUMNO:
- Modelo: ${deviceModel || "no informado"}
- Conector indicado: ${connectorHint || "no informado"}
- Medición: ${measurement || "no informada"}

${measurement === "continuity" || measurement === "resistance"
  ? "La medición será con cargador y batería desconectados."
  : "Si es voltaje, será una medición energizada: extremar precaución."}
`;

    const response = await client.responses.create({
      model: process.env.LOLO_VISION_MODEL || "gpt-5.6-sol",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: PROMPT + context },
          { type: "input_image", image_url: imageDataUrl, detail: "high" }
        ]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "lolo_board_measurement",
          strict: true,
          schema: markerSchema
        }
      }
    } as any);

    let data = JSON.parse(response.output_text);

    if (
      !data ||
      data.need_better_photo ||
      data.image_quality === "poor" ||
      Number(data.confidence) < 0.80 ||
      !data.black_probe ||
      !data.red_probe
    ) {
      data = {
        ...data,
        can_mark: false,
        black_probe: null,
        red_probe: null,
        cautions: Array.isArray(data?.cautions) ? data.cautions : []
      };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error analizando la imagen" }, { status: 500 });
  }
}
