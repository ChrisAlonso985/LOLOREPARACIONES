"use client";

import { useEffect, useRef, useState } from "react";

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
    window.speechSynthesis.cancel();window.speechSynthesis.resume();
    const parts=(text.replace(/\s+/g," ").match(/[^.!?]+[.!?]?/g)||[text]).flatMap(s=>{
      const out:string[]=[];let t=s.trim();while(t.length>170){let c=t.lastIndexOf(" ",170);if(c<80)c=170;out.push(t.slice(0,c));t=t.slice(c).trim()}if(t)out.push(t);return out;
    });
    setSpeaking(true);let i=0;
    const next=()=>{if(i>=parts.length){setSpeaking(false);return}
      const u=new SpeechSynthesisUtterance(parts[i++]);
      const v=voices.find(v=>v.name===deviceVoice)||voices.find(v=>v.lang.toLowerCase().startsWith("es"));
      if(v){u.voice=v;u.lang=v.lang}else u.lang="es-AR";
      u.rate=.97;u.pitch=.88;u.onend=()=>setTimeout(next,70);u.onerror=()=>setTimeout(next,90);
      window.speechSynthesis.speak(u);
    };next();
  };

  const speak=async(text:string)=>{
    setCaption(text.slice(0,170)+(text.length>170?"…":""));
    if(voiceMode==="device"){browserSpeak(text);return}
    setSpeaking(true);
    try{
      const r=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
      if(!r.ok) throw new Error("tts");
      const j=await r.json();
      const audio=new Audio(`data:${j.mime||"audio/mpeg"};base64,${j.audio}`);
      audioRef.current?.pause();audioRef.current=audio;
      audio.onended=()=>setSpeaking(false);audio.onerror=()=>{setSpeaking(false);browserSpeak(text)};
      await audio.play();
    }catch{setSpeaking(false);browserSpeak(text)}
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
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){setMicError("Este navegador no ofrece reconocimiento de voz. Probá Chrome en Android.");return}
    try{
      const st=await navigator.mediaDevices.getUserMedia({audio:true});st.getTracks().forEach(t=>t.stop());
      const r=new SR();r.lang="es-AR";r.continuous=false;r.interimResults=false;
      r.onresult=(e:any)=>{const t=e.results[0][0].transcript;setInput(t);sendChat(t)};
      r.onerror=()=>setMicError("No pude usar el micrófono. Revisá el permiso del sitio.");
      r.start();
    }catch{setMicError("El micrófono está bloqueado. Permitilo desde la configuración del sitio.")}
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
      <img className="avatar" src="https://resource2.heygen.ai/video/a3189b5905cffb7c23f33f2b7f3a2177/gif.gif" alt="LOLO"/>
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
          <button className="circle" onClick={startMic}>🎤</button>
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
        <div className="tip good">La opción recomendada es <b>Voz IA masculina</b>. Si no está configurada todavía, LOLO usa la voz del teléfono como respaldo.</div>
        <label>Modo de voz</label>
        <select value={voiceMode} onChange={e=>setVoiceMode(e.target.value as any)}>
          <option value="ai">Voz IA masculina (recomendada)</option>
          <option value="device">Voz instalada en el teléfono</option>
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
