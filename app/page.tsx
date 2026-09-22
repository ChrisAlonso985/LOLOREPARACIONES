"use client";

import { useEffect, useRef, useState } from "react";

const LOLO_FACE = "data:image/jpeg;base64,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";

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

export default function Page() {
  const [tab,setTab]=useState("home");
  const [speaking,setSpeaking]=useState(false);
  const [caption,setCaption]=useState("Hola, soy LOLO. Subime una foto de tu placa y te ayudo a medir sin adivinar.");
  const [messages,setMessages]=useState<ChatMessage[]>([{role:"assistant",content:"Hola. Soy LOLO. Si querés saber dónde poner el tester, entrá en “Tu placa”, sacá una foto y la analizo."}]);
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
  const [voiceMode,setVoiceMode]=useState<"ai"|"device">("ai");
  const [deviceVoice,setDeviceVoice]=useState("");
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
  const [installPrompt,setInstallPrompt]=useState<any>(null);
  const imageRef=useRef<HTMLImageElement|null>(null);
  const stageRef=useRef<HTMLDivElement|null>(null);
  const [imageBox,setImageBox]=useState({left:0,top:0,width:0,height:0});
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [recording,setRecording]=useState(false);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const micStreamRef=useRef<MediaStream|null>(null);
  const micChunksRef=useRef<Blob[]>([]);

  useEffect(()=>{
    const saved=localStorage.getItem("lolo.progress");
    if(saved) try{setProgress(JSON.parse(saved))}catch{}
    if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
    const fn=(e:any)=>{e.preventDefault();setInstallPrompt(e)};
    window.addEventListener("beforeinstallprompt",fn);
    return()=>window.removeEventListener("beforeinstallprompt",fn);
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
    setCaption(text.slice(0,170)+(text.length>170?"…":""));
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
      audio.onended=()=>setSpeaking(false);
      audio.onerror=()=>{setSpeaking(false);setMicError("La voz IA no pudo reproducirse. Tocá de nuevo Escuchar.")};
      await new Promise<void>((resolve)=>{
        if(audio.readyState>=3){resolve();return}
        const done=()=>{audio.removeEventListener("canplaythrough",done);resolve()};
        audio.addEventListener("canplaythrough",done);
        setTimeout(done,1200);
        audio.load();
      });
      await audio.play();
    }catch(e:any){
      setSpeaking(false);
      setMicError(e?.message||"No se pudo reproducir la voz masculina de LOLO.");
    }
  };

  const sendChat=async(text=input)=>{
    const q=text.trim();if(!q||busy)return;
    const next=[...messages,{role:"user",content:q} as ChatMessage];
    setMessages(next);setInput("");setBusy(true);
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");
      const ans=j.text||"No pude responder.";
      setMessages([...next,{role:"assistant",content:ans}]);speak(ans);
    }catch(e:any){
      const ans="No pude conectar con la IA en este momento. "+(e?.message||"");
      setMessages([...next,{role:"assistant",content:ans}]);
    }finally{setBusy(false)}
  };

  const startMic=async()=>{
    setMicError("");

    if(recording){
      if(recorderRef.current?.state === "recording") recorderRef.current.stop();
      return;
    }

    if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined"){
      setMicError("Este navegador no permite grabar audio. Probá Chrome actualizado en Android.");
      return;
    }

    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      micStreamRef.current=stream;
      const preferred=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec=preferred ? new MediaRecorder(stream,{mimeType:preferred}) : new MediaRecorder(stream);
      recorderRef.current=rec;
      micChunksRef.current=[];

      rec.ondataavailable=(e:BlobEvent)=>{if(e.data.size>0)micChunksRef.current.push(e.data)};
      rec.onstop=async()=>{
        setRecording(false);
        micStreamRef.current?.getTracks().forEach(t=>t.stop());
        const blob=new Blob(micChunksRef.current,{type:rec.mimeType||"audio/webm"});
        if(blob.size<800){
          setMicError("No escuché suficiente audio. Tocá el micrófono, hablá y volvé a tocar para enviar.");
          return;
        }
        setCaption("Estoy escuchando lo que dijiste…");
        try{
          const fd=new FormData();
          fd.append("audio",new File([blob],"voz-lolo.webm",{type:blob.type}));
          const r=await fetch("/api/transcribe",{method:"POST",body:fd});
          const j=await r.json();
          if(!r.ok)throw new Error(j.error||"No pude transcribir");
          const text=String(j.text||"").trim();
          if(!text)throw new Error("No pude reconocer lo que dijiste");
          setInput(text);
          await sendChat(text);
        }catch(e:any){
          setMicError(e?.message||"No pude procesar el audio.");
          setCaption("No pude entender el audio. Probá de nuevo.");
        }
      };

      rec.start();
      setRecording(true);
      setCaption("Te escucho. Hablá y tocá de nuevo el micrófono para enviar.");
      window.setTimeout(()=>{if(rec.state==="recording")rec.stop()},20000);
    }catch{
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

  const loadPhoto=async(file?:File)=>{
    if(!file)return;setVision(null);setVisionError("");
    try{setImage(await compressImage(file));setTab("plate");setCaption("Foto cargada. Completá los datos y tocá Analizar con visión IA.");}
    catch{setVisionError("No pude abrir esa imagen.")}
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

  const markerStyle=(m:Marker)=>({left:imageBox.left+m.x*imageBox.width,top:imageBox.top+m.y*imageBox.height});
  const cautionStyle=(c:Caution)=>({
    left:imageBox.left+c.x*imageBox.width,top:imageBox.top+c.y*imageBox.height,
    width:Math.max(45,c.radius*2*imageBox.width),height:Math.max(45,c.radius*2*imageBox.width)
  });

  const toggleStep=(i:number)=>{
    const n=progress.includes(i)?progress.filter(x=>x!==i):[...progress,i];
    setProgress(n);localStorage.setItem("lolo.progress",JSON.stringify(n));
  };

  return <main className="app">
    <header>
      <div><div className="logo">L<span>O</span>LO</div><div className="muted small">Tu profe IA de reparación</div></div>
      <div className="status"><span className={"dot "+(busy?"":"on")}></span>{busy?"Procesando…":"Listo"}</div>
    </header>

    <div className={"hero "+(speaking?"speaking":"")}>
      <div className="avatarWrap"><img className="avatar" src={LOLO_FACE} alt="LOLO"/><span className="mouthAnim" aria-hidden="true"></span><span className="liveBadge">{speaking?"HABLANDO":"LOLO"}</span></div>
      <div><div className="caption">{caption}</div><div className="wave"><i></i><i></i><i></i><i></i></div></div>
    </div>

    <section className={"section "+(tab==="home"?"active":"")}>
      <div className="panel"><h2>LOLO completo</h2>
        <div className="grid">
          <button className="card" onClick={()=>nav("plate")}><b>📷 Analizar tu placa</b><span className="muted small">Visión IA + marcas automáticas</span></button>
          <button className="card" onClick={()=>nav("talk")}><b>🎤 Hablar con LOLO</b><span className="muted small">Chat + micrófono + voz</span></button>
          <button className="card" onClick={()=>nav("course")}><b>🔌 Curso pin de carga</b><span className="muted small">7 pasos prácticos</span></button>
          <button className="card" onClick={()=>nav("settings")}><b>🔊 Voz de LOLO</b><span className="muted small">IA masculina + respaldo del teléfono</span></button>
        </div>
      </div>
      <div className="panel"><div className="tip good"><b>Regla de LOLO:</b> si la IA no puede justificar visualmente dónde está VBUS, no marca un punto. Te pide una foto mejor, modelo, esquema o una prueba adicional.</div></div>
      {installPrompt&&<button className="btn primary" onClick={async()=>{await installPrompt.prompt();setInstallPrompt(null)}}>📲 Instalar LOLO en este celular</button>}
    </section>

    <section className={"section "+(tab==="talk"?"active":"")}>
      <div className="panel"><h2>Hablá con LOLO</h2>
        {micError&&<div className="notice">{micError}</div>}
        <div className="chat">{messages.map((m,i)=><div key={i} className={"msg "+(m.role==="user"?"user":"bot")}>{m.content}</div>)}{busy&&<div className="msg sys">LOLO está pensando…</div>}</div>
        <div className="composer">
          <button className={"circle "+(recording?"on":"")} onClick={startMic} title={recording?"Detener y enviar":"Hablar con LOLO"}>{recording?"⏹️":"🎤"}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendChat()}} placeholder="Preguntale algo a LOLO"/>
          <label className="circle photoButton" style={{display:"grid",placeItems:"center"}}>📷<input hidden type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/></label>
          <button className="circle" onClick={()=>sendChat()} disabled={busy}>➤</button>
        </div>
      </div>
    </section>

    <section className={"section "+(tab==="plate"?"active":"")}>
      <div className="panel"><h2>Tu placa + visión IA</h2>
        <p className="muted">Sacá una foto enfocada de la subplaca completa y del pin de carga. Cuanta más zona alrededor se vea, mejor puede seguir pistas y test points.</p>
        <input type="file" accept="image/*" capture="environment" onChange={e=>loadPhoto(e.target.files?.[0])}/>
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

    <section className={"section "+(tab==="course"?"active":"")}>
      <div className="panel"><h2>Curso: pin de carga</h2><div className="steps">{COURSE.map((s,i)=><div className="step" key={i} onClick={()=>toggleStep(i)}><b>{progress.includes(i)?"✅":"⬜"} {i+1}. {s[0]}</b><span className="muted small">{s[1]}</span></div>)}</div></div>
      <div className="panel"><h2>Práctica</h2>{QUIZ.map((q,qi)=><Quiz key={qi} q={q}/>)}</div>
    </section>

    <section className={"section "+(tab==="settings"?"active":"")}>
      <div className="panel settings"><h2>Voz de LOLO</h2>
        <div className="tip good">LOLO usa por defecto su <b>voz IA masculina</b>. Ya no cambia automáticamente a una voz femenina del teléfono.</div>
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
      <button className={tab==="course"?"on":""} onClick={()=>nav("course")}><b>🔌</b>Curso</button>
      <button className={tab==="settings"?"on":""} onClick={()=>nav("settings")}><b>⚙️</b>Ajustes</button>
    </nav>
  </main>
}

function Quiz({q}:{q:readonly [string,readonly string[],number]}){
  const [picked,setPicked]=useState<number|null>(null);
  return <div className="quizQ"><b>{q[0]}</b>{q[1].map((o,i)=><button key={i} className={"btn "+(picked!==null?(i===q[2]?"good":picked===i?"danger":""):"")} disabled={picked!==null} onClick={()=>setPicked(i)}>{o}</button>)}</div>
}
