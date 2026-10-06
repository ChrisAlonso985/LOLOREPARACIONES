"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Mode="idle"|"listening"|"thinking"|"speaking";

export default function FreeLolo3D({mode,caption}:{mode:Mode;caption:string}){
  const mountRef=useRef<HTMLDivElement|null>(null);
  const modeRef=useRef<Mode>(mode);
  modeRef.current=mode;

  useEffect(()=>{
    const host=mountRef.current;
    if(!host)return;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(31,1,.1,100);
    camera.position.set(0,.35,7.8);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    host.appendChild(renderer.domElement);

    // Materiales
    const skin=new THREE.MeshStandardMaterial({color:0xd9a078,roughness:.63,metalness:.02});
    const skinShadow=new THREE.MeshStandardMaterial({color:0xb97758,roughness:.68});
    const hair=new THREE.MeshStandardMaterial({color:0x24160f,roughness:.88});
    const beard=new THREE.MeshStandardMaterial({color:0x3a241b,roughness:.9});
    const eyeWhite=new THREE.MeshStandardMaterial({color:0xf7fbff,roughness:.35});
    const iris=new THREE.MeshStandardMaterial({color:0x6b4a2d,roughness:.3});
    const pupil=new THREE.MeshStandardMaterial({color:0x090909,roughness:.15});
    const mouthDark=new THREE.MeshStandardMaterial({color:0x341014,roughness:.75});
    const lip=new THREE.MeshStandardMaterial({color:0x9a5552,roughness:.68});
    const black=new THREE.MeshStandardMaterial({color:0x0a0e15,metalness:.18,roughness:.5});
    const jacket=new THREE.MeshStandardMaterial({color:0x1a2230,metalness:.28,roughness:.42});
    const jacketGray=new THREE.MeshStandardMaterial({color:0x4b5564,metalness:.18,roughness:.55});
    const blue=new THREE.MeshStandardMaterial({color:0x1597ff,emissive:0x075fba,emissiveIntensity:1.45,metalness:.35,roughness:.28});
    const cyan=new THREE.MeshStandardMaterial({color:0x4deaff,emissive:0x16a9d8,emissiveIntensity:2.15,metalness:.35,roughness:.2});
    const metal=new THREE.MeshStandardMaterial({color:0x263342,metalness:.8,roughness:.25});
    const panelMat=new THREE.MeshBasicMaterial({color:0x0b3b63,transparent:true,opacity:.32});
    const neonMat=new THREE.MeshBasicMaterial({color:0x25c7ff,transparent:true,opacity:.7});

    // Iluminación
    scene.add(new THREE.HemisphereLight(0xd6efff,0x06101a,2.35));
    const key=new THREE.DirectionalLight(0xffe4d5,4.1);key.position.set(3.5,5.5,5.5);scene.add(key);
    const rim=new THREE.PointLight(0x25c7ff,20,12);rim.position.set(-4,2,4);scene.add(rim);
    const fill=new THREE.PointLight(0x5577ff,10,9);fill.position.set(4,-.2,2.5);scene.add(fill);

    // Fondo de taller futurista
    const bg=new THREE.Group();scene.add(bg);bg.position.z=-2.3;
    for(let i=0;i<5;i++){
      const p=new THREE.Mesh(new THREE.BoxGeometry(.95,.55,.05),panelMat);
      p.position.set(-2.7+(i%2)*1.15,1.85-Math.floor(i/2)*.75,0);
      bg.add(p);
    }
    const board=new THREE.Mesh(new THREE.BoxGeometry(1.45,2.6,.05),panelMat);
    board.position.set(2.7,.55,0);bg.add(board);
    for(let i=0;i<6;i++){
      const line=new THREE.Mesh(new THREE.BoxGeometry(.75,.025,.02),neonMat);
      line.position.set(2.7,1.55-i*.35,.04);bg.add(line);
    }
    const bench=new THREE.Mesh(new THREE.BoxGeometry(7,.18,2.3),new THREE.MeshStandardMaterial({color:0x0b1520,metalness:.45,roughness:.35}));
    bench.position.set(0,-2.65,-.2);scene.add(bench);

    // Grupo personaje
    const person=new THREE.Group();scene.add(person);person.position.y=-.25;

    // Torso / ropa
    const torso=new THREE.Mesh(new THREE.BoxGeometry(2.55,2.05,1.12,8,6,4),jacket);
    torso.position.y=-1.25;torso.scale.set(1,.95,1);person.add(torso);

    const shirt=new THREE.Mesh(new THREE.BoxGeometry(1.28,1.45,1.16),black);
    shirt.position.set(0,-1.1,.02);person.add(shirt);

    const shoulderL=new THREE.Mesh(new THREE.SphereGeometry(.54,28,20),jacketGray);
    const shoulderR=shoulderL.clone();
    shoulderL.position.set(-1.42,-.72,.02);shoulderR.position.set(1.42,-.72,.02);
    shoulderL.scale.set(1.08,.78,.9);shoulderR.scale.copy(shoulderL.scale);
    person.add(shoulderL,shoulderR);

    const stripeL=new THREE.Mesh(new THREE.BoxGeometry(.16,1.42,1.18),blue);
    const stripeR=stripeL.clone();
    stripeL.position.set(-.92,-1.05,.08);stripeR.position.set(.92,-1.05,.08);
    stripeL.rotation.z=-.16;stripeR.rotation.z=.16;
    person.add(stripeL,stripeR);

    // Logo LOLO como textura de canvas
    const logoCanvas=document.createElement("canvas");logoCanvas.width=512;logoCanvas.height=180;
    const g=logoCanvas.getContext("2d");
    if(g){
      g.clearRect(0,0,512,180);
      g.font="900 92px Arial";g.textAlign="center";g.textBaseline="middle";
      g.fillStyle="#f5fbff";g.fillText("LOLO",256,92);
      g.strokeStyle="#38d7ff";g.lineWidth=9;g.beginPath();g.arc(294,92,23,0,Math.PI*2);g.stroke();
    }
    const logoTex=new THREE.CanvasTexture(logoCanvas);logoTex.colorSpace=THREE.SRGBColorSpace;
    const logo=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.44),new THREE.MeshBasicMaterial({map:logoTex,transparent:true}));
    logo.position.set(0,-1.06,.595);person.add(logo);

    // Cuello
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.34,.4,.55,28),skinShadow);
    neck.position.y=.15;person.add(neck);

    // Cabeza y pivote
    const headPivot=new THREE.Group();headPivot.position.y=1.15;person.add(headPivot);
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.02,48,36),skin);
    head.scale.set(.9,1.08,.83);headPivot.add(head);

    // Orejas
    const earL=new THREE.Mesh(new THREE.SphereGeometry(.2,24,18),skin);
    const earR=earL.clone();
    earL.scale.set(.55,1,.45);earR.scale.copy(earL.scale);
    earL.position.set(-.91,.02,0);earR.position.set(.91,.02,0);
    headPivot.add(earL,earR);

    // Ojos y párpados
    const eyeGroupL=new THREE.Group(),eyeGroupR=new THREE.Group();
    eyeGroupL.position.set(-.34,.16,.79);eyeGroupR.position.set(.34,.16,.79);
    headPivot.add(eyeGroupL,eyeGroupR);
    const makeEye=(group:THREE.Group)=>{
      const white=new THREE.Mesh(new THREE.SphereGeometry(.18,24,18),eyeWhite);
      white.scale.set(1.18,.72,.36);group.add(white);
      const ir=new THREE.Mesh(new THREE.SphereGeometry(.085,20,16),iris);ir.position.z=.145;group.add(ir);
      const pu=new THREE.Mesh(new THREE.SphereGeometry(.04,18,14),pupil);pu.position.z=.215;group.add(pu);
      return {white,ir,pu};
    };
    makeEye(eyeGroupL);makeEye(eyeGroupR);

    const browL=new THREE.Mesh(new THREE.BoxGeometry(.34,.055,.045),hair);
    const browR=browL.clone();
    browL.position.set(-.34,.42,.83);browR.position.set(.34,.42,.83);
    browL.rotation.z=.08;browR.rotation.z=-.08;headPivot.add(browL,browR);

    // Nariz
    const nose=new THREE.Mesh(new THREE.ConeGeometry(.13,.38,20),skinShadow);
    nose.rotation.x=Math.PI/2;nose.position.set(0,-.02,.92);headPivot.add(nose);

    // Barba
    const beardChin=new THREE.Mesh(new THREE.SphereGeometry(.58,32,22),beard);
    beardChin.scale.set(.82,.35,.82);beardChin.position.set(0,-.52,.47);headPivot.add(beardChin);
    const beardL=new THREE.Mesh(new THREE.BoxGeometry(.16,.46,.09),beard);
    const beardR=beardL.clone();
    beardL.position.set(-.52,-.31,.74);beardR.position.set(.52,-.31,.74);
    beardL.rotation.z=.24;beardR.rotation.z=-.24;headPivot.add(beardL,beardR);

    // Boca animada
    const mouthGroup=new THREE.Group();mouthGroup.position.set(0,-.39,.86);headPivot.add(mouthGroup);
    const mouthOpen=new THREE.Mesh(new THREE.SphereGeometry(.21,24,18),mouthDark);
    mouthOpen.scale.set(1.05,.12,.16);mouthGroup.add(mouthOpen);
    const upperLip=new THREE.Mesh(new THREE.BoxGeometry(.42,.055,.035),lip);
    upperLip.position.y=.055;mouthGroup.add(upperLip);
    const lowerLip=new THREE.Mesh(new THREE.BoxGeometry(.39,.055,.035),lip);
    lowerLip.position.y=-.055;mouthGroup.add(lowerLip);

    // Pelo: mechones
    const hairGroup=new THREE.Group();headPivot.add(hairGroup);
    const hairPos=[
      [-.62,.72,.15],[-.35,.86,.22],[-.05,.91,.2],[.27,.86,.18],[.56,.72,.12],
      [-.72,.48,.08],[-.48,.62,.42],[-.18,.72,.48],[.16,.72,.46],[.46,.62,.38],[.7,.45,.08],
      [-.2,1.0,-.02],[.15,1.0,-.02]
    ];
    hairPos.forEach(([x,y,z],i)=>{
      const h=new THREE.Mesh(new THREE.SphereGeometry(.29+(i%3)*.025,22,16),hair);
      h.scale.set(1.15,.68,.9);h.position.set(x,y,z);h.rotation.z=(i%2?.25:-.25);hairGroup.add(h);
    });

    // Auricular headset
    const cupL=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.18,28),metal);
    const cupR=cupL.clone();
    cupL.rotation.z=Math.PI/2;cupR.rotation.z=Math.PI/2;
    cupL.position.set(-1.03,.08,.02);cupR.position.set(1.03,.08,.02);
    headPivot.add(cupL,cupR);
    const glowL=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,12,32),cyan);
    const glowR=glowL.clone();glowL.rotation.y=Math.PI/2;glowR.rotation.y=Math.PI/2;
    glowL.position.copy(cupL.position);glowR.position.copy(cupR.position);headPivot.add(glowL,glowR);

    const band=new THREE.Mesh(new THREE.TorusGeometry(1.02,.055,12,60,Math.PI),metal);
    band.rotation.z=Math.PI;band.position.y=.28;headPivot.add(band);

    const boomPivot=new THREE.Group();boomPivot.position.set(1.02,.03,.02);headPivot.add(boomPivot);
    const boom=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.78,10),metal);
    boom.rotation.z=Math.PI/2.35;boom.position.set(-.24,-.23,.42);boomPivot.add(boom);
    const mic=new THREE.Mesh(new THREE.SphereGeometry(.07,18,14),cyan);
    mic.position.set(-.52,-.45,.68);boomPivot.add(mic);

    // Brazos simples para gestos
    const makeArm=(side:number)=>{
      const shoulder=new THREE.Group();shoulder.position.set(side*1.38,-.7,0);person.add(shoulder);
      const upper=new THREE.Mesh(new THREE.CylinderGeometry(.24,.3,1.1,22),jacketGray);
      upper.position.y=-.55;upper.rotation.z=side*.12;shoulder.add(upper);
      const fore=new THREE.Mesh(new THREE.CylinderGeometry(.19,.23,.92,22),jacket);
      fore.position.set(side*.12,-1.42,.15);fore.rotation.z=side*.12;shoulder.add(fore);
      const hand=new THREE.Mesh(new THREE.SphereGeometry(.25,22,16),skin);
      hand.scale.set(.85,1.05,.72);hand.position.set(side*.2,-1.93,.22);shoulder.add(hand);
      return shoulder;
    };
    const leftArm=makeArm(-1),rightArm=makeArm(1);

    // Piso luminoso
    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.35,64),new THREE.MeshBasicMaterial({color:0x0e8bb8,transparent:true,opacity:.11,side:THREE.DoubleSide}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-2.58;scene.add(floor);

    let pointerX=0,pointerY=0;
    const onPointer=(e:PointerEvent)=>{
      const rect=host.getBoundingClientRect();
      pointerX=((e.clientX-rect.left)/Math.max(1,rect.width)-.5)*2;
      pointerY=((e.clientY-rect.top)/Math.max(1,rect.height)-.5)*2;
    };
    host.addEventListener("pointermove",onPointer,{passive:true});

    const resize=()=>{
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);ro.observe(host);resize();

    const clock=new THREE.Clock();
    let raf=0;
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime(),m=modeRef.current;

      // respiración y movimiento general
      person.position.y=-.25+Math.sin(t*1.35)*.025;
      torso.scale.y=.95+Math.sin(t*1.35)*.006;

      // mirada / cabeza
      let yaw=pointerX*.10,pitch=-pointerY*.04,roll=Math.sin(t*.7)*.008;
      if(m==="listening"){roll=-.055+Math.sin(t*2.1)*.012;yaw+=.03}
      if(m==="thinking"){yaw=.12+Math.sin(t*1.2)*.025;pitch=-.07}
      if(m==="speaking"){yaw+=Math.sin(t*2.6)*.025;roll=Math.sin(t*2.2)*.018}

      headPivot.rotation.y+=(yaw-headPivot.rotation.y)*.05;
      headPivot.rotation.x+=(pitch-headPivot.rotation.x)*.05;
      headPivot.rotation.z+=(roll-headPivot.rotation.z)*.05;

      // parpadeo
      const blink=(Math.sin(t*.92)>0.993 || Math.sin(t*.47+1.8)>0.997)?.09:1;
      eyeGroupL.scale.y+=(blink-eyeGroupL.scale.y)*.55;
      eyeGroupR.scale.y+=(blink-eyeGroupR.scale.y)*.55;

      // boca / mandíbula simulada
      const talk=m==="speaking"?(0.18+Math.abs(Math.sin(t*8.5)+Math.sin(t*12.7)*.35)*.42):.12;
      mouthOpen.scale.y+=(talk-mouthOpen.scale.y)*.38;
      lowerLip.position.y+=((-0.055-(m==="speaking"?talk*.07:0))-lowerLip.position.y)*.35;
      beardChin.position.y+=((-0.52-(m==="speaking"?talk*.035:0))-beardChin.position.y)*.3;

      // luces según estado
      cyan.emissiveIntensity=m==="speaking"?2.6+Math.sin(t*10)*.6:m==="listening"?2.45+Math.sin(t*5)*.35:2.0;
      blue.emissiveIntensity=m==="thinking"?2.0+Math.sin(t*3)*.5:1.45;

      // gestos con brazos
      const leftTarget=m==="listening"?.34:m==="speaking"?.16:.06;
      const rightTarget=m==="speaking"?-.62+Math.sin(t*2.4)*.08:m==="thinking"?-.18:-.08;
      leftArm.rotation.z+=(leftTarget-leftArm.rotation.z)*.07;
      rightArm.rotation.z+=(rightTarget-rightArm.rotation.z)*.07;

      renderer.render(scene,camera);
    };
    animate();

    return()=>{
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove",onPointer);
      scene.traverse((o:any)=>{
        o.geometry?.dispose?.();
        const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
        mats.forEach((m:any)=>{m.map?.dispose?.();m.dispose?.();});
      });
      logoTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  },[]);

  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PENSANDO":mode==="speaking"?"HABLANDO":"LISTO";
  return <div className={"humanLoloCard "+mode}>
    <div className="humanLoloTop">
      <div>
        <span className="demoEyebrow">LOLO · AVATAR 3D</span>
        <h3>Tu profe 3D de reparación</h3>
        <p className="muted">Avatar propio renderizado dentro de la app · sin pagar servicios externos.</p>
      </div>
      <span className={"humanLoloBadge "+mode}>● {label}</span>
    </div>
    <div className={"humanLoloStage threeD "+mode}>
      <div ref={mountRef} className="loloHuman3DCanvas" aria-label="LOLO humano 3D interactivo"/>
      <div className="humanLoloCaption">{caption}</div>
    </div>
    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 escucha</span><b>→</b><span>🧠 piensa</span><b>→</b><span>🗣️ mueve la boca y responde</span>
    </div>
    <div className="free3dNote">Avatar 3D propio · sin LiveAvatar · sin créditos · sin costo extra de avatar</div>
  </div>;
}
