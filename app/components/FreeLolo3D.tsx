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
    if(!host) return;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(32,1,.1,100);
    camera.position.set(0,.35,8.2);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    host.appendChild(renderer.domElement);

    const white=new THREE.MeshStandardMaterial({color:0xe9f3f8,metalness:.72,roughness:.22});
    const dark=new THREE.MeshStandardMaterial({color:0x071019,metalness:.85,roughness:.18});
    const cyan=new THREE.MeshStandardMaterial({color:0x4deaff,emissive:0x16a9d8,emissiveIntensity:2.3,metalness:.45,roughness:.18});
    const blue=new THREE.MeshStandardMaterial({color:0x269cff,emissive:0x116fe8,emissiveIntensity:1.9,metalness:.5,roughness:.18});
    const joint=new THREE.MeshStandardMaterial({color:0x263b49,metalness:.9,roughness:.2});

    scene.add(new THREE.HemisphereLight(0xbfefff,0x071018,2.15));
    const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(3,5,6);scene.add(key);
    const rim=new THREE.PointLight(0x23cfff,18,12);rim.position.set(-4,1,4);scene.add(rim);
    const fill=new THREE.PointLight(0x2a62ff,10,10);fill.position.set(4,-1,2);scene.add(fill);

    const robot=new THREE.Group(); scene.add(robot);
    robot.position.y=-.22;

    const torso=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.05,1.05,4,4,4),dark);
    torso.position.y=-.85; torso.scale.set(1,.95,1); robot.add(torso);

    const chestPlate=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.2,1.12),white);
    chestPlate.position.set(0,-.45,.02); chestPlate.rotation.x=-.08; robot.add(chestPlate);

    const core=new THREE.Mesh(new THREE.SphereGeometry(.28,32,24),cyan);
    core.position.set(0,-.62,.67); robot.add(core);
    const coreRing=new THREE.Mesh(new THREE.TorusGeometry(.43,.055,16,48),blue);
    coreRing.position.copy(core.position); robot.add(coreRing);

    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,.5,24),joint);
    neck.position.y=.45; robot.add(neck);

    const headPivot=new THREE.Group(); headPivot.position.y=1.18; robot.add(headPivot);
    const head=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),white);
    head.scale.set(1.38,.9,.82); headPivot.add(head);

    const visor=new THREE.Mesh(new THREE.SphereGeometry(.92,48,28),dark);
    visor.scale.set(1.18,.64,.87); visor.position.z=.25; headPivot.add(visor);

    const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.17,24,18),cyan);
    const eyeR=eyeL.clone();
    eyeL.scale.set(1.35,.62,.35); eyeR.scale.copy(eyeL.scale);
    eyeL.position.set(-.42,.12,.88); eyeR.position.set(.42,.12,.88);
    headPivot.add(eyeL,eyeR);

    const mouth=new THREE.Group(); mouth.position.set(0,-.28,.94); headPivot.add(mouth);
    const mouthBars:THREE.Mesh[]=[];
    for(let i=0;i<7;i++){
      const bar=new THREE.Mesh(new THREE.BoxGeometry(.07,.22,.045),cyan);
      bar.position.x=(i-3)*.12;
      mouth.add(bar); mouthBars.push(bar);
    }

    const earGeo=new THREE.CylinderGeometry(.25,.25,.22,32);
    const earL=new THREE.Mesh(earGeo,joint); const earR=earL.clone();
    earL.rotation.z=Math.PI/2; earR.rotation.z=Math.PI/2;
    earL.position.set(-1.45,0,.02); earR.position.set(1.45,0,.02);
    headPivot.add(earL,earR);
    const earGlowL=new THREE.Mesh(new THREE.TorusGeometry(.29,.04,12,32),cyan);
    const earGlowR=earGlowL.clone();
    earGlowL.rotation.y=Math.PI/2; earGlowR.rotation.y=Math.PI/2;
    earGlowL.position.copy(earL.position); earGlowR.position.copy(earR.position);
    headPivot.add(earGlowL,earGlowR);

    const antennaStem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.42,12),joint);
    antennaStem.position.set(0,1.02,0); headPivot.add(antennaStem);
    const antennaTip=new THREE.Mesh(new THREE.SphereGeometry(.1,18,12),cyan);
    antennaTip.position.set(0,1.25,0); headPivot.add(antennaTip);

    function makeArm(side:number){
      const shoulder=new THREE.Group();
      shoulder.position.set(side*1.3,-.1,0);
      robot.add(shoulder);

      const shoulderShell=new THREE.Mesh(new THREE.SphereGeometry(.46,28,20),white);
      shoulderShell.scale.set(1.05,.82,.9); shoulder.add(shoulderShell);

      const upper=new THREE.Mesh(new THREE.CylinderGeometry(.23,.27,1.05,24),white);
      upper.position.set(side*.1,-.65,0); upper.rotation.z=side*.12; shoulder.add(upper);

      const elbow=new THREE.Mesh(new THREE.SphereGeometry(.27,24,18),joint);
      elbow.position.set(side*.16,-1.2,0); shoulder.add(elbow);

      const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.92,24),white);
      forearm.position.set(side*.26,-1.68,.02); forearm.rotation.z=side*.18; shoulder.add(forearm);

      const hand=new THREE.Mesh(new THREE.SphereGeometry(.28,28,20),white);
      hand.scale.set(.85,1.05,.72); hand.position.set(side*.35,-2.18,.03); shoulder.add(hand);
      return shoulder;
    }
    const leftArm=makeArm(-1);
    const rightArm=makeArm(1);

    const halo=new THREE.Group(); halo.position.set(0,.6,-1.15); robot.add(halo);
    for(const r of [1.8,2.15]){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.015,8,96),new THREE.MeshBasicMaterial({color:0x2bcfff,transparent:true,opacity:r===1.8?.42:.18}));
      halo.add(ring);
    }

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(2.25,64),
      new THREE.MeshBasicMaterial({color:0x0d6f98,transparent:true,opacity:.12,side:THREE.DoubleSide})
    );
    floor.rotation.x=-Math.PI/2; floor.position.y=-3.05; scene.add(floor);

    let pointerX=0,pointerY=0;
    const onPointer=(e:PointerEvent)=>{
      const rect=host.getBoundingClientRect();
      pointerX=((e.clientX-rect.left)/rect.width-.5)*2;
      pointerY=((e.clientY-rect.top)/rect.height-.5)*2;
    };
    host.addEventListener("pointermove",onPointer,{passive:true});

    const resize=()=>{
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      renderer.setSize(w,h,false);
      camera.aspect=w/h; camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);ro.observe(host);resize();

    const clock=new THREE.Clock();
    let raf=0;
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      const m=modeRef.current;

      robot.position.y=-.22+Math.sin(t*1.5)*.035;
      halo.rotation.z=t*(m==="thinking"?.42:.08);
      headPivot.rotation.y+=(pointerX*.12-headPivot.rotation.y)*.035;
      headPivot.rotation.x+=(-pointerY*.055-headPivot.rotation.x)*.035;

      let targetLeft=.12,targetRight=-.12;
      if(m==="listening"){
        headPivot.rotation.z=Math.sin(t*2.8)*.035;
        targetLeft=.22;targetRight=-.22;
        cyan.emissiveIntensity=2.7+Math.sin(t*8)*.8;
      }else if(m==="thinking"){
        headPivot.rotation.y+=Math.sin(t*1.8)*.004;
        targetLeft=.05;targetRight=-.42;
        blue.emissiveIntensity=2.2+Math.sin(t*4)*.7;
      }else if(m==="speaking"){
        headPivot.rotation.z=Math.sin(t*3.6)*.025;
        targetRight=-.72+.14*Math.sin(t*3.1);
        targetLeft=.18+.08*Math.sin(t*2.4);
        cyan.emissiveIntensity=2.5+Math.sin(t*12)*.9;
      }else{
        headPivot.rotation.z=Math.sin(t*.8)*.015;
        cyan.emissiveIntensity=2.1+Math.sin(t*2.2)*.25;
      }

      leftArm.rotation.z+=(targetLeft-leftArm.rotation.z)*.08;
      rightArm.rotation.z+=(targetRight-rightArm.rotation.z)*.08;
      core.scale.setScalar(1+(m==="speaking"?.11:m==="listening"?.07:.035)*Math.abs(Math.sin(t*(m==="speaking"?10:4))));

      mouthBars.forEach((bar,i)=>{
        const amp=m==="speaking"
          ? .45+Math.abs(Math.sin(t*(8+i*.7)+i))*1.35
          : m==="listening"
            ? .6+Math.abs(Math.sin(t*3+i))*.25
            : .55;
        bar.scale.y+=(amp-bar.scale.y)*.28;
      });

      eyeL.scale.y=eyeR.scale.y=.62*(1-(Math.sin(t*.75)>0.995?.78:0));
      renderer.render(scene,camera);
    };
    animate();

    return()=>{
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove",onPointer);
      scene.traverse((o:any)=>{
        if(o.geometry)o.geometry.dispose?.();
        if(o.material){
          const mats=Array.isArray(o.material)?o.material:[o.material];
          mats.forEach((m:any)=>m.dispose?.());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  },[]);

  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PENSANDO":mode==="speaking"?"HABLANDO":"LISTO";
  return <div className={"free3dCard "+mode}>
    <div className="free3dHeader">
      <div>
        <span className="demoEyebrow">LOLO · ROBOT IA 3D</span>
        <h3>Tu profe IA sin suscripción de avatar</h3>
        <p className="muted">Este LOLO se renderiza dentro de tu app. No usa créditos de LiveAvatar.</p>
      </div>
      <span className={"free3dBadge "+mode}>● {label}</span>
    </div>
    <div className="free3dStage">
      <div ref={mountRef} className="free3dCanvas" aria-label="LOLO robot 3D interactivo"/>
      <div className="free3dCaption">{caption}</div>
    </div>
    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 escucha</span><b>→</b><span>🧠 piensa</span><b>→</b><span>🤖 LOLO se mueve y responde</span>
    </div>
    <div className="free3dNote">Sin LiveAvatar · sin límite de 2 minutos · sin créditos de avatar</div>
  </div>;
}
