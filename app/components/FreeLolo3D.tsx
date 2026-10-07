"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";

type Mode="idle"|"listening"|"thinking"|"speaking";

export default function FreeLolo3D({mode,caption}:{mode:Mode;caption:string}){
  const mountRef=useRef<HTMLDivElement|null>(null);
  const modeRef=useRef<Mode>(mode);
  const [loadState,setLoadState]=useState<"loading"|"ready"|"error">("loading");
  modeRef.current=mode;

  useEffect(()=>{
    const host=mountRef.current;
    if(!host)return;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(28,1,.1,100);
    camera.position.set(0,1.35,3.25);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    renderer.shadowMap.enabled=false;
    host.appendChild(renderer.domElement);

    const hemi=new THREE.HemisphereLight(0xe6f4ff,0x071019,2.3);
    scene.add(hemi);
    const key=new THREE.DirectionalLight(0xffffff,3.2);
    key.position.set(2.5,4,3.5);scene.add(key);
    const rim=new THREE.PointLight(0x28c8ff,10,8);
    rim.position.set(-2,1.8,2.2);scene.add(rim);
    const fill=new THREE.PointLight(0x526dff,5,8);
    fill.position.set(2.4,.8,1.5);scene.add(fill);

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(1.8,64),
      new THREE.MeshBasicMaterial({color:0x0e8bb8,transparent:true,opacity:.09,side:THREE.DoubleSide})
    );
    floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);

    const backGlow=new THREE.Mesh(
      new THREE.PlaneGeometry(4.2,4.2),
      new THREE.MeshBasicMaterial({color:0x08385b,transparent:true,opacity:.18})
    );
    backGlow.position.set(0,1.35,-1.4);scene.add(backGlow);

    let currentVrm:VRM|null=null;
    let raf=0;
    let disposed=false;
    const clock=new THREE.Clock();
    let pointerX=0,pointerY=0;

    const onPointer=(e:PointerEvent)=>{
      const r=host.getBoundingClientRect();
      pointerX=((e.clientX-r.left)/Math.max(1,r.width)-.5)*2;
      pointerY=((e.clientY-r.top)/Math.max(1,r.height)-.5)*2;
    };
    host.addEventListener("pointermove",onPointer,{passive:true});

    const resize=()=>{
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);
    ro.observe(host);resize();

    const loader=new GLTFLoader();
    loader.register(parser=>new VRMLoaderPlugin(parser));
    loader.load(
      "/api/lolo-avatar",
      gltf=>{
        if(disposed)return;
        const vrm=gltf.userData.vrm as VRM|undefined;
        if(!vrm){setLoadState("error");return}

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        VRMUtils.rotateVRM0(vrm);

        vrm.scene.traverse(obj=>{obj.frustumCulled=false});
        vrm.scene.position.set(0,0,0);
        vrm.scene.scale.setScalar(1.05);
        scene.add(vrm.scene);
        currentVrm=vrm;

        // Pose inicial amigable
        const leftArm=vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const rightArm=vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
        if(leftArm)leftArm.rotation.z=.42;
        if(rightArm)rightArm.rotation.z=-.42;

        setLoadState("ready");
      },
      undefined,
      ()=>{if(!disposed)setLoadState("error")}
    );

    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const dt=Math.min(.05,clock.getDelta());
      const t=clock.elapsedTime;
      const m=modeRef.current;

      if(currentVrm){
        const head=currentVrm.humanoid.getNormalizedBoneNode("head");
        const neck=currentVrm.humanoid.getNormalizedBoneNode("neck");
        const chest=currentVrm.humanoid.getNormalizedBoneNode("chest");
        const lArm=currentVrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const rArm=currentVrm.humanoid.getNormalizedBoneNode("rightUpperArm");

        // Respiración y postura
        if(chest){
          chest.rotation.x=Math.sin(t*1.4)*.012;
          chest.rotation.z=Math.sin(t*.7)*.008;
        }

        // Cabeza y mirada por estado
        let yaw=pointerX*.08;
        let pitch=-pointerY*.035;
        let roll=Math.sin(t*.65)*.012;
        if(m==="listening"){roll=-.05+Math.sin(t*2.1)*.012;yaw+=.035}
        if(m==="thinking"){yaw=.13+Math.sin(t*1.15)*.018;pitch=-.06}
        if(m==="speaking"){yaw+=Math.sin(t*2.8)*.025;roll=Math.sin(t*2.5)*.02}
        if(head){
          head.rotation.y+=(yaw-head.rotation.y)*.09;
          head.rotation.x+=(pitch-head.rotation.x)*.09;
          head.rotation.z+=(roll-head.rotation.z)*.09;
        }
        if(neck)neck.rotation.y=Math.sin(t*.45)*.012;

        // Brazos: más expresivos al hablar
        if(lArm){
          const z=m==="speaking"?.54:m==="listening"?.48:.42;
          lArm.rotation.z+=(z-lArm.rotation.z)*.07;
          lArm.rotation.x=m==="speaking"?Math.sin(t*2.2)*.06:0;
        }
        if(rArm){
          const z=m==="speaking"?-.62:m==="thinking"?-.35:-.42;
          rArm.rotation.z+=(z-rArm.rotation.z)*.07;
          rArm.rotation.x=m==="speaking"?Math.sin(t*2.6+.8)*.08:0;
        }

        // Parpadeo natural
        const blink=(Math.sin(t*.78)>0.996 || Math.sin(t*.43+1.7)>0.998)?1:0;
        currentVrm.expressionManager?.setValue("blink",blink);

        // Lip-sync simple usando fonemas VRM
        const talking=m==="speaking";
        const a=talking?Math.max(0,Math.sin(t*10))*0.75:0;
        const i=talking?Math.max(0,Math.sin(t*13+1.4))*0.34:0;
        const u=talking?Math.max(0,Math.sin(t*8.5+2.2))*0.22:0;
        currentVrm.expressionManager?.setValue("aa",a);
        currentVrm.expressionManager?.setValue("ih",i);
        currentVrm.expressionManager?.setValue("ou",u);

        currentVrm.expressionManager?.update();
        currentVrm.update(dt);
      }

      renderer.render(scene,camera);
    };
    animate();

    return()=>{
      disposed=true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove",onPointer);
      if(currentVrm){
        scene.remove(currentVrm.scene);
        VRMUtils.deepDispose(currentVrm.scene);
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  },[]);

  const label=mode==="listening"?"ESCUCHANDO":mode==="thinking"?"PENSANDO":mode==="speaking"?"HABLANDO":"LISTO";

  return <div className={"humanLoloCard "+mode}>
    <div className="humanLoloTop">
      <div>
        <span className="demoEyebrow">LOLO · AVATAR VRM 3D REAL</span>
        <h3>Tu profe 3D de reparación</h3>
        <p className="muted">Modelo humano con huesos, parpadeo y movimiento de boca · sin suscripción de avatar.</p>
      </div>
      <span className={"humanLoloBadge "+mode}>● {loadState==="loading"?"CARGANDO":loadState==="error"?"ERROR":label}</span>
    </div>

    <div className={"humanLoloStage threeD "+mode}>
      <div ref={mountRef} className="loloHuman3DCanvas" aria-label="LOLO avatar VRM 3D"/>
      {loadState==="loading"&&<div className="vrmLoading">Cargando avatar 3D…</div>}
      {loadState==="error"&&<div className="vrmError">No pude cargar el modelo 3D. Volvé a abrir LOLO.</div>}
      <div className="humanLoloCaption">{caption}</div>
    </div>

    <div className="avatarFlow">
      <span>🎤 hablás</span><b>→</b><span>👂 escucha</span><b>→</b><span>🧠 piensa</span><b>→</b><span>🗣️ mueve boca y cabeza</span>
    </div>
    <div className="free3dNote">Modelo VRM CC0 · sin LiveAvatar · sin pago mensual de avatar</div>
  </div>;
}
