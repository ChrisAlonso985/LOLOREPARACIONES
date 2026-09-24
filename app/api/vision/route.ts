import OpenAI from "openai";
import { NextResponse } from "next/server";
import { requirePaidAccess } from "@/app/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const TASKS = [
  "diagnose","module_no_frame","module_frame","display_touch","power","charging",
  "audio_buzzer","audio_earpiece","microphone","buttons","signal","sim","wifi",
  "camera","vibrator","sensors","battery","flex","solder","moisture","measure"
] as const;

const markerSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    can_mark: { type: "boolean" },
    can_measure: { type: "boolean" },
    need_better_photo: { type: "boolean" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    connector_type: { type: "string", enum: ["usb-c","micro-usb","lightning","unknown"] },
    image_quality: { type: "string", enum: ["good","usable","poor"] },
    analysis_type: { type: "string" },
    summary: { type: "string" },
    diagnosis: { type: "string" },
    explanation: { type: "string" },
    suggested_action: { type: "string" },
    safety_warning: { type: "string" },
    follow_up_question: { type: "string" },
    required_next_view: { type: "string" },
    expected_reading: { type: "string" },
    black_probe: {
      anyOf: [
        {
          type: "object", additionalProperties: false,
          properties: {
            x:{type:"number",minimum:0,maximum:1}, y:{type:"number",minimum:0,maximum:1},
            label:{type:"string"}, evidence:{type:"string"}
          },
          required:["x","y","label","evidence"]
        },
        {type:"null"}
      ]
    },
    red_probe: {
      anyOf: [
        {
          type: "object", additionalProperties: false,
          properties: {
            x:{type:"number",minimum:0,maximum:1}, y:{type:"number",minimum:0,maximum:1},
            label:{type:"string"}, evidence:{type:"string"}
          },
          required:["x","y","label","evidence"]
        },
        {type:"null"}
      ]
    },
    findings: {
      type:"array", maxItems:6,
      items:{
        type:"object", additionalProperties:false,
        properties:{
          x:{type:"number",minimum:0,maximum:1},
          y:{type:"number",minimum:0,maximum:1},
          w:{type:"number",minimum:0.02,maximum:0.8},
          h:{type:"number",minimum:0.02,maximum:0.8},
          label:{type:"string"},
          evidence:{type:"string"},
          confidence:{type:"number",minimum:0,maximum:1}
        },
        required:["x","y","w","h","label","evidence","confidence"]
      }
    },
    cautions: {
      type:"array", maxItems:5,
      items:{
        type:"object", additionalProperties:false,
        properties:{
          x:{type:"number",minimum:0,maximum:1},
          y:{type:"number",minimum:0,maximum:1},
          radius:{type:"number",minimum:0.02,maximum:0.35},
          label:{type:"string"}
        },
        required:["x","y","radius","label"]
      }
    }
  },
  required:[
    "can_mark","can_measure","need_better_photo","confidence","connector_type","image_quality",
    "analysis_type","summary","diagnosis","explanation","suggested_action","safety_warning",
    "follow_up_question","required_next_view","expected_reading",
    "black_probe","red_probe","findings","cautions"
  ]
};

const PROMPT = `Sos LOLO, profesor argentino de reparación de celulares. Analizá una FOTO REAL según el objetivo que eligió el alumno.

NO estás limitado a pines de carga. Podés ayudar visualmente con:
- módulos con marco y sin marco;
- display/táctil/sin imagen;
- equipos que no encienden y zonas visibles relacionadas con alimentación;
- conectores, subplacas y circuito de carga;
- buzzer/altavoz, auricular y micrófono;
- botones y flex;
- antenas, coaxiales, SIM y conectores;
- Wi‑Fi y Bluetooth cuando haya antenas/conectores visibles;
- cámaras;
- vibrador;
- huella, proximidad y sensores;
- batería y su conector;
- flex/FPC;
- soldaduras, pads, pistas, corrosión y humedad;
- mediciones con tester.

OBJETIVO VISUAL:
1. Describir SOLO lo que realmente se ve.
2. Marcar con findings las zonas o componentes visibles útiles para el diagnóstico.
3. Cada finding usa x/y como esquina superior izquierda y w/h como tamaño, normalizados 0..1.
4. No diagnosticar un integrado, línea o componente electrónico como dañado únicamente por apariencia.
5. Si la foto no alcanza, decir exactamente qué nueva vista o prueba hace falta.
6. Diferenciar observado, probable y todavía no comprobado.

REGLAS POR TIPO DE TRABAJO:
- MÓDULO SIN MARCO: evaluar estado visible, flex/conectores y zona de montaje; no afirmar que el módulo está defectuoso solo por foto.
- MÓDULO CON MARCO: identificar componentes/flex visibles que deberán transferirse solo si realmente aparecen en la imagen.
- AUDIO: diferenciar buzzer, auricular y micrófono; una foto puede confirmar suciedad, contactos, flex o daño físico, pero no una etapa de audio interna.
- BOTONES: identificar tecla/flex/switch visible; para confirmar continuidad pedir medición desenergizada.
- ANTENA/SEÑAL: identificar coaxiales, contactos, lector SIM o antenas visibles; no diagnosticar RF interno sin pruebas o esquema.
- NO ENCIENDE: usar la foto para identificar batería, conectores, flex, corrosión, golpes o daños visibles; para confirmar consumo o líneas pedir mediciones.
- CARGA: reconocer puerto, subplaca, flex y daño físico, pero no asumir VBUS por ubicación.
- WI-FI/BLUETOOTH: marcar antenas, contactos o coaxiales visibles; separar evidencia visual de fallas internas de RF.
- VIBRADOR/SENSORES: identificar piezas, flex y conectores visibles; no afirmar falla eléctrica sin prueba.
- SOLDADURA/CORROSIÓN: marcar pads levantados, puentes visibles, restos, corrosión o daño mecánico solo cuando haya evidencia visual.
- MEDICIÓN: solo entonces intentar black_probe/red_probe. Preferir test points o pads grandes y seguros.

SEGURIDAD DE MEDICIÓN:
- Continuidad/resistencia: batería y cargador desconectados.
- Voltaje: advertir riesgo de puentear contactos.
- No inventar VBUS/GND.
- can_measure=true SOLO si ambos puntos están suficientemente confirmados.
- Si no hay evidencia suficiente, probes null y explicar qué falta.

SEGURIDAD GENERAL:
- Nunca recomendar perforar, calentar directamente ni puentear una batería de litio.
- No dar temperaturas universales de estación.
- Si la imagen es borrosa, oscura o demasiado lejana: need_better_photo=true.

La salida debe respetar estrictamente el JSON schema.`;

export async function POST(req:Request){
  const gate=await requirePaidAccess();
  if(gate.response)return gate.response;

  try{
    const {imageDataUrl,deviceModel,task,symptom,componentHint,connectorHint,measurement}=await req.json();

    if(!imageDataUrl||typeof imageDataUrl!=="string"||!imageDataUrl.startsWith("data:image/")){
      return NextResponse.json({error:"Falta una imagen válida."},{status:400});
    }
    if(imageDataUrl.length>7_500_000){
      return NextResponse.json({error:"La imagen es demasiado grande. Sacá una foto más liviana o dejá que la app la comprima."},{status:413});
    }

    const normalizedTask=(TASKS as readonly string[]).includes(String(task))?String(task):"diagnose";
    const token=process.env.OPENAI_API_KEY;
    if(!token)return NextResponse.json({error:"LOLO todavía no tiene OPENAI_API_KEY configurada en Railway."},{status:503});

    const client=new OpenAI({apiKey:token});
    const context=`
DATOS DEL ALUMNO:
- Marca/modelo: ${deviceModel||"no informado"}
- Objetivo seleccionado: ${normalizedTask}
- Síntoma/comentario: ${symptom||"no informado"}
- Zona/componente indicado: ${componentHint||"que LOLO lo detecte"}
- Puerto de carga indicado: ${connectorHint||"no informado"}
- Medición solicitada: ${measurement||"ninguna"}

Si el objetivo NO es "measure", no fuerces puntos de tester: black_probe y red_probe pueden ser null.
Si el objetivo ES "measure", seguí estrictamente las reglas de seguridad de medición.
`;

    const response=await client.responses.create({
      model:process.env.LOLO_VISION_MODEL||"gpt-5.6-sol",
      input:[{
        role:"user",
        content:[
          {type:"input_text",text:PROMPT+context},
          {type:"input_image",image_url:imageDataUrl,detail:"high"}
        ]
      }],
      text:{
        format:{
          type:"json_schema",
          name:"lolo_visual_diagnosis",
          strict:true,
          schema:markerSchema
        }
      }
    } as any);

    let data=JSON.parse(response.output_text);

    if(!data||data.need_better_photo||data.image_quality==="poor"||Number(data.confidence)<0.70){
      data={
        ...data,
        can_mark:false,
        can_measure:false,
        black_probe:null,
        red_probe:null,
        findings:[],
        cautions:Array.isArray(data?.cautions)?data.cautions:[]
      };
    }else{
      data.findings=(Array.isArray(data.findings)?data.findings:[])
        .filter((item:any)=>Number(item?.confidence)>=0.70)
        .slice(0,6);
      data.can_mark=data.findings.length>0;

      if(
        normalizedTask!=="measure"||
        Number(data.confidence)<0.80||
        !data.black_probe||
        !data.red_probe
      ){
        data.can_measure=false;
        data.black_probe=null;
        data.red_probe=null;
      }
    }

    return NextResponse.json(data);
  }catch(error:any){
    console.error(error);
    return NextResponse.json({error:error?.message||"Error analizando la imagen"},{status:500});
  }
}
