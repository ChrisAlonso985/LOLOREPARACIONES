"use client";

import { useEffect, useRef, useState } from "react";

type LiveAvatarResponse = {
  configured?: boolean;
  url?: string;
  sandbox?: boolean;
  message?: string;
  error?: string;
  avatarId?: string;
  avatarName?: string;
  avatarGender?: string;
};

export default function LiveAvatarPanel(){
  const [loading,setLoading]=useState(false);
  const [reconnecting,setReconnecting]=useState(false);
  const [url,setUrl]=useState("");
  const [error,setError]=useState("");
  const [sandbox,setSandbox]=useState(false);
  const [avatarName,setAvatarName]=useState("");
  const mountedRef=useRef(true);
  const seqRef=useRef(0);

  async function startLive(reconnect=false){
    const seq=++seqRef.current;
    if(reconnect) setReconnecting(true); else setLoading(true);
    setError("");
    try{
      const r=await fetch("/api/liveavatar/embed",{method:"POST",cache:"no-store"});
      const data:LiveAvatarResponse=await r.json().catch(()=>({}));
      if(!r.ok || !data.url) throw new Error(data.message||data.error||"No se pudo iniciar LiveAvatar.");
      if(!mountedRef.current || seq!==seqRef.current) return;
      setSandbox(Boolean(data.sandbox));
      setAvatarName(data.avatarName||"LOLO");
      setUrl(data.url);
    }catch(e){
      if(!mountedRef.current || seq!==seqRef.current) return;
      setError(e instanceof Error?e.message:"No se pudo iniciar LiveAvatar.");
    }finally{
      if(mountedRef.current){
        setLoading(false);
        setReconnecting(false);
      }
    }
  }

  function reconnectNow(){
    void startLive(true);
  }

  useEffect(()=>{
    mountedRef.current=true;
    return()=>{
      mountedRef.current=false;
      seqRef.current++;
    };
  },[]);

  return <div className={"liveAvatarCard "+(url?"live":"")}>
    <div className="liveAvatarHeader">
      <div>
        <span className="demoEyebrow">LOLO · LIVEAVATAR MASCULINO</span>
        <h3>{url?(reconnecting?"Reconectando…":"LOLO está en vivo"):"Iniciá el avatar en vivo"}</h3>
        <p className="muted">{url
          ?"La sesión se mantiene abierta mientras conversás. Ya no se reinicia por un temporizador."
          :"Tocá iniciar. LOLO selecciona un avatar masculino disponible y abre la conversación en vivo."}</p>
      </div>
      <span className={"liveBadge "+(url?"online":"")}>{reconnecting?"↻ RECONECTANDO":url?"● EN VIVO":"○ PREPARADO"}</span>
    </div>

    {!url && <div className="liveAvatarPreview robotPoster">
      <div className="robotPosterText">
        <b>LOLO</b>
        <span>Avatar masculino en vivo</span>
      </div>
      <button className="btn primary liveStart" onClick={()=>void startLive(false)} disabled={loading}>
        {loading?"Conectando LiveAvatar…":"▶ Iniciar LOLO en vivo"}
      </button>
    </div>}

    {url && <div className="liveAvatarFrameWrap">
      <iframe
        key={url}
        className="liveAvatarFrame"
        src={url}
        allow="microphone; autoplay; camera"
        title="LOLO LiveAvatar"
      />
      {reconnecting&&<div className="liveRenewOverlay">Reconectando LOLO…</div>}
    </div>}

    {url&&<div className="liveSessionBar">
      <span>👨 {avatarName||"Avatar masculino"}</span>
      <span>Sesión continua</span>
      <button onClick={reconnectNow} disabled={reconnecting}>↻ Reconectar</button>
    </div>}

    {error && <div className="notice liveAvatarError">
      <b>Problema de conexión.</b>
      <span>{error}</span>
      <button className="btn" onClick={()=>void startLive(Boolean(url))}>Reintentar</button>
    </div>}

    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 escucha</span><b>→</b><span>🧠 responde</span><b>→</b><span>🎥 LOLO se mueve</span>
    </div>

    {url&&<div className="demoNote">{sandbox
      ?"Modo Sandbox: la plataforma puede finalizar la sesión de prueba; si ocurre, usá Reconectar."
      :"La app ya no fuerza reinicios durante una respuesta. Reconectá solo si la sesión realmente se corta."}</div>}
  </div>;
}
