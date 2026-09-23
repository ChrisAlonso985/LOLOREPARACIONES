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
  renewAfterSeconds?: number;
};

export default function LiveAvatarPanel(){
  const [loading,setLoading]=useState(false);
  const [renewing,setRenewing]=useState(false);
  const [url,setUrl]=useState("");
  const [error,setError]=useState("");
  const [sandbox,setSandbox]=useState(false);
  const [avatarName,setAvatarName]=useState("");
  const [secondsLeft,setSecondsLeft]=useState(0);
  const renewTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const mountedRef=useRef(true);
  const seqRef=useRef(0);

  function clearTimers(){
    if(renewTimerRef.current) clearTimeout(renewTimerRef.current);
    if(tickRef.current) clearInterval(tickRef.current);
    renewTimerRef.current=null;
    tickRef.current=null;
  }

  function scheduleRenew(seconds:number){
    clearTimers();
    setSecondsLeft(seconds);
    tickRef.current=setInterval(()=>{
      setSecondsLeft(v=>Math.max(0,v-1));
    },1000);
    renewTimerRef.current=setTimeout(()=>{
      void startLive(true);
    },seconds*1000);
  }

  async function startLive(auto=false){
    const seq=++seqRef.current;
    if(auto) setRenewing(true); else setLoading(true);
    setError("");
    try{
      const r=await fetch("/api/liveavatar/embed",{method:"POST",cache:"no-store"});
      const data:LiveAvatarResponse=await r.json().catch(()=>({}));
      if(!r.ok || !data.url) throw new Error(data.message||data.error||"No se pudo iniciar LiveAvatar.");
      if(!mountedRef.current || seq!==seqRef.current) return;
      setSandbox(Boolean(data.sandbox));
      setAvatarName(data.avatarName||"LOLO");
      setUrl(data.url);
      scheduleRenew(Math.max(30,data.renewAfterSeconds||105));
    }catch(e){
      if(!mountedRef.current || seq!==seqRef.current) return;
      const msg=e instanceof Error?e.message:"No se pudo iniciar LiveAvatar.";
      setError(msg);
      if(auto){
        // Reintento controlado si la renovación falla por red.
        renewTimerRef.current=setTimeout(()=>void startLive(true),15000);
      }
    }finally{
      if(mountedRef.current){
        setLoading(false);
        setRenewing(false);
      }
    }
  }

  function reconnectNow(){
    clearTimers();
    void startLive(true);
  }

  useEffect(()=>{
    mountedRef.current=true;
    return()=>{
      mountedRef.current=false;
      clearTimers();
      seqRef.current++;
    };
  },[]);

  return <div className={"liveAvatarCard "+(url?"live":"")}>
    <div className="liveAvatarHeader">
      <div>
        <span className="demoEyebrow">LOLO · LIVEAVATAR MASCULINO</span>
        <h3>{url?(renewing?"Renovando sesión…":"LOLO está en vivo"):"Iniciá el avatar en vivo"}</h3>
        <p className="muted">{url
          ?"El avatar se renueva automáticamente antes del límite de la sesión para evitar que quede congelado."
          :"Tocá iniciar. LOLO selecciona un avatar masculino disponible y abre la conversación en vivo."}</p>
      </div>
      <span className={"liveBadge "+(url?"online":"")}>{renewing?"↻ RENOVANDO":url?"● EN VIVO":"○ PREPARADO"}</span>
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
        onError={()=>reconnectNow()}
      />
      {renewing&&<div className="liveRenewOverlay">Reconectando LOLO…</div>}
    </div>}

    {url&&<div className="liveSessionBar">
      <span>👨 {avatarName||"Avatar masculino"}</span>
      <span>Renovación automática en {secondsLeft}s</span>
      <button onClick={reconnectNow} disabled={renewing}>↻ Reconectar</button>
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
      ?"Modo Sandbox: sesión de prueba corta con renovación automática."
      :"Modo Free/producción: LiveAvatar limita cada sesión; LOLO abre una nueva antes del vencimiento para evitar el congelamiento."}</div>}
  </div>;
}
