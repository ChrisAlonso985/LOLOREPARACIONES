"use client";

import { useEffect, useRef, useState } from "react";

type LiveAvatarResponse = {
  configured?: boolean;
  url?: string;
  sandbox?: boolean;
  message?: string;
  error?: string;
  avatarId?: string;
};

export default function LiveAvatarPanel(){
  const [loading,setLoading]=useState(false);
  const [url,setUrl]=useState("");
  const [error,setError]=useState("");
  const [sandbox,setSandbox]=useState(true);
  const frameRef=useRef<HTMLIFrameElement|null>(null);

  async function startLive(){
    setLoading(true);
    setError("");
    try{
      const r=await fetch("/api/liveavatar/embed",{method:"POST",cache:"no-store"});
      const data:LiveAvatarResponse=await r.json().catch(()=>({}));
      if(!r.ok || !data.url) throw new Error(data.message||data.error||"No se pudo iniciar LiveAvatar.");
      setSandbox(Boolean(data.sandbox));
      setUrl(data.url);
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudo iniciar LiveAvatar.");
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    return()=>{ setUrl(""); };
  },[]);

  return <div className={"liveAvatarCard "+(url?"live":"")}>
    <div className="liveAvatarHeader">
      <div>
        <span className="demoEyebrow">LOLO · LIVEAVATAR REAL</span>
        <h3>{url?"LOLO está en vivo":"Iniciá el avatar en vivo"}</h3>
        <p className="muted">{url
          ?"Ahora sí estás viendo un stream de avatar real. Permití el micrófono y hablale normalmente."
          :"Tocá iniciar. Se abre una sesión LiveAvatar con video, movimiento facial, labios y voz sincronizada."}</p>
      </div>
      <span className={"liveBadge "+(url?"online":"")}>{url?"● EN VIVO":"○ PREPARADO"}</span>
    </div>

    {!url && <div className="liveAvatarPreview robotPoster">
      <div className="robotPosterText">
        <b>LOLO</b>
        <span>Avatar en vivo listo para iniciar</span>
      </div>
      <button className="btn primary liveStart" onClick={()=>void startLive()} disabled={loading}>
        {loading?"Conectando LiveAvatar…":"▶ Iniciar avatar en vivo"}
      </button>
    </div>}

    {url && <div className="liveAvatarFrameWrap">
      <iframe
        ref={frameRef}
        className="liveAvatarFrame"
        src={url}
        allow="microphone; autoplay; camera"
        title="LOLO LiveAvatar"
      />
    </div>}

    {error && <div className="notice liveAvatarError">
      <b>No se pudo abrir la sesión.</b>
      <span>{error}</span>
    </div>}

    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 escucha</span><b>→</b><span>🧠 responde</span><b>→</b><span>🎥 avatar se mueve</span>
    </div>

    {!url&&<div className="demoNote">La imagen estática anterior ya no se usa como “avatar vivo”. El movimiento real empieza al iniciar esta sesión.</div>}
    {url&&sandbox&&<div className="demoNote">Modo Free/Sandbox: usa un avatar público de LiveAvatar y la sesión tiene límites de prueba. Para usar el robot LOLO como personaje vivo propio hace falta crear un avatar personalizado en LiveAvatar.</div>}
  </div>;
}
