"use client";

import { useEffect, useRef, useState } from "react";
import FreeLolo3D from "./components/FreeLolo3D";
import AccountPanel,{type AccountSnapshot} from "./components/AccountPanel";


const LOLO_FACE = "data:image/jpeg;base64,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";

const FAST_GREETING_REPLY = "¡Hola! Soy LOLO. Decime qué equipo tenés y qué falla presenta, y arrancamos.";
const isFastGreeting = (value:string) => {
  const q=value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  return /^(hola( lolo)?|buenas( lolo)?|buen dia( lolo)?|buenas tardes( lolo)?|buenas noches( lolo)?|hola profe|lolo)$/.test(q);
};

type ChatMessage = { role: "user" | "assistant"; content: string };
type Marker = { x:number; y:number; label:string; evidence?:string };
type Caution = { x:number; y:number; radius:number; label:string };
type VisualFinding = {
  x:number; y:number; w:number; h:number;
  label:string; evidence:string; confidence:number;
};
type VisionResult = {
  can_mark:boolean; can_measure:boolean; need_better_photo:boolean; confidence:number;
  connector_type:"usb-c"|"micro-usb"|"lightning"|"unknown"; image_quality:"good"|"usable"|"poor";
  analysis_type:string; summary:string; diagnosis:string; explanation:string;
  suggested_action:string; safety_warning:string; follow_up_question:string;
  required_next_view:string; expected_reading:string;
  black_probe:Marker|null; red_probe:Marker|null; findings:VisualFinding[]; cautions:Caution[];
};

const COURSE = [
  ["Diagnóstico general","Cómo recibir un equipo, identificar el síntoma y descartar lo simple antes de abrirlo."],
  ["Herramientas y seguridad","Tester, fuente, estación, cautín, flux, alcohol isopropílico, protección ESD y batería."],
  ["Uso del tester","Voltaje, continuidad, resistencia, diodo y cómo interpretar mediciones sin adivinar."],
  ["No enciende","Secuencia de diagnóstico: batería, consumo, botón power, líneas principales y placa."],
  ["No carga","Cable/cargador, pin de carga, VBUS, subplaca, flex, batería y circuito de carga."],
  ["Cambio de pin de carga","Diagnóstico, retiro, limpieza, colocación, soldadura y prueba final."],
  ["Cambio de módulo sin marco","Desarme, separación, limpieza de adhesivo, prueba previa, alineación y pegado."],
  ["Cambio de módulo con marco","Desarme completo, transferencia de placa/batería/cámaras/flex, cierre y pruebas."],
  ["Pantalla sin imagen","Diferenciar módulo, backlight, flex, conector, alimentación y placa."],
  ["Táctil no funciona","Diferenciar vidrio/táctil, módulo, conector, flex, software y línea de placa."],
  ["Buzzer / altavoz","Diagnóstico del parlante externo, contactos, módulo, pista y etapa de audio."],
  ["Auricular de llamada","Diagnóstico de auricular, malla, contactos, flex, sensor y circuito de audio."],
  ["Micrófono","Pruebas de grabación/llamada, obstrucción, flex/subplaca y línea de micrófono."],
  ["Botón power y volumen","Diferenciar botón mecánico, flex, switch, continuidad y falla de placa."],
  ["Antena y señal","SIM, conectores coaxiales, antena, contactos, subplaca y diagnóstico RF sin adivinar."],
  ["SIM no detectada","Bandeja, lector, contactos, líneas, software y diagnóstico de placa."],
  ["Wi‑Fi y Bluetooth","Descartar software, antenas/conectores y luego circuito de placa."],
  ["Cámaras","Diferenciar cámara dañada, flex/conector, alimentación, software y placa."],
  ["Vibrador","Prueba de motor/vibrador, contactos, flex y circuito de control."],
  ["Huella y sensores","Huella, proximidad, luz, flex y compatibilidad luego de cambiar módulo."],
  ["Batería","Estado físico, voltaje, conector, consumo y criterios de reemplazo seguro."],
  ["Flex y conectores","Cómo revisar, limpiar, medir y reemplazar flex sin dañar conectores FPC."],
  ["Sulfatación y humedad","Inspección, limpieza segura, corrosión, continuidad y recuperación por etapas."],
  ["Soldadura y resoldado","Preparación, flux, soldadura, malla, cautín/aire y control de puentes."],
  ["Diagnóstico final","Prueba completa: carga, audio, señal, cámaras, sensores, botones, Wi‑Fi y cierre."]
] as const;

const REPAIR_TOPICS = [
  {icon:"📱",title:"Cambio de módulo sin marco",prompt:"Quiero aprender a cambiar un módulo sin marco. Guiame desde el diagnóstico y prueba del repuesto hasta la separación, limpieza, alineación, pegado y prueba final."},
  {icon:"🧩",title:"Cambio de módulo con marco",prompt:"Quiero aprender a cambiar un módulo con marco. Guiame con desarme completo, transferencia de componentes, tornillos, flex, batería, cámaras y pruebas finales."},
  {icon:"🔊",title:"Buzzer / altavoz",prompt:"Quiero diagnosticar un celular sin sonido en el buzzer o altavoz. Ayudame a diferenciar parlante, contactos, módulo y circuito de audio paso a paso."},
  {icon:"☎️",title:"Auricular de llamada",prompt:"Quiero diagnosticar un auricular de llamada que no se escucha o se escucha bajo. Guiame paso a paso."},
  {icon:"🎙️",title:"Micrófono",prompt:"Quiero diagnosticar un micrófono que no graba o no se escucha en llamadas. Guiame para diferenciar suciedad, flex, subplaca y placa."},
  {icon:"🔘",title:"Botón power / volumen",prompt:"Quiero diagnosticar un botón power o volumen que no responde. Enseñame a diferenciar botón, flex, switch, continuidad y línea de placa."},
  {icon:"📶",title:"Antena / señal",prompt:"Quiero diagnosticar un celular sin señal o con señal débil. Guiame para revisar SIM, antena, coaxiales, conectores, contactos y placa sin adivinar."},
  {icon:"💳",title:"SIM no detectada",prompt:"Quiero diagnosticar un celular que no detecta SIM. Guiame desde bandeja y lector hasta líneas y placa."},
  {icon:"📡",title:"Wi‑Fi / Bluetooth",prompt:"Quiero diagnosticar Wi‑Fi o Bluetooth que no funciona. Guiame para separar software, antena y falla de placa."},
  {icon:"📷",title:"Cámaras",prompt:"Quiero diagnosticar una cámara que no abre, da error o se ve negra. Guiame paso a paso."},
  {icon:"📳",title:"Vibrador",prompt:"Quiero diagnosticar un vibrador que no funciona. Enseñame cómo revisar motor, contactos, flex y circuito."},
  {icon:"🖐️",title:"Huella y sensores",prompt:"Quiero diagnosticar huella, proximidad o sensores que dejaron de funcionar. Guiame según el modelo y el trabajo realizado."},
  {icon:"⚡",title:"No enciende",prompt:"Tengo un celular que no enciende. Quiero hacer diagnóstico profesional paso a paso sin cambiar piezas al azar."},
  {icon:"🔌",title:"No carga",prompt:"Tengo un celular que no carga. Quiero diagnosticar desde cargador y pin hasta subplaca, flex, batería y circuito de carga."},
  {icon:"🖥️",title:"Sin imagen / sin táctil",prompt:"Quiero diagnosticar un celular que enciende pero no da imagen o no responde el táctil. Guiame para separar módulo, flex, conector y placa."},
  {icon:"🔋",title:"Batería",prompt:"Quiero aprender a diagnosticar batería, conector y consumo de forma segura."},
] as const;

const QUIZ = [
  ["Antes de medir continuidad en VBUS…",["Conecto el cargador","Desconecto cargador y batería","Aplico calor"],1],
  ["Para voltaje de entrada…",["Negra a GND y roja al punto VBUS confirmado","Ambas puntas sobre VBUS","Da igual"],0],
  ["Si LOLO no puede confirmar VBUS en una foto…",["Debe inventar el punto más probable","Debe pedir otra foto/modelo/prueba adicional","Debe marcar cualquier pad grande"],1],
  ["Un pitido entre VBUS y GND…",["Siempre confirma corto","Nunca importa","Debe interpretarse junto con resistencia y circuito"],2],
] as const;

const WORKSHOP_STEPS = [
  {
    title:"1. Diagnóstico visual",
    scene:"inspect",
    text:"Primero observamos. Revisá suciedad, corrosión, golpes, patas flojas y el estado del conector. Todavía no aplicamos calor ni cambiamos nada."
  },
  {
    title:"2. Desconectar batería",
    scene:"battery",
    text:"Antes de soldar o aplicar calor, desconectamos la batería. Este paso reduce el riesgo de cortos y daños durante el trabajo."
  },
  {
    title:"3. Preparar y proteger",
    scene:"protect",
    text:"Sujetamos la placa y protegemos flex, plásticos y componentes cercanos. Usamos flux de forma controlada y preparamos la zona de trabajo."
  },
  {
    title:"4. Retirar el pin de carga",
    scene:"remove",
    text:"Calentamos de manera controlada hasta que la soldadura esté realmente fundida. Recién entonces retiramos el conector sin hacer palanca. La temperatura exacta depende de la estación, aleación y masa térmica."
  },
  {
    title:"5. Limpiar pads",
    scene:"clean",
    text:"Limpiamos la zona, retiramos exceso de soldadura y observamos si hay pads o pistas levantadas. No colocamos el repuesto hasta confirmar que la base está sana."
  },
  {
    title:"6. Colocar y soldar",
    scene:"install",
    text:"Alineamos el conector nuevo, fijamos anclajes y soldamos los contactos. Después inspeccionamos que no haya puentes entre pines."
  },
  {
    title:"7. Medir con tester",
    scene:"measure",
    text:"Antes de energizar, verificamos continuidad o resistencia con batería y cargador desconectados. Para medir voltaje, LOLO necesita confirmar visualmente un punto seguro de masa y el punto de alimentación."
  },
  {
    title:"8. Prueba final",
    scene:"test",
    text:"Terminamos con inspección, prueba de carga y, si corresponde, datos. Si algo no responde como esperamos, volvemos al diagnóstico en vez de cambiar piezas al azar."
  }
] as const;


type AvatarMode = "idle"|"listening"|"thinking"|"speaking"|"pointing";

let premiumRobotPromise: Promise<string>|null = null;
function loadPremiumRobot(){
  if(!premiumRobotPromise){
    premiumRobotPromise=Promise.all([1,2,3,4].map(n=>fetch(`/robot/chunk${n}.txt?v=19`).then(r=>{
      if(!r.ok) throw new Error("No se pudo cargar LOLO");
      return r.text();
    }))).then(parts=>"data:image/webp;base64,"+parts.join(""));
  }
  return premiumRobotPromise;
}

function LoloAvatar({mode="idle",compact=false,stage=false}:{mode?:AvatarMode;compact?:boolean;stage?:boolean}){
  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PROCESANDO":mode==="speaking"?"HABLANDO":mode==="pointing"?"ANALIZANDO":"EN LÍNEA";
  const [robotSrc,setRobotSrc]=useState("");
  useEffect(()=>{
    let active=true;
    loadPremiumRobot().then(src=>{if(active)setRobotSrc(src)}).catch(()=>{});
    return()=>{active=false};
  },[]);
  return <div className={"loloAvatar premiumRobot "+mode+(compact?" compact":"")+(stage?" stage":"")} aria-label={"LOLO robot "+label.toLowerCase()}>
    <div className="premiumRobotVisual">
      {robotSrc
        ? <img src={robotSrc} alt="LOLO, robot técnico IA"/>
        : <div className="premiumRobotLoading"><b>LOLO</b><span>iniciando IA…</span></div>}
      <div className="premiumTopMask"></div>
      <div className="premiumStateGlow"></div>
      <div className="premiumScanLine"></div>
      <div className="premiumVoiceBars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div className="premiumThinkDots" aria-hidden="true"><i></i><i></i><i></i></div>
    </div>
    <span className="avatarStatus">{label}</span>
  </div>
}

export default function Page() {
  const [tab,setTab]=useState("home");
  const [speaking,setSpeaking]=useState(false);
  const [caption,setCaption]=useState("Hola, soy LOLO. Subime una foto de tu placa y te ayudo a medir sin adivinar.");
  const [messages,setMessages]=useState<ChatMessage[]>([{role:"assistant",content:"Hola, soy LOLO. Hablame como a tu profe del taller: contame qué equipo tenés, qué falla hace y qué querés aprender. Vamos paso a paso."}]);
  const messagesRef=useRef<ChatMessage[]>([{role:"assistant",content:"Hola, soy LOLO. Hablame como a tu profe del taller: contame qué equipo tenés, qué falla hace y qué querés aprender. Vamos paso a paso."}]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [micError,setMicError]=useState("");
  const [image,setImage]=useState("");
  const [deviceModel,setDeviceModel]=useState("");
  const [visionTask,setVisionTask]=useState("diagnose");
  const [symptom,setSymptom]=useState("");
  const [componentHint,setComponentHint]=useState("auto");
  const [connector,setConnector]=useState("auto");
  const [measurement,setMeasurement]=useState("voltage");
  const [vision,setVision]=useState<VisionResult|null>(null);
  const [visionError,setVisionError]=useState("");
  const [progress,setProgress]=useState<number[]>([]);
  const [workshopStep,setWorkshopStep]=useState(0);
  const [workshopRunning,setWorkshopRunning]=useState(false);
  const [voiceMode,setVoiceMode]=useState<"ai"|"device">("ai");
  const [deviceVoice,setDeviceVoice]=useState("");
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
  const [installPrompt,setInstallPrompt]=useState<any>(null);
  const [installHelp,setInstallHelp]=useState(false);
  const [isInstalled,setIsInstalled]=useState(false);
  const imageRef=useRef<HTMLImageElement|null>(null);
  const stageRef=useRef<HTMLDivElement|null>(null);
  const [imageBox,setImageBox]=useState({left:0,top:0,width:0,height:0});
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const greetingAudioRef=useRef<HTMLAudioElement|null>(null);
  const speechSeqRef=useRef(0);
  const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
  const speechGapTimerRef=useRef<number|null>(null);
  const [recording,setRecording]=useState(false);
  const [conversationMode,setConversationMode]=useState(true);
  const [paymentEmail,setPaymentEmail]=useState("");
  const paymentEmailRef=useRef<HTMLInputElement|null>(null);
  const [paymentBusy,setPaymentBusy]=useState<"monthly"|"lifetime"|null>(null);
  const [paymentError,setPaymentError]=useState("");
  const [mpConfigured,setMpConfigured]=useState(false);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const micStreamRef=useRef<MediaStream|null>(null);
  const micChunksRef=useRef<Blob[]>([]);
  const micRafRef=useRef<number|null>(null);
  const micAudioCtxRef=useRef<AudioContext|null>(null);
  const chatRef=useRef<HTMLDivElement|null>(null);
  const [account,setAccount]=useState<AccountSnapshot|null>(null);
  const [trialAvailable,setTrialAvailable]=useState(false);
  const [trialUsed,setTrialUsed]=useState(false);

  useEffect(()=>{
    let alive=true;
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),8000);

    const loadAccount=async()=>{
      try{
        const r=await fetch("/api/auth/me",{cache:"no-store",signal:controller.signal});
        const j=await r.json();
        if(!alive)return;
        setAccount(j);
        if(!j?.authenticated||!j?.access?.active)setTab("settings");
      }catch{
        if(!alive)return;
        setAccount({
          authenticated:false,
          access:{active:false,plan:null,status:"unpaid",label:"Sin acceso activo"}
        });
        setTab("settings");
      }finally{
        window.clearTimeout(timeout);
      }
    };

    void loadAccount();
    return()=>{
      alive=false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  },[]);

  useEffect(()=>{
    let alive=true;
    fetch("/api/trial/status",{cache:"no-store"})
      .then(r=>r.json())
      .then(j=>{
        if(!alive)return;
        setTrialAvailable(Boolean(j?.available));
        setTrialUsed(Boolean(j?.used));
      })
      .catch(()=>{if(alive){setTrialAvailable(false);setTrialUsed(true)}});
    return()=>{alive=false};
  },[]);

  useEffect(()=>{
    const saved=localStorage.getItem("lolo.progress");
    if(saved) try{setProgress(JSON.parse(saved))}catch{}
    if("serviceWorker" in navigator) {
      let refreshing=false;
      const onControllerChange=()=>{
        if(refreshing)return;
        refreshing=true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange",onControllerChange);
      navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"})
        .then(reg=>reg.update())
        .catch(()=>{});
    }

    const standalone=
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as any).standalone===true;
    setIsInstalled(Boolean(standalone));

    const beforeInstall=(e:any)=>{
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installed=()=>{
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallHelp(false);
    };

    window.addEventListener("beforeinstallprompt",beforeInstall);
    window.addEventListener("appinstalled",installed);
    return()=>{
      window.removeEventListener("beforeinstallprompt",beforeInstall);
      window.removeEventListener("appinstalled",installed);
    };
  },[]);

  useEffect(()=>{
    if(voiceMode==="device") return;
    let cancelled=false;
    const warmGreeting=async()=>{
      try{
        const r=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:FAST_GREETING_REPLY})});
        if(!r.ok)return;
        const j=await r.json();
        if(cancelled||!j.audio)return;
        const audio=new Audio(`data:${j.mime||"audio/mpeg"};base64,${j.audio}`);
        audio.preload="auto";
        audio.load();
        greetingAudioRef.current=audio;
      }catch{}
    };
    const timer=window.setTimeout(warmGreeting,700);
    return()=>{cancelled=true;window.clearTimeout(timer)};
  },[]);

  useEffect(()=>{
    if(!("speechSynthesis" in window)) return;
    const load=()=>{
      const vs=window.speechSynthesis.getVoices();
      setVoices(vs);
      if(!deviceVoice && vs.length){
        const hints=["Pablo","Jorge","Diego","Carlos","Miguel","Juan","Antonio","Mario","Javier","Sergio","Onyx","Male"];
        const spanish=vs.filter(v=>v.lang.toLowerCase().startsWith("es"));
        const pool=spanish.length?spanish:vs;
        const choice=pool.find(v=>hints.some(h=>v.name.toLowerCase().includes(h.toLowerCase())))||pool[0];
        if(choice)setDeviceVoice(choice.name);
      }
    };
    load();window.speechSynthesis.onvoiceschanged=load;
  },[deviceVoice]);

  useEffect(()=>{messagesRef.current=messages},[messages]);

  useEffect(()=>{
    fetch("/api/payments/status")
      .then(r=>r.json())
      .then(j=>setMpConfigured(Boolean(j.configured)))
      .catch(()=>setMpConfigured(false));
  },[]);

  useEffect(()=>{
    const el=chatRef.current;
    if(el) el.scrollTo({top:el.scrollHeight,behavior:"smooth"});
  },[messages,busy]);

  useEffect(()=>{
    const recalc=()=>{
      const img=imageRef.current,stage=stageRef.current;if(!img||!stage||!image)return;
      const a=img.getBoundingClientRect(),b=stage.getBoundingClientRect();
      setImageBox({left:a.left-b.left,top:a.top-b.top,width:a.width,height:a.height});
    };
    recalc();window.addEventListener("resize",recalc);
    return()=>window.removeEventListener("resize",recalc);
  },[image,vision]);

  const hasAccess=Boolean(account?.authenticated&&account?.access?.active);
  const canTalk=hasAccess||trialAvailable;
  const nav=(id:string)=>{
    if(id==="talk"&&!canTalk){setTab("settings");return}
    const protectedTabs=["plate","learn","workshop"];
    if(protectedTabs.includes(id)&&!hasAccess){setTab("settings");return}
    setTab(id);
  };

  const installLolo=async()=>{
    if(isInstalled)return;
    if(installPrompt){
      try{
        await installPrompt.prompt();
        const choice=await installPrompt.userChoice;
        if(choice?.outcome==="accepted"){
          setInstallPrompt(null);
          return;
        }
      }catch{}
    }
    setInstallHelp(true);
  };

  const stopVoice=()=>{
    speechSeqRef.current++;
    if(speechGapTimerRef.current!==null){
      window.clearTimeout(speechGapTimerRef.current);
      speechGapTimerRef.current=null;
    }
    utteranceRef.current=null;
    if("speechSynthesis" in window) window.speechSynthesis.cancel();
    if(audioRef.current){
      audioRef.current.oncanplay=null;
      audioRef.current.onended=null;
      audioRef.current.onerror=null;
      audioRef.current.pause();
      try{audioRef.current.currentTime=0}catch{}
      audioRef.current=null;
    }
    setSpeaking(false);
  };

  const browserSpeak=(text:string)=>new Promise<void>((resolve)=>{
    if(!("speechSynthesis" in window)){resolve();return}

    const synth=window.speechSynthesis;
    synth.cancel();

    const maleHints=["Pablo","Jorge","Diego","Carlos","Miguel","Juan","Antonio","Mario","Javier","Sergio","Male"];
    const selected=voices.find(v=>v.name===deviceVoice);
    const male=voices.find(v=>v.lang.toLowerCase().startsWith("es")&&maleHints.some(h=>v.name.toLowerCase().includes(h.toLowerCase())));
    const spanish=voices.find(v=>v.lang.toLowerCase().startsWith("es"));
    const voice=selected||male||spanish||voices[0];

    if(!voice){
      setMicError("El teléfono todavía no cargó una voz. Tocá Probar voz de nuevo.");
      resolve();
      return;
    }

    const seq=speechSeqRef.current;
    const clean=String(text||"").replace(/\s+/g," ").trim();

    // Android/PWA can cut long SpeechSynthesisUtterance objects.
    // Speak short chunks sequentially and keep a strong JS reference to each one.
    const sentences=(clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[clean])
      .map(x=>x.trim())
      .filter(Boolean);

    const chunks:string[]=[];
    for(const sentence of sentences){
      if(sentence.length<=145){
        chunks.push(sentence);
        continue;
      }
      let rest=sentence;
      while(rest.length>145){
        let cut=rest.lastIndexOf(" ",145);
        if(cut<75)cut=145;
        chunks.push(rest.slice(0,cut).trim());
        rest=rest.slice(cut).trim();
      }
      if(rest)chunks.push(rest);
    }

    if(!chunks.length){resolve();return}

    setSpeaking(true);
    let index=0;
    let finished=false;

    const finish=()=>{
      if(finished)return;
      finished=true;
      utteranceRef.current=null;
      if(speechGapTimerRef.current!==null){
        window.clearTimeout(speechGapTimerRef.current);
        speechGapTimerRef.current=null;
      }
      if(seq===speechSeqRef.current)setSpeaking(false);
      resolve();
    };

    const speakNext=()=>{
      if(seq!==speechSeqRef.current){finish();return}
      if(index>=chunks.length){finish();return}

      const u=new SpeechSynthesisUtterance(chunks[index++]);
      utteranceRef.current=u;
      u.voice=voice;
      u.lang=voice.lang||"es-AR";
      u.rate=1.04;
      u.pitch=.94;
      u.volume=1;

      u.onstart=()=>{
        if(seq===speechSeqRef.current)setSpeaking(true);
      };
      u.onend=()=>{
        if(seq!==speechSeqRef.current){finish();return}
        speechGapTimerRef.current=window.setTimeout(()=>{
          speechGapTimerRef.current=null;
          speakNext();
        },70);
      };
      u.onerror=()=>{
        // If one chunk fails, continue with the next instead of losing the whole answer.
        if(seq!==speechSeqRef.current){finish();return}
        speechGapTimerRef.current=window.setTimeout(()=>{
          speechGapTimerRef.current=null;
          speakNext();
        },100);
      };

      synth.speak(u);
    };

    speakNext();
  });

  const speak=async(text:string)=>{
    setCaption(text.slice(0,190)+(text.length>190?"…":""));
    stopVoice();
    const seq=++speechSeqRef.current;

    if(voiceMode==="device"){
      await browserSpeak(text);
      return;
    }

    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)return;

    // Generamos la voz IA en bloques completos para evitar cortes en respuestas largas.
    const pieces:string[]=[];
    let rest=clean;
    const maxChars=2200;
    while(rest.length>maxChars){
      let cut=Math.max(
        rest.lastIndexOf(". ",maxChars),
        rest.lastIndexOf("? ",maxChars),
        rest.lastIndexOf("! ",maxChars),
        rest.lastIndexOf("; ",maxChars),
        rest.lastIndexOf(", ",maxChars)
      );
      if(cut<900)cut=rest.lastIndexOf(" ",maxChars);
      if(cut<700)cut=maxChars;
      pieces.push(rest.slice(0,cut+1).trim());
      rest=rest.slice(cut+1).trim();
    }
    if(rest)pieces.push(rest);

    setSpeaking(true);
    try{
      for(const piece of pieces){
        if(seq!==speechSeqRef.current)return;

        const r=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:piece})});
        const j=await r.json();
        if(seq!==speechSeqRef.current)return;
        if(!r.ok||!j.audio)throw new Error(j.error||"No se pudo generar la voz de LOLO");

        if("speechSynthesis" in window)window.speechSynthesis.cancel();
        audioRef.current?.pause();

        const binary=atob(j.audio);
        const bytes=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
        const url=URL.createObjectURL(new Blob([bytes],{type:j.mime||"audio/mpeg"}));

        const audio=new Audio();
        audio.preload="auto";
        audio.playbackRate=1.03;
        audio.volume=1;
        audio.src=url;
        audioRef.current=audio;

        await new Promise<void>((resolve,reject)=>{
          let settled=false;
          const cleanup=()=>{try{URL.revokeObjectURL(url)}catch{}};
          const done=()=>{
            if(settled)return;
            settled=true;
            cleanup();
            if(seq===speechSeqRef.current)audioRef.current=null;
            resolve();
          };
          const fail=()=>{
            if(settled)return;
            settled=true;
            cleanup();
            if(seq===speechSeqRef.current)audioRef.current=null;
            reject(new Error("La voz IA no pudo reproducirse."));
          };
          audio.onended=done;
          audio.onerror=fail;
          const begin=()=>{
            if(seq!==speechSeqRef.current){done();return}
            audio.play().catch(fail);
          };
          if(audio.readyState>=3)begin();
          else audio.addEventListener("canplay",begin,{once:true});
          audio.load();
        });
      }
      if(seq===speechSeqRef.current)setSpeaking(false);
    }catch(e:any){
      if(seq===speechSeqRef.current){
        setSpeaking(false);
        setMicError("La voz IA no pudo reproducirse. Tocá Probar voz o volvé a intentar.");
      }
    }
  };

  const playFastGreeting=async()=>{
    setCaption(FAST_GREETING_REPLY);
    stopVoice();
    const seq=++speechSeqRef.current;

    if(voiceMode==="device"){
      await browserSpeak(FAST_GREETING_REPLY);
      return;
    }

    const prepared=greetingAudioRef.current;
    if(!prepared){await speak(FAST_GREETING_REPLY);return}

    const audio=prepared.cloneNode(true) as HTMLAudioElement;
    audio.playbackRate=1.1;
    audio.volume=1;
    audioRef.current=audio;
    setSpeaking(true);
    await new Promise<void>((resolve)=>{
      const done=()=>{
        if(seq===speechSeqRef.current){setSpeaking(false);audioRef.current=null}
        resolve();
      };
      audio.onended=done;
      audio.onerror=done;
      audio.play().catch(done);
    });
  };

  const sendChat=async(text=input,fromVoice=false)=>{
    const q=text.trim();if(!q||busy)return;
    if(!hasAccess&&!trialAvailable){setTrialUsed(true);setTab("settings");return}
    const next=[...messagesRef.current,{role:"user",content:q} as ChatMessage];
    messagesRef.current=next;setMessages(next);setInput("");
    if(isFastGreeting(q)){
      const answered=[...next,{role:"assistant",content:FAST_GREETING_REPLY} as ChatMessage];
      messagesRef.current=answered;setMessages(answered);
      await playFastGreeting();
      if(fromVoice&&conversationMode) window.setTimeout(()=>void startMic(),450);
      return;
    }
    setBusy(true);
    setCaption("Estoy pensando cómo explicártelo…");
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
      const j=await r.json();
      if(!r.ok){
        if(j?.code==="TRIAL_USED"){
          setTrialAvailable(false);
          setTrialUsed(true);
          setTab("settings");
          return;
        }
        throw new Error(j.error||"Error");
      }
      const ans=j.text||"No pude responder.";
      if(j.trial){
        setTrialAvailable(false);
        setTrialUsed(true);
      }
      const answered=[...next,{role:"assistant",content:ans} as ChatMessage];
      messagesRef.current=answered;setMessages(answered);
      setBusy(false);
      await speak(ans);
      if(fromVoice&&conversationMode) window.setTimeout(()=>void startMic(),450);
    }catch(e:any){
      const ans="No pude conectar con la IA en este momento. "+(e?.message||"");
      const failed=[...next,{role:"assistant",content:ans} as ChatMessage];
      messagesRef.current=failed;setMessages(failed);
      setBusy(false);
    }
  };

  const cleanupMicMonitor=()=>{
    if(micRafRef.current!==null){cancelAnimationFrame(micRafRef.current);micRafRef.current=null}
    if(micAudioCtxRef.current){micAudioCtxRef.current.close().catch(()=>{});micAudioCtxRef.current=null}
  };

  const startMic=async()=>{
    setMicError("");
    if(recording){
      if(recorderRef.current?.state==="recording") recorderRef.current.stop();
      return;
    }
    if(speaking||audioRef.current){
      stopVoice();
    }
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){
      setMicError("Este navegador no permite grabar audio. Probá Chrome actualizado en Android.");
      return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      micStreamRef.current=stream;
      const preferred=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":"";
      const rec=preferred?new MediaRecorder(stream,{mimeType:preferred}):new MediaRecorder(stream);
      recorderRef.current=rec;
      micChunksRef.current=[];
      let heardVoice=false;
      let lastVoice=Date.now();
      const startedAt=Date.now();
      let noiseFloor=.006;
      let noiseSamples=0;

      rec.ondataavailable=(e:BlobEvent)=>{if(e.data.size>0)micChunksRef.current.push(e.data)};
      rec.onstop=async()=>{
        cleanupMicMonitor();
        setRecording(false);
        micStreamRef.current?.getTracks().forEach(t=>t.stop());
        const rawType=(rec.mimeType||preferred||"audio/webm").split(";")[0].toLowerCase();
        const blob=new Blob(micChunksRef.current,{type:rawType});
        if(blob.size<1200){
          setCaption("No llegué a escucharte. Tocá el micrófono y hablame de nuevo.");
          setMicError("La grabación quedó demasiado corta.");
          return;
        }
        setCaption("Entendiendo lo que me dijiste…");
        setBusy(true);
        try{
          const ext=rawType.includes("mp4")?"m4a":rawType.includes("mpeg")?"mp3":rawType.includes("ogg")?"ogg":"webm";
          const fd=new FormData();
          fd.append("audio",new File([blob],`voz-lolo.${ext}`,{type:rawType||"audio/webm"}));
          const r=await fetch("/api/transcribe",{method:"POST",body:fd});
          const j=await r.json();if(!r.ok)throw new Error(j.error||"No pude transcribir");
          const text=(j.text||"").trim();
          setBusy(false);
          if(!text){setMicError("No pude entender lo que dijiste.");return}
          await sendChat(text,true);
        }catch(e:any){
          setBusy(false);
          setMicError(e?.message||"No pude procesar tu voz. Tocá el micrófono y probá de nuevo.");
        }
      };

      rec.start();
      setRecording(true);
      setCaption("Te escucho… hablame normal. Cuando termines, LOLO lo detecta solo.");

      const AC=(window as any).AudioContext||(window as any).webkitAudioContext;
      if(AC){
        const ctx:AudioContext=new AC();
        micAudioCtxRef.current=ctx;
        const src=ctx.createMediaStreamSource(stream);
        const analyser=ctx.createAnalyser();
        analyser.fftSize=512;
        src.connect(analyser);
        const data=new Uint8Array(analyser.fftSize);
        const monitor=()=>{
          if(rec.state!=="recording")return;
          analyser.getByteTimeDomainData(data);
          let sum=0;
          for(const v of data){const n=(v-128)/128;sum+=n*n}
          const rms=Math.sqrt(sum/data.length);
          const now=Date.now();
          const elapsed=now-startedAt;
          if(elapsed<550){
            noiseFloor=(noiseFloor*noiseSamples+rms)/(noiseSamples+1);
            noiseSamples++;
          }
          const threshold=Math.max(.012,noiseFloor*2.15);
          if(rms>threshold){heardVoice=true;lastVoice=now}
          if(heardVoice&&now-lastVoice>950&&elapsed>1200){rec.stop();return}
          if(!heardVoice&&elapsed>5500){rec.stop();return}
          if(elapsed>12000){rec.stop();return}
          micRafRef.current=requestAnimationFrame(monitor);
        };
        micRafRef.current=requestAnimationFrame(monitor);
      }else{
        heardVoice=true;
        window.setTimeout(()=>{if(rec.state==="recording")rec.stop()},15000);
      }
    }catch{
      cleanupMicMonitor();
      setRecording(false);
      setMicError("El micrófono está bloqueado. Permitilo desde la configuración del sitio.");
    }
  };

  const compressImage=(file:File)=>new Promise<string>((resolve,reject)=>{
    const img=new Image();const url=URL.createObjectURL(file);
    img.onload=()=>{
      const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
      const ctx=c.getContext("2d");if(!ctx){reject(new Error("canvas"));return}
      ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);resolve(c.toDataURL("image/jpeg",.84));
    };img.onerror=reject;img.src=url;
  });

  const loadPhoto=async(file?:File,nextTab:"plate"|"workshop"="plate")=>{
    if(!file)return;setVision(null);setVisionError("");
    try{
      setImage(await compressImage(file));
      setTab(nextTab);
      setCaption(nextTab==="workshop"
        ?"Foto real cargada en el Taller. LOLO va a trabajar visualmente sobre esta imagen."
        :"Foto cargada. Completá los datos y tocá Analizar con visión IA.");
    }catch{setVisionError("No pude abrir esa imagen.")}
  };

  const analyze=async()=>{
    if(!image||busy)return;setBusy(true);setVisionError("");setVision(null);
    try{
      const r=await fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        imageDataUrl:image,
        deviceModel,
        task:visionTask,
        symptom,
        componentHint,
        connectorHint:visionTask==="charging"?connector:"auto",
        measurement:visionTask==="measure"?measurement:"none"
      })});
      const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");
      setVision(j);
      const spoken=`${j.summary} ${j.diagnosis||""} ${j.explanation||""} ${j.safety_warning||""} ${j.follow_up_question||""}`;
      speak(spoken);
    }catch(e:any){setVisionError(e?.message||"No se pudo analizar la imagen.")}
    finally{setBusy(false)}
  };

  const startPayment=async(plan:"monthly"|"lifetime")=>{
    setPaymentError("");
    const email=(paymentEmailRef.current?.value||paymentEmail||"").trim().toLowerCase();
    setPaymentEmail(email);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setPaymentError("Ingresá un correo válido. Ese correo se usará para vincular el acceso del alumno.");
      return;
    }
    setPaymentBusy(plan);
    try{
      const r=await fetch("/api/payments/create",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({plan,email})
      });
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"No pude iniciar el pago.");
      if(!j.url) throw new Error("Mercado Pago no devolvió un enlace de pago.");
      window.location.href=j.url;
    }catch(e:any){
      setPaymentError(e?.message||"No pude iniciar Mercado Pago.");
      setPaymentBusy(null);
    }
  };

  const markerStyle=(m:Marker)=>({left:imageBox.left+m.x*imageBox.width,top:imageBox.top+m.y*imageBox.height});
  const cautionStyle=(c:Caution)=>({
    left:imageBox.left+c.x*imageBox.width,top:imageBox.top+c.y*imageBox.height,
    width:Math.max(45,c.radius*2*imageBox.width),height:Math.max(45,c.radius*2*imageBox.width)
  });
  const findingStyle=(f:VisualFinding)=>({
    left:imageBox.left+f.x*imageBox.width,
    top:imageBox.top+f.y*imageBox.height,
    width:Math.max(34,f.w*imageBox.width),
    height:Math.max(34,f.h*imageBox.height)
  });

  const runWorkshopStep=async(i:number)=>{
    const n=Math.max(0,Math.min(WORKSHOP_STEPS.length-1,i));
    setWorkshopStep(n);
    setWorkshopRunning(true);
    const step=WORKSHOP_STEPS[n];
    setCaption(step.title+" — "+step.text);
    await speak(step.text);
    window.setTimeout(()=>setWorkshopRunning(false),Math.max(2800,step.text.length*38));
  };

  const toggleStep=(i:number)=>{
    const n=progress.includes(i)?progress.filter(x=>x!==i):[...progress,i];
    setProgress(n);localStorage.setItem("lolo.progress",JSON.stringify(n));
  };

  return <main className="app">
    <header>
      <div className="headerBrand">
        <img className="headerBrandIcon" src="/icon.svg" alt="LOLO"/>
        <div className="headerBrandCopy">
          <div className="logo">LOLO</div>
          <div className="muted small">Reparación de celulares con IA</div>
          <div className="creatorCredit">Creado por <b>Christian Alonso</b></div>
        </div>
      </div>
      <div className="status"><span className={"dot "+(busy?"":"on")}></span>{busy?"Procesando…":"Listo"}</div>
    </header>

    {tab!=="talk"&&<div className={"hero tutorHero "+(speaking?"speaking ":"")+(recording?"listening ":"")+(busy?"thinking ":"")}>
      <LoloAvatar mode={recording?"listening":busy?"thinking":speaking?"speaking":(tab==="plate"&&vision?.can_mark)?"pointing":"idle"}/>
      <div className="heroWords">
        <div className="caption">{caption}</div>
        <div className="wave"><i></i><i></i><i></i><i></i></div>
      </div>
    </div>}

    <section className={"section "+(tab==="home"?"active":"")}>
      <div className="panel brandShowcase">
        <img src="/logo-lolo.svg" alt="LOLO - Reparación de celulares con IA"/>
      </div>
      {!hasAccess&&<div className="panel trialWelcome">
        <div><span className="trialPill">PRUEBA GRATIS</span><h2>Probá LOLO antes de pagar</h2><p>Hacé <b>una consulta real gratis</b> y recibí la respuesta de LOLO. Para seguir conversando después, elegís un plan.</p></div>
        <button className="btn primary" onClick={()=>nav("talk")} disabled={!trialAvailable}>{trialAvailable?"🤖 Hacer mi consulta gratis":"✓ Consulta gratis utilizada"}</button>
      </div>}
      <div className="panel"><h2>LOLO completo</h2>
        <div className="grid">
          <button className="card" onClick={()=>nav("plate")}><b>📷 Analizar tu placa</b><span className="muted small">Visión IA + marcas automáticas</span></button>
          <button className="card" onClick={()=>nav("talk")}><b>🎤 Hablar con LOLO</b><span className="muted small">Chat + micrófono + voz</span></button>
          <button className="card workshopCard" onClick={()=>nav("learn")}><b>📘 Aprender con LOLO</b><span className="muted small">Módulos, audio, señal, botones, tester, soldadura y diagnóstico</span></button>
          <button className="card" onClick={()=>nav("settings")}><b>💳 Planes LOLO</b><span className="muted small">$12.000 mensual o $120.000 permanente</span></button>
        </div>
      </div>
      <div className="panel"><div className="tip good"><b>Regla de LOLO:</b> si la IA no puede justificar visualmente dónde está VBUS, no marca un punto. Te pide una foto mejor, modelo, esquema o una prueba adicional.</div></div>
      <div className="panel installLoloCard">
        <div className="installLoloIcon">📲</div>
        <div className="installLoloCopy">
          <span className="installEyebrow">LOLO EN TU CELULAR</span>
          <h3>¿Querés tener la aplicación en tu celular?</h3>
          <p>{isInstalled
            ?"LOLO ya está instalada en este dispositivo."
            :"Instalala y te queda un ícono en la pantalla principal, como cualquier otra app."}</p>
        </div>
        <button className={"btn primary installLoloBtn "+(isInstalled?"installed":"")} onClick={()=>void installLolo()} disabled={isInstalled}>
          {isInstalled?"✓ LOLO instalada":"⬇ Instalar aplicación"}
        </button>
      </div>
    </section>

    <section className={"section "+(tab==="talk"&&canTalk?"active":"")}>
      <div className="panel interactiveTutor">
        <div className="interactiveTitle">
          <div>
            <h2>Hablá con LOLO</h2>
            <p className="muted">Como si estuvieras en el taller con tu profesor. Preguntá, respondé y seguí el diagnóstico conversando.</p>
          </div>
          <span className={"talkState "+(recording?"listen":speaking?"speak":busy?"think":"ready")}>{recording?"Te escucho":speaking?"Te respondo":busy?"Pensando":"Listo para hablar"}</span>
        </div>

        {!hasAccess&&<div className="trialBanner"><b>🎁 Tu consulta gratis</b><span>Escribí una pregunta. LOLO te responde una vez sin pagar.</span></div>}
        {micError&&<div className="notice">{micError}</div>}

        <FreeLolo3D
          mode={recording?"listening":busy?"thinking":speaking?"speaking":"idle"}
          caption={caption}
        />

        <button className={"bigMic "+(recording?"on":"")} onClick={()=>{if(hasAccess)void startMic();else setMicError("La prueba gratis es por texto. Para hablar por voz, activá un plan.")}} disabled={busy}>
          <span>{recording?"■":"🎤"}</span>
          <b>{recording?"Terminar ahora":"Hablar con LOLO"}</b>
          <small>{recording?"Podés tocar para cortar antes":"Tocá una vez, hablá y LOLO detecta cuando terminás"}</small>
        </button>

        <label className="conversationToggle">
          <input type="checkbox" checked={conversationMode} onChange={e=>setConversationMode(e.target.checked)}/>
          <span><b>Conversación continua</b><small>{conversationMode?"Después de responder, LOLO vuelve a escucharte.":"LOLO espera que vuelvas a tocar el micrófono."}</small></span>
        </label>

        <div className="quickPrompts">
          {["Mi celular no carga","Mi celular no enciende","Quiero cambiar un módulo","No tengo sonido","No tengo señal","No funciona el botón power"].map(q=>
            <button className="quickChip" key={q} onClick={()=>void sendChat(q)} disabled={busy}>{q}</button>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="chatHeader"><b>Conversación con LOLO</b><span className="muted small">{messages.length} mensajes</span></div>
        <div className="chat tutorChat" ref={chatRef}>
          {messages.map((m,i)=><div key={i} className={"msg "+(m.role==="assistant"?"bot":"user")}>{m.content}</div>)}
          {busy&&<div className="msg bot thinkingMsg"><span></span><span></span><span></span></div>}
        </div>
        <div className="composer">
          <button className={"circle "+(recording?"on":"")} onClick={()=>void startMic()} title="Hablar">{recording?"■":"🎤"}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void sendChat()}} placeholder={!hasAccess?"Escribí tu pregunta gratis para LOLO":"También podés escribirle a LOLO"}/>
          <label className="circle photoButton" style={{display:"grid",placeItems:"center"}} title="Sacar foto">📷<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <label className="circle galleryButton" style={{display:"grid",placeItems:"center"}} title="Subir imagen">🖼️<input hidden type="file" accept="image/*" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <button className="circle" onClick={()=>void sendChat()} disabled={busy}>➤</button>
        </div>
        {!hasAccess&&trialUsed
          ? <div className="trialFinished"><b>✓ Ya probaste a LOLO</b><span>Para hacer otra pregunta, usar voz, analizar placas y acceder a las clases, activá un plan.</span><button className="btn primary" onClick={()=>setTab("settings")}>Ver planes LOLO</button></div>
          : <div className="talkHint">{hasAccess?"Si LOLO necesita ver la placa, te va a pedir una foto. La podés sacar o subir desde acá.":"Tu primera consulta por texto es gratis. Después elegís si querés continuar con LOLO."}</div>}
      </div>
    </section>

    <section className={"section "+(tab==="plate"&&hasAccess?"active":"")}>
      <div className="panel"><h2>Tu placa + visión IA</h2>
        <p className="muted">Sacá una foto enfocada de la zona que querés revisar. LOLO puede analizar módulos, conectores, flex, botones, audio, antena, batería, soldadura, corrosión y otras fallas visibles. Si el diagnóstico necesita mediciones o una vista distinta, te va a pedir el siguiente paso sin inventar.</p>
        <div className="uploadActions">
          <label className="btn primary">📷 Sacar foto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <label className="btn">🖼️ Subir imagen<input hidden type="file" accept="image/*" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
        </div>
        <div ref={stageRef} className="photoStage" style={{marginTop:10}}>
          {!image&&<span className="muted">Todavía no cargaste una foto.</span>}
          {image&&<img ref={imageRef} onLoad={()=>window.dispatchEvent(new Event("resize"))} src={image} alt="Placa a analizar"/>}
          {vision?.can_mark&&vision.black_probe&&<div className="marker black" data-label={vision.black_probe.label} style={markerStyle(vision.black_probe)}>N</div>}
          {vision?.can_mark&&vision.red_probe&&<div className="marker red" data-label={vision.red_probe.label} style={markerStyle(vision.red_probe)}>R</div>}
          {vision?.cautions?.map((c,i)=><div key={"c"+i} className="cautionCircle" style={cautionStyle(c)} title={c.label}/>)}
          {vision?.can_mark&&vision.findings?.map((f,i)=><div key={"f"+i} className="findingBox" style={findingStyle(f)}><span>{i+1}</span><b>{f.label}</b></div>)}
        </div>

        {image&&<>
          <div className="visionTaskPanel" style={{marginTop:10}}>
            <div className="field"><label>Marca / modelo</label><input value={deviceModel} onChange={e=>setDeviceModel(e.target.value)} placeholder="Ej.: Samsung A03, Moto E14, iPhone 11"/></div>

            <div className="field">
              <label>¿Qué querés revisar?</label>
              <select value={visionTask} onChange={e=>setVisionTask(e.target.value)}>
                <option value="diagnose">Diagnóstico general de la falla</option>
                <option value="module_no_frame">Cambio de módulo sin marco</option>
                <option value="module_frame">Cambio de módulo con marco</option>
                <option value="display_touch">Pantalla / táctil / sin imagen</option>
                <option value="power">No enciende / consumo / encendido</option>
                <option value="charging">Carga / pin / subplaca / circuito de carga</option>
                <option value="audio_buzzer">Buzzer / altavoz</option>
                <option value="audio_earpiece">Auricular de llamada</option>
                <option value="microphone">Micrófono</option>
                <option value="buttons">Botón power / volumen</option>
                <option value="signal">Antena / señal / coaxial</option>
                <option value="sim">SIM / lector SIM</option>
                <option value="wifi">Wi‑Fi / Bluetooth</option>
                <option value="camera">Cámara</option>
                <option value="vibrator">Vibrador</option>
                <option value="sensors">Huella / proximidad / sensores</option>
                <option value="battery">Batería / conector de batería</option>
                <option value="flex">Flex / conectores FPC</option>
                <option value="solder">Soldadura / pads / pistas</option>
                <option value="moisture">Humedad / sulfatación / corrosión</option>
                <option value="measure">Medición con tester</option>
              </select>
            </div>

            <div className="field">
              <label>Zona o componente que aparece en la foto</label>
              <select value={componentHint} onChange={e=>setComponentHint(e.target.value)}>
                <option value="auto">Que LOLO lo detecte automáticamente</option>
                <option value="mainboard">Placa principal</option>
                <option value="subboard">Subplaca / placa de carga</option>
                <option value="display">Módulo / pantalla / táctil</option>
                <option value="charging_port">Pin / puerto de carga</option>
                <option value="battery">Batería / conector de batería</option>
                <option value="interconnect_flex">Flex interconexión / FPC</option>
                <option value="power_buttons">Botón power / volumen / flex</option>
                <option value="buzzer">Buzzer / altavoz</option>
                <option value="earpiece">Auricular de llamada</option>
                <option value="microphone">Micrófono</option>
                <option value="antenna">Antena / coaxial / contactos RF</option>
                <option value="sim">Lector SIM / bandeja / contactos</option>
                <option value="camera">Cámara / conector de cámara</option>
                <option value="vibrator">Vibrador</option>
                <option value="sensor">Huella / proximidad / sensores</option>
                <option value="solder_area">Soldadura / pads / pistas / componentes</option>
                <option value="other">Otra zona o componente</option>
              </select>
            </div>

            <div className="field visionSymptom">
              <label>Síntoma o qué querés comprobar</label>
              <textarea value={symptom} onChange={e=>setSymptom(e.target.value)} placeholder="Ej.: no tiene sonido, no reconoce SIM, se cayó y no da imagen, quiero saber si este flex está dañado…"/>
            </div>

            {visionTask==="charging"&&<div className="field">
              <label>Tipo de puerto de carga (solo si lo sabés)</label>
              <select value={connector} onChange={e=>setConnector(e.target.value)}>
                <option value="auto">Que LOLO lo detecte</option>
                <option value="usb-c">USB-C</option>
                <option value="micro-usb">Micro-USB</option>
                <option value="lightning">Lightning</option>
              </select>
            </div>}

            {visionTask==="measure"&&<div className="field">
              <label>¿Qué querés medir?</label>
              <select value={measurement} onChange={e=>setMeasurement(e.target.value)}>
                <option value="voltage">Voltaje</option>
                <option value="continuity">Continuidad</option>
                <option value="resistance">Resistencia</option>
              </select>
            </div>}
          </div>
          <div className="actions"><button className="btn primary" onClick={analyze} disabled={busy}>🤖 {busy?"Analizando…":"Analizar con visión IA"}</button></div>
        </>}

        {visionError&&<div className="notice">{visionError}</div>}
        {vision&&<div className="resultBox visionResult">
          <div className="visionResultHead">
            <b>{vision.need_better_photo?"LOLO necesita otra vista":vision.can_mark?"LOLO encontró elementos útiles":"Análisis visual de LOLO"}</b>
            <span>{Math.round((vision.confidence||0)*100)}% confianza</span>
          </div>
          <p>{vision.summary}</p>
          {vision.diagnosis&&<p><b>Qué puede decir de la foto:</b> {vision.diagnosis}</p>}
          {vision.explanation&&<p><b>Interpretación:</b> {vision.explanation}</p>}
          {vision.suggested_action&&<p><b>Acción sugerida:</b> {vision.suggested_action}</p>}

          {vision.findings?.length>0&&<div className="visionFindings">
            <b>Elementos marcados en la imagen</b>
            {vision.findings.map((f,i)=><div key={i}><span>{i+1}</span><p><b>{f.label}</b><small>{f.evidence}</small></p></div>)}
          </div>}

          {vision.can_measure&&vision.black_probe&&vision.red_probe&&<>
            <p><b>⚫ Punta negra:</b> {vision.black_probe.label}. {vision.black_probe.evidence}</p>
            <p><b>🔴 Punta roja:</b> {vision.red_probe.label}. {vision.red_probe.evidence}</p>
            {vision.expected_reading&&<p><b>Qué esperar:</b> {vision.expected_reading}</p>}
          </>}

          <div className="tip warn">{vision.safety_warning}</div>
          {vision.required_next_view&&<p><b>Si necesitás otra foto:</b> {vision.required_next_view}</p>}
          <p><b>Siguiente paso:</b> {vision.follow_up_question}</p>
          <button className="btn" onClick={()=>void speak([vision.summary,vision.diagnosis,vision.explanation,vision.safety_warning,vision.follow_up_question].filter(Boolean).join(" "))}>🔊 Escuchar a LOLO</button>
        </div>}
      </div>
    </section>

    <section className={"section "+(tab==="workshop"&&hasAccess?"active":"")}>
      <div className="panel workshopPanel">
        <div className="workshopHead">
          <div>
            <h2>🧰 Taller interactivo: cambio de pin de carga</h2>
            <p className="muted">LOLO trabaja sobre la misma foto que vos subiste. Las herramientas se animan encima de tu placa; los puntos de medición solo se muestran cuando la visión IA los pudo confirmar.</p>
          </div>
          <span className="workshopCounter">{workshopStep+1}/{WORKSHOP_STEPS.length}</span>
        </div>

        <WorkshopScene step={workshopStep} active={workshopRunning||speaking} image={image} vision={vision}/>

        <div className="workshopInfo">
          <div className="workshopStepTitle">{WORKSHOP_STEPS[workshopStep].title}</div>
          <p>{WORKSHOP_STEPS[workshopStep].text}</p>
          <div className="stepDots">
            {WORKSHOP_STEPS.map((_,i)=><button key={i} className={i===workshopStep?"on":""} onClick={()=>runWorkshopStep(i)} aria-label={"Paso "+(i+1)}>{i+1}</button>)}
          </div>
          <div className="actions">
            <button className="btn" disabled={workshopStep===0} onClick={()=>runWorkshopStep(workshopStep-1)}>← Anterior</button>
            <button className="btn primary" onClick={()=>runWorkshopStep(workshopStep)}>▶️ Mostrar y explicar</button>
            <button className="btn" disabled={workshopStep===WORKSHOP_STEPS.length-1} onClick={()=>runWorkshopStep(workshopStep+1)}>Siguiente →</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>📷 Tu placa real en el Taller</h3>
        <p className="muted">{image?"Esta es la misma imagen que cargaste. Podés reemplazarla cuando quieras.":"Primero cargá una foto real de la placa. El Taller ya no usa una placa dibujada."}</p>
        <div className="uploadActions">
          <label className="btn primary">📷 Sacar foto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0],"workshop")}/></label>
          <label className="btn">🖼️ Subir imagen<input hidden type="file" accept="image/*" onChange={e=>loadPhoto(e.target.files?.[0],"workshop")}/></label>
          {image&&<button className="btn" onClick={()=>nav("plate")}>🤖 Analizar esta placa con IA</button>}
        </div>
        {image&&!vision&&<div className="tip warn">Para el paso “Medir con tester”, analizá primero la imagen en <b>Tu placa</b>. LOLO no va a inventar dónde apoyar las puntas.</div>}
      </div>

      <div className="panel">
        <h3>Contenido del curso</h3>
        <div className="steps">{COURSE.map((s,i)=><div className="step" key={i} onClick={()=>toggleStep(i)}><b>{progress.includes(i)?"✅":"⬜"} {i+1}. {s[0]}</b><span className="muted small">{s[1]}</span></div>)}</div>
      </div>
      <div className="panel"><h3>Práctica</h3>{QUIZ.map((q,qi)=><Quiz key={qi} q={q}/>)}</div>
    </section>

    <section className={"section "+(tab==="learn"&&hasAccess?"active":"")}>
      <div className="panel">
        <h2>Aprender con LOLO</h2>
        <p className="muted">Elegí un tema. LOLO te lo explica conversando y adapta la explicación según lo que vos le preguntes.</p>

        <div className="repairTopicSection">
          <div className="repairTopicHead">
            <div><span>DIAGNÓSTICO Y REPARACIÓN</span><h3>¿Qué querés aprender o diagnosticar?</h3></div>
            <small>LOLO empieza por diagnóstico y recién después propone reemplazar una pieza.</small>
          </div>
          <div className="repairTopicGrid">
            {REPAIR_TOPICS.map(topic=><button className="repairTopicCard" key={topic.title} onClick={()=>{setTab("talk");void sendChat(topic.prompt)}}>
              <span className="repairTopicIcon">{topic.icon}</span>
              <b>{topic.title}</b>
              <small>Aprender / diagnosticar</small>
            </button>)}
          </div>
        </div>

        <h3 className="learningPathTitle">Ruta completa de aprendizaje</h3>
        <div className="learnList">
          {COURSE.map((s,i)=><div className="learnCard" key={i}>
            <div><b>{i+1}. {s[0]}</b><span>{s[1]}</span></div>
            <button className="btn" onClick={()=>{setTab("talk");void sendChat(`LOLO, enseñame ${s[0]} como si fuera una clase práctica. Explicame una cosa por vez y haceme una pregunta para comprobar si entendí.`)}}>Preguntarle a LOLO</button>
          </div>)}
        </div>
      </div>
      <div className="panel">
        <h3>Práctica rápida</h3>
        <div className="quizArea">{QUIZ.map((q,qi)=><Quiz key={qi} q={q}/>)}</div>
      </div>
    </section>

    <section className={"section "+(tab==="settings"?"active":"")}>
      <AccountPanel account={account} onAccountChange={(next)=>{setAccount(next);if(next.access?.active)setTab("home")}} />

      <div className="panel settings"><h3>Voz de LOLO</h3>
        <div className="tip good">LOLO usa por defecto su <b>voz IA masculina</b>.</div>
        <label>Modo de voz</label>
        <select value={voiceMode} onChange={e=>setVoiceMode(e.target.value as any)}>
          <option value="ai">Voz IA masculina de LOLO</option>
          <option value="device">Voz masculina del teléfono (solo respaldo)</option>
        </select>
        {voiceMode==="device"&&<>
          <label>Voz del teléfono</label><select value={deviceVoice} onChange={e=>setDeviceVoice(e.target.value)}>{voices.map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}</select>
        </>}
        <div className="actions"><button className="btn primary" onClick={()=>{if(hasAccess)void speak("Hola, soy LOLO. Esta es mi voz. Vamos a aprender reparación paso a paso y a medir sobre tu placa real.");else setTab("settings")}}>🔊 Probar voz</button></div>
      </div>
    </section>

    <div className="creatorFooter">
      <span>LOLO · Tu profe IA de reparación</span>
      <b>Creado por Christian Alonso</b>
    </div>

    {installHelp&&<div className="installOverlay" onClick={()=>setInstallHelp(false)}>
      <div className="installSheet" onClick={e=>e.stopPropagation()}>
        <button className="installClose" onClick={()=>setInstallHelp(false)}>×</button>
        <div className="installSheetIcon">📲</div>
        <h2>Instalar LOLO en tu celular</h2>
        <p>Si no apareció el botón automático de instalación, hacelo desde el navegador:</p>
        <div className="installSteps">
          <div><b>Android · Chrome</b><span>1. Tocá ⋮ arriba a la derecha.<br/>2. Elegí <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.<br/>3. Confirmá <b>Instalar</b>.</span></div>
          <div><b>iPhone · Safari</b><span>1. Tocá Compartir ⤴︎.<br/>2. Elegí <b>Agregar a inicio</b>.<br/>3. Tocá <b>Agregar</b>.</span></div>
        </div>
        <div className="tip good"><b>No necesitás Play Store.</b> LOLO queda instalada como aplicación y se actualiza automáticamente.</div>
        <button className="btn primary installSheetDone" onClick={()=>setInstallHelp(false)}>Entendido</button>
      </div>
    </div>}

    <nav>
      <button className={tab==="home"?"on":""} onClick={()=>nav("home")}><b>⌂</b>Inicio</button>
      <button className={tab==="talk"?"on":""} onClick={()=>nav("talk")}><b>🤖</b>{hasAccess?"Hablar":"Probar"}</button>
      <button className={tab==="plate"?"on":""} onClick={()=>nav("plate")}><b>📷</b>Tu placa</button>
      <button className={tab==="learn"?"on":""} onClick={()=>nav("learn")}><b>📘</b>Aprender</button>
      <button className={tab==="settings"?"on":""} onClick={()=>nav("settings")}><b>👤</b>Mi cuenta</button>
    </nav>
  </main>
}


function WorkshopScene({step,active,image,vision}:{step:number;active:boolean;image:string;vision:VisionResult|null}){
  const scene=WORKSHOP_STEPS[step].scene;
  const red=vision?.can_mark&&vision.red_probe?vision.red_probe:null;
  const black=vision?.can_mark&&vision.black_probe?vision.black_probe:null;
  const target=red||{x:.5,y:.72,label:"zona del conector"};
  const targetStyle={left:(target.x*100)+"%",top:(target.y*100)+"%"};
  const redStyle=red?{left:(red.x*100)+"%",top:(red.y*100)+"%"}:{};
  const blackStyle=black?{left:(black.x*100)+"%",top:(black.y*100)+"%"}:{};

  return <div className={"workshopStage realScene scene-"+scene+" "+(active?"running":"")}>
    {!image&&<div className="workshopEmpty">
      <div className="emptyIcon">📷</div>
      <b>Cargá una foto real de tu placa</b>
      <span>La animación se hará sobre esa misma imagen.</span>
    </div>}

    {image&&<>
      <img className="workshopBoardPhoto" src={image} alt="Placa real cargada por el alumno"/>
      <div className="photoShade"></div>

      <div className="loloCoach">
        <LoloAvatar mode={active?"pointing":"idle"} compact/>
        <div className="coachBubble">{active?"Te muestro este paso":"LOLO"}</div>
      </div>

      <div className="focusRing" style={targetStyle}></div>

      {scene==="inspect"&&<div className="realTool scanTool" style={targetStyle}>🔍</div>}
      {scene==="battery"&&<div className="instructionFlag">🔋 Desconectá la batería antes de aplicar calor</div>}
      {scene==="protect"&&<>
        <div className="realTool shieldTool" style={targetStyle}>🛡️</div>
        <div className="realTool fluxTool" style={targetStyle}>💧</div>
      </>}
      {scene==="remove"&&<>
        <div className="realTool hotairTool" style={targetStyle}>♨️</div>
        <div className="realTool tweezersTool" style={targetStyle}>🔧</div>
      </>}
      {scene==="clean"&&<div className="realTool braidTool" style={targetStyle}>〰️</div>}
      {scene==="install"&&<>
        <div className="realTool portTool" style={targetStyle}>▣</div>
        <div className="realTool ironTool" style={targetStyle}>🖊️</div>
      </>}
      {scene==="measure"&&<>
        {black&&red?<>
          <div className="realProbe blackProbe" style={blackStyle}><span>NEGRA</span></div>
          <div className="realProbe redProbe" style={redStyle}><span>ROJA</span></div>
          <div className="measureConfirmed">✓ Puntos confirmados por visión IA</div>
        </>:<div className="measureBlocked">⚠️ Primero analizá la placa con visión IA para ubicar las puntas sin adivinar.</div>}
      </>}
      {scene==="test"&&<>
        <div className="realTool cableTool" style={targetStyle}>🔌</div>
        <div className="testBadge">PRUEBA FINAL</div>
      </>}
    </>}

    <div className="sceneCaption">{WORKSHOP_STEPS[step].title}</div>
    {image&&!red&&scene!=="measure"&&<div className="orientationTag">Movimiento didáctico sobre tu foto · posición orientativa</div>}
  </div>
}

function Quiz({q}:{q:readonly [string,readonly string[],number]}){
  const [picked,setPicked]=useState<number|null>(null);
  return <div className="quizQ"><b>{q[0]}</b>{q[1].map((o,i)=><button key={i} className={"btn "+(picked!==null?(i===q[2]?"good":picked===i?"danger":""):"")} disabled={picked!==null} onClick={()=>setPicked(i)}>{o}</button>)}</div>
}
