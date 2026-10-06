"use client";

type Mode="idle"|"listening"|"thinking"|"speaking";

export default function FreeLolo3D({mode,caption}:{mode:Mode;caption:string}){
  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PENSANDO":mode==="speaking"?"HABLANDO":"LISTO";
  return <div className={"humanLoloCard "+mode}>
    <div className="humanLoloTop">
      <div>
        <span className="demoEyebrow">LOLO · PROFE IA</span>
        <h3>Tu profe de reparación</h3>
        <p className="muted">Avatar propio dentro de la app · sin pagar servicios de avatar.</p>
      </div>
      <span className={"humanLoloBadge "+mode}>● {label}</span>
    </div>

    <div className={"humanLoloStage "+mode}>
      <div className="humanLoloGlow" aria-hidden="true"></div>
      <img className="humanLoloImage" src="/lolo/listening.svg" alt="LOLO, profesor IA de reparación"/>
      {mode==="thinking"&&<div className="humanThinking" aria-hidden="true"><i></i><i></i><i></i></div>}
      {mode==="speaking"&&<div className="humanVoiceBars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>}
      {mode==="listening"&&<div className="humanListenPulse" aria-hidden="true"></div>}
      <div className="humanLoloCaption">{caption}</div>
    </div>

    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 te escucha</span><b>→</b><span>🧠 piensa</span><b>→</b><span>🗣️ responde</span>
    </div>
    <div className="free3dNote">Sin LiveAvatar · sin créditos · sin costo extra de avatar</div>
  </div>;
}
