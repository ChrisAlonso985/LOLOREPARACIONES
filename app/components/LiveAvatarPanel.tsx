"use client";

import { useState } from "react";

type LiveAvatarResponse = {
  configured?: boolean;
  url?: string;
  sandbox?: boolean;
  message?: string;
  error?: string;
};

export default function LiveAvatarPanel(){
  const [loading,setLoading]=useState(false);
  const [url,setUrl]=useState("");
  const [error,setError]=useState("");
  const [sandbox,setSandbox]=useState(true);

  async function startLive(){
    setLoading(true);
    setError("");
    try{
      const r=await fetch("/api/liveavatar/embed",{method:"POST"});
      const data:LiveAvatarResponse=await r.json().catch(()=>({}));
      if(!r.ok || !data.url){
        throw new Error(data.message||data.error||"No se pudo iniciar LOLO en vivo.");
      }
      setSandbox(Boolean(data.sandbox));
      setUrl(data.url);
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudo iniciar LOLO en vivo.");
    }finally{
      setLoading(false);
    }
  }

  return <div className="liveAvatarCard">
    <div className="liveAvatarHeader">
      <div>
        <span className="demoEyebrow">LOLO · AVATAR EN VIVO</span>
        <h3>Conversá cara a cara con LOLO</h3>
        <p className="muted">El micrófono entra directo a la sesión en vivo y el avatar responde con labios, rostro y movimientos sincronizados.</p>
      </div>
      <span className={"liveBadge "+(url?"online":"")}>{url?"● EN VIVO":"○ LISTO"}</span>
    </div>

    {!url && <div className="liveAvatarPreview">
      <img src="/lolo-real.jpg" alt="LOLO, técnico de reparación"/>
      <div className="liveAvatarPreviewShade"></div>
      <button className="btn primary liveStart" onClick={()=>void startLive()} disabled={loading}>
        {loading?"Conectando LOLO…":"▶ Iniciar LOLO en vivo"}
      </button>
    </div>}

    {url && <div className="liveAvatarFrameWrap">
      <iframe
        className="liveAvatarFrame"
        src={url}
        allow="microphone; autoplay; camera"
        title="LOLO LiveAvatar"
      />
    </div>}

    {error && <div className="notice liveAvatarError">
      <b>Falta una sola conexión para encenderlo.</b>
      <span>{error}</span>
      <a href="https://app.liveavatar.com/developers" target="_blank" rel="noreferrer">Abrir LiveAvatar · Developers</a>
    </div>}

    <div className="avatarFlow">
      <span>🎤 Vos hablás</span><b>→</b><span>👂 LOLO escucha</span><b>→</b><span>🧠 responde</span><b>→</b><span>🗣️ avatar en vivo</span>
    </div>
    {url&&sandbox&&<div className="demoNote">Modo de prueba LiveAvatar: sesión corta y avatar público. Cuando carguemos el avatar propio de LOLO, esta misma pantalla usa su apariencia definitiva.</div>}
  </div>;
}
