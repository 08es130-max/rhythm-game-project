// Ver.0.8.52: production GLB bridge for the Shioriko interaction room.
// Loads the authored high-fidelity GLB when model.json says ready; otherwise uses the existing procedural fallback.
(function(){
'use strict';
const MANIFEST='assets/models/shioriko/model.json?v=0.8.52';
const FALLBACK='shioriko-3d-v0851.js?v=0.8.52-fallback1';
const THREE_URL='https://esm.sh/three@0.180.0';
const GLTF_URL='https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

function loadFallback(reason){
  const msg=document.getElementById('interactionMessage');
  if(msg) msg.textContent='高精細3Dモデルは制作中です。現在は既存の3Dプロトタイプを表示します。';
  if(reason) console.info('[Shioriko3D] production model unavailable:',reason);
  if(document.querySelector('script[data-shioriko-fallback]')) return;
  const s=document.createElement('script');
  s.src=FALLBACK;
  s.dataset.shiorikoFallback='1';
  document.head.appendChild(s);
}

async function boot(){
  const slot=document.getElementById('interactionModelSlot');
  const room=document.getElementById('interactionRoomScreen');
  const msg=document.getElementById('interactionMessage');
  if(!slot||!room||!msg){setTimeout(boot,80);return;}
  if(window.__shiorikoProduction3D?.booted) return;

  let manifest;
  try{
    const r=await fetch(MANIFEST,{cache:'no-store'});
    if(!r.ok) throw new Error('manifest '+r.status);
    manifest=await r.json();
  }catch(e){loadFallback(e);return;}

  if(manifest.status!=='ready' || !manifest.path){
    loadFallback('status='+manifest.status);
    return;
  }

  try{
    const [THREEmod,gltfMod]=await Promise.all([import(THREE_URL),import(GLTF_URL)]);
    const THREE=THREEmod;
    const {GLTFLoader}=gltfMod;

    slot.dataset.threeReady='production-loading';
    slot.innerHTML='';
    const canvas=document.createElement('canvas');
    canvas.id='interaction3dCanvas';
    canvas.setAttribute('aria-label','三船栞子 高精細3Dモデル');
    canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    slot.appendChild(canvas);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(32,1,.05,100);
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,manifest.maxDevicePixelRatio||1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=false;

    scene.add(new THREE.HemisphereLight(0xffffff,0x1b2735,2.2));
    const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(3.5,5.5,4.5);scene.add(key);
    const rim=new THREE.DirectionalLight(0x74d9d0,1.15);rim.position.set(-4,2,-3);scene.add(rim);

    const gltf=await new Promise((resolve,reject)=>{
      new GLTFLoader().load(manifest.path+'?v=0.8.52',resolve,undefined,reject);
    });
    const model=gltf.scene;
    scene.add(model);

    // Normalize model framing without mutating authored proportions.
    const box=new THREE.Box3().setFromObject(model);
    const size=new THREE.Vector3(),center=new THREE.Vector3();
    box.getSize(size);box.getCenter(center);
    const height=Math.max(.01,size.y);
    const targetHeight=manifest.targetHeightMeters||1.6;
    const scale=targetHeight/height;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const box2=new THREE.Box3().setFromObject(model);
    box2.getCenter(center);
    model.position.x-=center.x;
    model.position.z-=center.z;
    model.position.y-=box2.min.y;
    model.updateMatrixWorld(true);

    const finalBox=new THREE.Box3().setFromObject(model);
    finalBox.getSize(size);finalBox.getCenter(center);
    const orbitTarget=new THREE.Vector3(0,Math.max(.72,size.y*.52),0);
    const radius=Math.max(3.0,size.y*2.15);
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0;

    const mixer=gltf.animations?.length?new THREE.AnimationMixer(model):null;
    const clips=new Map((gltf.animations||[]).map(c=>[c.name,c]));
    let activeAction=null;
    function playClip(name,loop=true){
      if(!mixer||!clips.has(name)) return false;
      activeAction?.fadeOut(.15);
      const a=mixer.clipAction(clips.get(name));
      a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);a.clampWhenFinished=!loop;a.fadeIn(.15).play();
      activeAction=a;return true;
    }
    playClip('Idle',true);

    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
    const touchables=[];
    model.traverse(o=>{
      if(!o.isMesh)return;
      const n=(o.name||'').toLowerCase();
      if(n.includes('head')||n.includes('hand')||n.includes('body')||n.includes('face')) touchables.push(o);
    });

    function updateCamera(){
      const cp=Math.cos(pitch),sp=Math.sin(pitch),sy=Math.sin(yaw),cy=Math.cos(yaw);
      camera.position.set(
        orbitTarget.x+radius*sy*cp,
        orbitTarget.y+radius*sp,
        orbitTarget.z+radius*cy*cp
      );
      camera.up.set(-sy*sp,cp,-cy*sp).normalize();
      camera.lookAt(orbitTarget);
    }
    updateCamera();

    const ro=new ResizeObserver(()=>{
      const r=slot.getBoundingClientRect();
      if(!r.width||!r.height)return;
      renderer.setSize(r.width,r.height,false);
      camera.aspect=r.width/r.height;
      camera.updateProjectionMatrix();
    });
    ro.observe(slot);

    let down=false,moved=false,sx=0,sy=0,syaw=0,spitch=0;
    canvas.addEventListener('pointerdown',e=>{
      e.stopPropagation();down=true;moved=false;sx=e.clientX;sy=e.clientY;syaw=targetYaw;spitch=targetPitch;
      canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing';
    });
    canvas.addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.hypot(dx,dy)>5)moved=true;
      targetYaw=syaw-dx*.010;
      targetPitch=spitch+dy*.010;
    });
    canvas.addEventListener('pointerup',e=>{
      e.stopPropagation();down=false;canvas.style.cursor='grab';
      if(moved)return;
      const r=canvas.getBoundingClientRect();
      pointer.x=((e.clientX-r.left)/r.width)*2-1;
      pointer.y=-((e.clientY-r.top)/r.height)*2+1;
      ray.setFromCamera(pointer,camera);
      const hit=ray.intersectObjects(touchables.length?touchables:model.children,true)[0];
      const n=(hit?.object?.name||'').toLowerCase();
      if(n.includes('head')||n.includes('face')) msg.textContent='「……そんなに見つめられると、少し照れます。」';
      else if(n.includes('hand')){msg.textContent='「ごきげんよう。」';playClip('Wave',false);}
      else msg.textContent='栞子がこちらへ静かに視線を向けました。';
    });
    canvas.addEventListener('pointercancel',()=>{down=false;canvas.style.cursor='grab';});

    const actions=document.getElementById('interactionActions');
    if(actions&&!document.getElementById('interactionTopViewBtn')){
      [['interactionTopViewBtn','真上から見る',Math.PI/2],['interactionBottomViewBtn','真下から見る',-Math.PI/2],['interactionFrontViewBtn','正面に戻す',0]].forEach(([id,label,p])=>{
        const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;actions.appendChild(b);
        b.onclick=()=>{targetPitch=p;targetYaw=0;};
      });
    }
    const look=document.querySelector('#interactionRoomScreen [data-action="look"]');
    const wave=document.querySelector('#interactionRoomScreen [data-action="wave"]');
    const dance=document.querySelector('#interactionRoomScreen [data-action="dance"]');
    if(look){look.disabled=false;look.onclick=()=>{targetYaw=0;targetPitch=0;playClip('Look',false);};}
    if(wave){wave.disabled=false;wave.onclick=()=>playClip('Wave',false);}
    if(dance){dance.disabled=false;dance.textContent='ダンス';dance.onclick=()=>playClip('Dance_01',true);}

    const clock=new THREE.Clock();
    let lastFrame=0,raf=0;
    const targetFrame=1000/(manifest.targetFps||30);
    function visible(){return !room.hidden&&document.visibilityState==='visible';}
    function loop(now){
      raf=requestAnimationFrame(loop);
      if(!visible()) {clock.getDelta();return;}
      if(now-lastFrame<targetFrame)return;
      lastFrame=now;
      const dt=Math.min(.05,clock.getDelta());
      yaw+=(targetYaw-yaw)*Math.min(1,dt*9);
      pitch+=(targetPitch-pitch)*Math.min(1,dt*9);
      updateCamera();
      mixer?.update(dt);
      renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(loop);

    slot.dataset.threeReady='production';
    document.querySelector('.interaction-room-status').textContent='3D ROOM HQ';
    document.querySelector('.interaction-touch-hint')?.replaceChildren(document.createTextNode('高精細3D／ドラッグで360°周回／タップで反応'));
    msg.textContent='高精細3Dモデルを読み込みました。';

    window.__shiorikoProduction3D={
      booted:true,mode:'production',manifest,scene,model,camera,renderer,mixer,
      playClip,
      dispose(){
        cancelAnimationFrame(raf);ro.disconnect();
        model.traverse(o=>{
          if(o.geometry)o.geometry.dispose?.();
          const mats=Array.isArray(o.material)?o.material:[o.material];
          mats.filter(Boolean).forEach(m=>{Object.values(m).forEach(v=>v?.isTexture&&v.dispose?.());m.dispose?.();});
        });
        renderer.dispose();
      }
    };
  }catch(e){
    console.warn('[Shioriko3D] production load failed',e);
    slot.dataset.threeReady='';
    loadFallback(e);
  }
}
boot();
})();