"use client";

import { useEffect, useRef, useState } from "react";

const LOLO_FACE = "data:image/jpeg;base64,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";

const FAST_GREETING_REPLY = "¡Hola! Soy LOLO. Decime qué equipo tenés y qué falla presenta, y arrancamos.";
const isFastGreeting = (value:string) => {
  const q=value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  return /^(hola( lolo)?|buenas( lolo)?|buen dia( lolo)?|buenas tardes( lolo)?|buenas noches( lolo)?|hola profe|lolo)$/.test(q);
};

type ChatMessage = { role: "user" | "assistant"; content: string };
type Marker = { x:number; y:number; label:string; evidence?:string };
type Caution = { x:number; y:number; radius:number; label:string };
type VisionResult = {
  can_mark:boolean; need_better_photo:boolean; confidence:number;
  connector_type:"usb-c"|"micro-usb"|"unknown"; image_quality:"good"|"usable"|"poor";
  summary:string; explanation:string; safety_warning:string; follow_up_question:string;
  expected_reading:string; black_probe:Marker|null; red_probe:Marker|null; cautions:Caution[];
};

const COURSE = [
  ["Diagnóstico previo","Descartá cable/cargador, suciedad, corrosión y daño mecánico antes de cambiar piezas."],
  ["Desconectar batería","Antes de aplicar calor o soldar, desconectá la batería."],
  ["Preparar y proteger","Sujetá la placa, protegé flex/plásticos y usá flux de forma controlada."],
  ["Retirar el conector","No hagas palanca hasta que toda la soldadura esté realmente fundida."],
  ["Limpiar pads","Retirá exceso de soldadura con control e inspeccioná pads y pistas."],
  ["Colocar y soldar","Alineá el repuesto, soldá anclajes/contactos y revisá puentes."],
  ["Comprobación final","Inspección, control de cortos y prueba de carga/datos según el equipo."]
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

function LoloAvatar({mode="idle",compact=false}:{mode?:AvatarMode;compact?:boolean}){
  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PENSANDO":mode==="speaking"?"HABLANDO":mode==="pointing"?"TE MUESTRO":"LOLO";
  return <div className={"loloAvatar "+mode+(compact?" compact":"")} aria-label={"LOLO "+label.toLowerCase()}>
    <svg viewBox="0 0 180 180" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="loloHalo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#45d8ff"/>
          <stop offset="100%" stopColor="#176cf5"/>
        </linearGradient>
        <linearGradient id="loloJacket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#173c5a"/>
          <stop offset="100%" stopColor="#071927"/>
        </linearGradient>
        <linearGradient id="loloFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3c8a8"/>
          <stop offset="100%" stopColor="#d99f7a"/>
        </linearGradient>
        <filter id="loloGlow">
          <feGaussianBlur stdDeviation="3.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <circle className="avatarHalo" cx="90" cy="87" r="73" fill="none" stroke="url(#loloHalo)" strokeWidth="3"/>
      <circle className="avatarHaloInner" cx="90" cy="87" r="63" fill="#0b2438" opacity=".8"/>

      <g className="avatarBody">
        <path d="M39 168 C43 135 58 121 78 117 L102 117 C122 121 137 135 141 168 Z" fill="url(#loloJacket)" stroke="#3ebeff" strokeWidth="2"/>
        <path d="M81 117 L90 134 L99 117" fill="#0d2639" stroke="#6bd5ff" strokeWidth="1.6"/>
        <rect x="77" y="139" width="26" height="15" rx="7.5" fill="#0b1f31" stroke="#2fbaff"/>
        <text x="90" y="150" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7bdcff">LOLO</text>
      </g>

      <g className="avatarHead">
        <path d="M60 69 C60 43 72 28 91 28 C112 28 122 44 121 69 L118 91 C116 108 105 119 90 119 C74 119 64 108 62 91 Z" fill="url(#loloFace)" stroke="#7dd9ff" strokeWidth="1.8"/>
        <path d="M59 65 C60 41 73 27 92 27 C106 27 118 34 123 48 C112 44 103 43 94 44 C82 46 71 52 59 65 Z" fill="#18222c"/>
        <path d="M66 49 C75 37 91 32 105 37" fill="none" stroke="#293947" strokeWidth="5" strokeLinecap="round"/>

        <g className="avatarEyes">
          <path d="M70 76 Q77 72 84 76" fill="none" stroke="#2b2f33" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M97 76 Q104 72 111 76" fill="none" stroke="#2b2f33" strokeWidth="2.2" strokeLinecap="round"/>
          <ellipse className="avatarEye avatarEyeL" cx="78" cy="79" rx="3.2" ry="4.3" fill="#101820"/>
          <ellipse className="avatarEye avatarEyeR" cx="104" cy="79" rx="3.2" ry="4.3" fill="#101820"/>
          <circle cx="79" cy="78" r="1" fill="#8ce7ff"/>
          <circle cx="105" cy="78" r="1" fill="#8ce7ff"/>
        </g>

        <path d="M90 80 L87 91 Q90 94 94 91" fill="none" stroke="#b8795e" strokeWidth="1.6" strokeLinecap="round"/>
        <g className="avatarMouthGroup">
          <rect className="avatarMouth" x="80" y="99" width="20" height="4" rx="2" fill="#7e3c40"/>
          <rect className="avatarSmile" x="83" y="99" width="14" height="1.6" rx=".8" fill="#f6d7cc" opacity=".9"/>
        </g>
        <path d="M72 96 Q90 111 108 96" fill="none" stroke="#c4876c" strokeWidth="1.2" opacity=".35"/>
      </g>

      <g className="avatarLeftArm">
        <path d="M60 133 C48 133 40 143 38 158" fill="none" stroke="#173c5a" strokeWidth="17" strokeLinecap="round"/>
        <circle cx="37" cy="160" r="9" fill="#e2ad88" stroke="#74d9ff" strokeWidth="1.4"/>
      </g>

      <g className="avatarRightArm">
        <path d="M120 133 C132 134 141 144 145 157" fill="none" stroke="#173c5a" strokeWidth="17" strokeLinecap="round"/>
        <g className="avatarRightHand">
          <circle cx="147" cy="160" r="9" fill="#e2ad88" stroke="#74d9ff" strokeWidth="1.4"/>
          <path d="M151 158 L165 151" stroke="#e2ad88" strokeWidth="5" strokeLinecap="round"/>
          <path d="M151 158 L164 157" stroke="#e2ad88" strokeWidth="4" strokeLinecap="round"/>
        </g>
      </g>

      <g className="avatarListenFx" filter="url(#loloGlow)">
        <path d="M50 67 Q39 77 49 88" fill="none" stroke="#51e0a8" strokeWidth="3" strokeLinecap="round"/>
        <path d="M130 67 Q141 77 131 88" fill="none" stroke="#51e0a8" strokeWidth="3" strokeLinecap="round"/>
      </g>

      <g className="avatarThinkFx">
        <circle cx="136" cy="43" r="4" fill="#ffd36f"/>
        <circle cx="146" cy="34" r="3" fill="#ffd36f"/>
        <circle cx="154" cy="24" r="2.2" fill="#ffd36f"/>
      </g>
    </svg>
    <span className="avatarStatus">{label}</span>
  </div>
}

export default function Page() {
  const [tab,setTab]=useState("talk");
  const [speaking,setSpeaking]=useState(false);
  const [caption,setCaption]=useState("Hola, soy LOLO. Subime una foto de tu placa y te ayudo a medir sin adivinar.");
  const [messages,setMessages]=useState<ChatMessage[]>([{role:"assistant",content:"Hola, soy LOLO. Hablame como a tu profe del taller: contame qué equipo tenés, qué falla hace y qué querés aprender. Vamos paso a paso."}]);
  const messagesRef=useRef<ChatMessage[]>([{role:"assistant",content:"Hola, soy LOLO. Hablame como a tu profe del taller: contame qué equipo tenés, qué falla hace y qué querés aprender. Vamos paso a paso."}]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [micError,setMicError]=useState("");
  const [image,setImage]=useState("");
  const [deviceModel,setDeviceModel]=useState("");
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
  const imageRef=useRef<HTMLImageElement|null>(null);
  const stageRef=useRef<HTMLDivElement|null>(null);
  const [imageBox,setImageBox]=useState({left:0,top:0,width:0,height:0});
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const greetingAudioRef=useRef<HTMLAudioElement|null>(null);
  const [recording,setRecording]=useState(false);
  const [conversationMode,setConversationMode]=useState(true);
  const [paymentEmail,setPaymentEmail]=useState("");
  const [paymentBusy,setPaymentBusy]=useState<"monthly"|"lifetime"|null>(null);
  const [paymentError,setPaymentError]=useState("");
  const [mpConfigured,setMpConfigured]=useState(false);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const micStreamRef=useRef<MediaStream|null>(null);
  const micChunksRef=useRef<Blob[]>([]);
  const micRafRef=useRef<number|null>(null);
  const micAudioCtxRef=useRef<AudioContext|null>(null);
  const chatRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    const saved=localStorage.getItem("lolo.progress");
    if(saved) try{setProgress(JSON.parse(saved))}catch{}
    if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
    const fn=(e:any)=>{e.preventDefault();setInstallPrompt(e)};
    window.addEventListener("beforeinstallprompt",fn);
    return()=>window.removeEventListener("beforeinstallprompt",fn);
  },[]);

  useEffect(()=>{
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

  const nav=(id:string)=>setTab(id);

  const browserSpeak=(text:string)=>{
    if(!("speechSynthesis" in window))return;
    const maleHints=["Pablo","Jorge","Diego","Carlos","Miguel","Juan","Antonio","Mario","Javier","Sergio","Male"];
    const male=voices.find(v=>v.lang.toLowerCase().startsWith("es")&&maleHints.some(h=>v.name.toLowerCase().includes(h.toLowerCase())));
    if(!male){setMicError("No encontré una voz masculina en este dispositivo. Usá la voz IA de LOLO.");return}
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.voice=male;u.lang=male.lang;u.rate=.96;u.pitch=.82;
    setSpeaking(true);
    u.onend=()=>setSpeaking(false);
    u.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const speak=async(text:string)=>{
    setCaption(text.slice(0,190)+(text.length>190?"…":""));
    audioRef.current?.pause();
    audioRef.current=null;
    setSpeaking(true);
    try{
      const r=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
      const j=await r.json();
      if(!r.ok||!j.audio) throw new Error(j.error||"No se pudo generar la voz de LOLO");
      const audio=new Audio();
      audio.preload="auto";
      audio.src=`data:${j.mime||"audio/mpeg"};base64,${j.audio}`;
      audioRef.current=audio;
      await new Promise<void>((resolve,reject)=>{
        let settled=false;
        const done=()=>{if(settled)return;settled=true;setSpeaking(false);resolve()};
        const fail=()=>{if(settled)return;settled=true;setSpeaking(false);reject(new Error("La voz IA no pudo reproducirse."))};
        audio.onended=done;
        audio.onerror=fail;
        const begin=()=>{audio.play().catch(fail)};
        if(audio.readyState>=3) begin();
        else audio.oncanplay=begin;
        audio.load();
      });
    }catch(e:any){
      setSpeaking(false);
      setMicError(e?.message||"No se pudo reproducir la voz masculina de LOLO.");
    }
  };

  const playFastGreeting=async()=>{
    setCaption(FAST_GREETING_REPLY);
    const prepared=greetingAudioRef.current;
    if(!prepared){await speak(FAST_GREETING_REPLY);return}
    audioRef.current?.pause();
    const audio=prepared.cloneNode(true) as HTMLAudioElement;
    audioRef.current=audio;
    setSpeaking(true);
    await new Promise<void>((resolve)=>{
      audio.onended=()=>{setSpeaking(false);resolve()};
      audio.onerror=()=>{setSpeaking(false);resolve()};
      audio.play().catch(()=>{setSpeaking(false);resolve()});
    });
  };

  const sendChat=async(text=input,fromVoice=false)=>{
    const q=text.trim();if(!q||busy)return;
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
      const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");
      const ans=j.text||"No pude responder.";
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
    if(speaking){
      audioRef.current?.pause();audioRef.current=null;setSpeaking(false);
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

      rec.ondataavailable=(e:BlobEvent)=>{if(e.data.size>0)micChunksRef.current.push(e.data)};
      rec.onstop=async()=>{
        cleanupMicMonitor();
        setRecording(false);
        micStreamRef.current?.getTracks().forEach(t=>t.stop());
        const rawType=(rec.mimeType||preferred||"audio/webm").split(";")[0].toLowerCase();
        const blob=new Blob(micChunksRef.current,{type:rawType});
        if(blob.size<1200||!heardVoice){
          setCaption("No llegué a escucharte. Tocá el micrófono y hablame de nuevo.");
          setMicError("No escuché una frase completa.");
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
          if(rms>.035){heardVoice=true;lastVoice=now}
          if(heardVoice&&now-lastVoice>1150&&now-startedAt>1400){rec.stop();return}
          if(!heardVoice&&now-startedAt>7000){rec.stop();return}
          if(now-startedAt>18000){rec.stop();return}
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
        imageDataUrl:image,deviceModel,connectorHint:connector,measurement
      })});
      const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");
      setVision(j);
      const spoken=j.can_mark
        ? `${j.explanation} ${j.safety_warning} ${j.expected_reading} ${j.follow_up_question}`
        : `${j.summary} ${j.safety_warning} ${j.follow_up_question}`;
      speak(spoken);
    }catch(e:any){setVisionError(e?.message||"No se pudo analizar la imagen.")}
    finally{setBusy(false)}
  };

  const startPayment=async(plan:"monthly"|"lifetime")=>{
    setPaymentError("");
    const email=paymentEmail.trim();
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
      <div><div className="logo">L<span>O</span>LO</div><div className="muted small">Tu profe IA de reparación</div></div>
      <div className="status"><span className={"dot "+(busy?"":"on")}></span>{busy?"Procesando…":"Listo"}</div>
    </header>

    <div className={"hero tutorHero "+(speaking?"speaking ":"")+(recording?"listening ":"")+(busy?"thinking ":"")}>
      <LoloAvatar mode={recording?"listening":busy?"thinking":speaking?"speaking":(tab==="plate"&&vision?.can_mark)?"pointing":"idle"}/>
      <div className="heroWords">
        <div className="caption">{caption}</div>
        <div className="wave"><i></i><i></i><i></i><i></i></div>
      </div>
    </div>

    <section className={"section "+(tab==="home"?"active":"")}>
      <div className="panel"><h2>LOLO completo</h2>
        <div className="grid">
          <button className="card" onClick={()=>nav("plate")}><b>📷 Analizar tu placa</b><span className="muted small">Visión IA + marcas automáticas</span></button>
          <button className="card" onClick={()=>nav("talk")}><b>🎤 Hablar con LOLO</b><span className="muted small">Chat + micrófono + voz</span></button>
          <button className="card workshopCard" onClick={()=>nav("learn")}><b>📘 Aprender con LOLO</b><span className="muted small">Clases conversadas, paso a paso</span></button>
          <button className="card" onClick={()=>nav("settings")}><b>💳 Planes LOLO</b><span className="muted small">$12.000 mensual o $120.000 permanente</span></button>
        </div>
      </div>
      <div className="panel"><div className="tip good"><b>Regla de LOLO:</b> si la IA no puede justificar visualmente dónde está VBUS, no marca un punto. Te pide una foto mejor, modelo, esquema o una prueba adicional.</div></div>
      {installPrompt&&<button className="btn primary" onClick={async()=>{await installPrompt.prompt();setInstallPrompt(null)}}>📲 Instalar LOLO en este celular</button>}
    </section>

    <section className={"section "+(tab==="talk"?"active":"")}>
      <div className="panel interactiveTutor">
        <div className="interactiveTitle">
          <div>
            <h2>Hablá con LOLO</h2>
            <p className="muted">Como si estuvieras en el taller con tu profesor. Preguntá, respondé y seguí el diagnóstico conversando.</p>
          </div>
          <span className={"talkState "+(recording?"listen":speaking?"speak":busy?"think":"ready")}>{recording?"Te escucho":speaking?"Te respondo":busy?"Pensando":"Listo para hablar"}</span>
        </div>

        {micError&&<div className="notice">{micError}</div>}

        <button className={"bigMic "+(recording?"on":"")} onClick={()=>void startMic()} disabled={busy}>
          <span>{recording?"■":"🎤"}</span>
          <b>{recording?"Terminar ahora":"Hablar con LOLO"}</b>
          <small>{recording?"Podés tocar para cortar antes":"Tocá una vez, hablá y LOLO detecta cuando terminás"}</small>
        </button>

        <label className="conversationToggle">
          <input type="checkbox" checked={conversationMode} onChange={e=>setConversationMode(e.target.checked)}/>
          <span><b>Conversación continua</b><small>{conversationMode?"Después de responder, LOLO vuelve a escucharte.":"LOLO espera que vuelvas a tocar el micrófono."}</small></span>
        </label>

        <div className="quickPrompts">
          {["Mi celular no carga","Mi celular no enciende","Quiero aprender a usar el tester","Quiero cambiar un pin de carga"].map(q=>
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
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void sendChat()}} placeholder="También podés escribirle a LOLO"/>
          <label className="circle photoButton" style={{display:"grid",placeItems:"center"}} title="Sacar foto">📷<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <label className="circle galleryButton" style={{display:"grid",placeItems:"center"}} title="Subir imagen">🖼️<input hidden type="file" accept="image/*" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <button className="circle" onClick={()=>void sendChat()} disabled={busy}>➤</button>
        </div>
        <div className="talkHint">Si LOLO necesita ver la placa, te va a pedir una foto. La podés sacar o subir desde acá.</div>
      </div>
    </section>

    <section className={"section "+(tab==="plate"?"active":"")}>
      <div className="panel"><h2>Tu placa + visión IA</h2>
        <p className="muted">Sacá una foto enfocada o subí una imagen guardada de la subplaca completa y del pin de carga. Cuanta más zona alrededor se vea, mejor puede seguir pistas y test points.</p>
        <div className="uploadActions">
          <label className="btn primary">📷 Sacar foto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <label className="btn">🖼️ Subir imagen<input hidden type="file" accept="image/*" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
        </div>
        <div ref={stageRef} className="photoStage" style={{marginTop:10}}>
          {!image&&<span className="muted">Todavía no cargaste una foto.</span>}
          {image&&<img ref={imageRef} onLoad={()=>window.dispatchEvent(new Event("resize"))} src={image} alt="Placa a analizar"/>}
          {vision?.can_mark&&vision.black_probe&&<div className="marker black" data-label={vision.black_probe.label} style={markerStyle(vision.black_probe)}>N</div>}
          {vision?.can_mark&&vision.red_probe&&<div className="marker red" data-label={vision.red_probe.label} style={markerStyle(vision.red_probe)}>R</div>}
          {vision?.cautions?.map((c,i)=><div key={i} className="cautionCircle" style={cautionStyle(c)} title={c.label}/>)}
        </div>

        {image&&<>
          <div className="formGrid" style={{marginTop:10}}>
            <div className="field"><label>Marca/modelo</label><input value={deviceModel} onChange={e=>setDeviceModel(e.target.value)} placeholder="Ej.: Samsung A03"/></div>
            <div className="field"><label>Conector</label><select value={connector} onChange={e=>setConnector(e.target.value)}><option value="auto">Que LOLO lo detecte</option><option value="usb-c">USB-C</option><option value="micro-usb">Micro-USB</option></select></div>
            <div className="field"><label>Qué querés medir</label><select value={measurement} onChange={e=>setMeasurement(e.target.value)}><option value="voltage">Voltaje / VBUS</option><option value="continuity">Continuidad</option><option value="resistance">Resistencia</option></select></div>
          </div>
          <div className="actions"><button className="btn primary" onClick={analyze} disabled={busy}>🤖 {busy?"Analizando…":"Analizar con visión IA"}</button></div>
        </>}

        {visionError&&<div className="notice">{visionError}</div>}
        {vision&&<div className="resultBox">
          <b>{vision.can_mark?"LOLO encontró puntos utilizables":"LOLO necesita más información"}</b>
          <p>{vision.summary}</p>
          <p><b>Confianza:</b> {Math.round((vision.confidence||0)*100)}%</p>
          <div className="tip warn">{vision.safety_warning}</div>
          {vision.can_mark&&<>
            <p><b>⚫ Punta negra:</b> {vision.black_probe?.label}. {vision.black_probe?.evidence}</p>
            <p><b>🔴 Punta roja:</b> {vision.red_probe?.label}. {vision.red_probe?.evidence}</p>
            <p>{vision.explanation}</p>
            <p><b>Qué esperar:</b> {vision.expected_reading}</p>
          </>}
          <p><b>Siguiente paso:</b> {vision.follow_up_question}</p>
          <button className="btn" onClick={()=>speak(vision.can_mark?`${vision.explanation} ${vision.safety_warning} ${vision.follow_up_question}`:`${vision.summary} ${vision.follow_up_question}`)}>🔊 Escuchar a LOLO</button>
        </div>}
      </div>
    </section>

    <section className={"section "+(tab==="workshop"?"active":"")}>
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

    <section className={"section "+(tab==="learn"?"active":"")}>
      <div className="panel">
        <h2>Aprender con LOLO</h2>
        <p className="muted">Elegí un tema. LOLO te lo explica conversando y adapta la explicación según lo que vos le preguntes.</p>
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
      <div className="panel accountPanel">
        <div className="accountHead">
          <div>
            <h2>Mi cuenta LOLO</h2>
            <p className="muted">Elegí cómo querés acceder a tu profesor IA.</p>
          </div>
          <span className={"paymentState "+(mpConfigured?"ready":"pending")}>{mpConfigured?"Mercado Pago listo":"Mercado Pago pendiente"}</span>
        </div>

        <div className="field paymentEmail">
          <label>Correo del alumno</label>
          <input type="email" value={paymentEmail} onChange={e=>setPaymentEmail(e.target.value)} placeholder="alumno@email.com" autoComplete="email"/>
          <small className="muted">Se usará para vincular el pago con la cuenta del alumno.</small>
        </div>

        {paymentError&&<div className="notice">{paymentError}</div>}

        <div className="plans">
          <article className="planCard featured">
            <div className="planTag">MENSUAL</div>
            <h3>LOLO Mensual</h3>
            <div className="price">$12.000 <small>/ mes</small></div>
            <p>Acceso a LOLO, diagnóstico con imágenes, clases, práctica y seguimiento.</p>
            <button className="btn primary payBtn" onClick={()=>void startPayment("monthly")} disabled={paymentBusy!==null||!mpConfigured}>
              {paymentBusy==="monthly"?"Abriendo Mercado Pago…":"Pagar con Mercado Pago"}
            </button>
          </article>

          <article className="planCard">
            <div className="planTag">PAGO ÚNICO</div>
            <h3>LOLO Permanente</h3>
            <div className="price">$120.000</div>
            <p>Un solo pago para acceder a LOLO sin cuota mensual.</p>
            <button className="btn payBtn" onClick={()=>void startPayment("lifetime")} disabled={paymentBusy!==null||!mpConfigured}>
              {paymentBusy==="lifetime"?"Abriendo Mercado Pago…":"Pagar con Mercado Pago"}
            </button>
          </article>
        </div>

        {!mpConfigured&&<div className="tip warn"><b>Falta vincular tu cuenta de Mercado Pago.</b> La pantalla de cobro ya está preparada; los botones se habilitan cuando se configure la credencial privada en el servidor.</div>}
      </div>

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
        <div className="actions"><button className="btn primary" onClick={()=>speak("Hola, soy LOLO. Esta es mi voz. Vamos a aprender reparación paso a paso y a medir sobre tu placa real.")}>🔊 Probar voz</button></div>
      </div>
    </section>

    <nav>
      <button className={tab==="home"?"on":""} onClick={()=>nav("home")}><b>⌂</b>Inicio</button>
      <button className={tab==="talk"?"on":""} onClick={()=>nav("talk")}><b>🎤</b>Hablar</button>
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
