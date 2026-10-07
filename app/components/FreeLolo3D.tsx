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
    const camera=new THREE.PerspectiveCamera(26,1,.1,100);
    camera.position.set(0,1.38,2.35);
    camera.lookAt(0,1.32,0);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
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

    // Escena técnica: mesa, notebook y celular.
    const deskMat=new THREE.MeshStandardMaterial({color:0x101923,roughness:.72,metalness:.12});
    const desk=new THREE.Mesh(new THREE.BoxGeometry(3.7,.12,1.35),deskMat);
    desk.position.set(0,.56,.72);
    scene.add(desk);

    const mat=new THREE.Mesh(new THREE.BoxGeometry(1.25,.025,.72),new THREE.MeshStandardMaterial({color:0x0d5683,roughness:.6}));
    mat.position.set(.42,.635,.73);
    scene.add(mat);

    const phone=new THREE.Mesh(new THREE.BoxGeometry(.58,.035,.28),new THREE.MeshStandardMaterial({color:0x10151b,metalness:.55,roughness:.32}));
    phone.position.set(.42,.67,.74);
    phone.rotation.y=-.08;
    scene.add(phone);

    const phoneBoard=new THREE.Mesh(new THREE.BoxGeometry(.38,.018,.16),new THREE.MeshStandardMaterial({color:0x1e5d45,metalness:.22,roughness:.5}));
    phoneBoard.position.set(.42,.692,.74);
    phoneBoard.rotation.y=-.08;
    scene.add(phoneBoard);

    const laptopBase=new THREE.Mesh(new THREE.BoxGeometry(.95,.055,.68),new THREE.MeshStandardMaterial({color:0x26313f,metalness:.45,roughness:.3}));
    laptopBase.position.set(-.72,.68,.7);
    laptopBase.rotation.y=.08;
    scene.add(laptopBase);

    const laptopScreen=new THREE.Mesh(new THREE.BoxGeometry(.95,.65,.055),new THREE.MeshStandardMaterial({color:0x111923,metalness:.4,roughness:.3}));
    laptopScreen.position.set(-.72,1.0,.45);
    laptopScreen.rotation.x=-.13;
    laptopScreen.rotation.y=.08;
    scene.add(laptopScreen);

    const screenGlow=new THREE.Mesh(new THREE.PlaneGeometry(.82,.5),new THREE.MeshBasicMaterial({color:0x0b4268,transparent:true,opacity:.72}));
    screenGlow.position.set(-.716,1.0,.416);
    screenGlow.rotation.x=-.13;
    screenGlow.rotation.y=.08;
    scene.add(screenGlow);

    const toolMat=new THREE.MeshStandardMaterial({color:0x3d91c4,metalness:.4,roughness:.32});
    for(let i=0;i<4;i++){
      const tool=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.45,10),toolMat);
      tool.rotation.z=Math.PI/2;
      tool.position.set(.85+i*.12,.69,1.0);
      scene.add(tool);
    }

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

        // Evitamos optimizaciones pesadas en tiempo de carga; en celulares lentos
        // pueden demorar varios segundos y no son necesarias para mostrar LOLO.
        VRMUtils.rotateVRM0(vrm);

        vrm.scene.traverse(obj=>{obj.frustumCulled=false});
        vrm.scene.position.set(0,-.46,0);
        vrm.scene.scale.setScalar(1.22);
        scene.add(vrm.scene);
        currentVrm=vrm;

        // Pose natural de técnico: brazos bajos y algo flexionados hacia la mesa.
        const leftArm=vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const rightArm=vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
        const leftLower=vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
        const rightLower=vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
        if(leftArm){leftArm.rotation.z=1.18;leftArm.rotation.x=.12}
        if(rightArm){rightArm.rotation.z=-1.18;rightArm.rotation.x=.12}
        if(leftLower){leftLower.rotation.y=-.28;leftLower.rotation.z=-.18}
        if(rightLower){rightLower.rotation.y=.28;rightLower.rotation.z=.18}

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
        const lLower=currentVrm.humanoid.getNormalizedBoneNode("leftLowerArm");
        const rLower=currentVrm.humanoid.getNormalizedBoneNode("rightLowerArm");

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

        // Brazos siempre bajos. Al hablar hace gestos pequeños, nunca vuelve a pose T.
        if(lArm){
          const z=m==="speaking"?1.08:m==="listening"?1.14:1.18;
          const x=.12+(m==="speaking"?Math.sin(t*2.2)*.035:0);
          lArm.rotation.z+=(z-lArm.rotation.z)*.09;
          lArm.rotation.x+=(x-lArm.rotation.x)*.09;
        }
        if(rArm){
          const z=m==="speaking"?-1.03:m==="thinking"?-1.12:-1.18;
          const x=.12+(m==="speaking"?Math.sin(t*2.6+.8)*.045:0);
          rArm.rotation.z+=(z-rArm.rotation.z)*.09;
          rArm.rotation.x+=(x-rArm.rotation.x)*.09;
        }
        if(lLower){
          const y=m==="speaking"?-.38:-.28;
          lLower.rotation.y+=(y-lLower.rotation.y)*.08;
          lLower.rotation.z+=(-.18-lLower.rotation.z)*.08;
        }
        if(rLower){
          const y=m==="speaking"?.42:.28;
          rLower.rotation.y+=(y-rLower.rotation.y)*.08;
          rLower.rotation.z+=(.18-rLower.rotation.z)*.08;
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
        <span className="demoEyebrow">LOLO · PROFE IA</span>
        <h3>Tu profe de reparación</h3>
        <p className="muted">Hablale a LOLO y te acompaña paso a paso en el diagnóstico y la reparación.</p>
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

  </div>;
}
