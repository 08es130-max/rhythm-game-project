// Ver.0.8.47: lightweight interactive Shioriko-inspired 3D prototype with camera-orbit controls.
(function(){
  'use strict';
  const CDN='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

  function waitForRoom(){
    const slot=document.getElementById('interactionModelSlot');
    const message=document.getElementById('interactionMessage');
    if(!slot||!message){setTimeout(waitForRoom,80);return;}
    if(slot.dataset.threeReady==='1')return;
    slot.dataset.threeReady='loading';
    init(slot,message).catch(err=>{
      console.warn('3D room load failed',err);
      slot.dataset.threeReady='error';
      message.textContent='3D表示の読み込みに失敗しました。通信状態を確認して、最新版に更新してください。';
    });
  }

  async function init(slot,message){
    const THREE=await import(CDN);
    slot.dataset.threeReady='1';
    slot.innerHTML='';

    const canvas=document.createElement('canvas');
    canvas.id='interaction3dCanvas';
    canvas.setAttribute('aria-label','三船栞子 3Dモデル');
    canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    slot.appendChild(canvas);

    const scene=new THREE.Scene();
    scene.background=null;
    const camera=new THREE.PerspectiveCamera(30,1,.1,100);
    const orbitTarget=new THREE.Vector3(0,.35,0);
    const orbitRadius=5.7;

    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=false;

    scene.add(new THREE.HemisphereLight(0xffffff,0x253044,2.2));
    const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(3,5,4);scene.add(key);
    const rim=new THREE.DirectionalLight(0x9ee7d8,1.2);rim.position.set(-3,2,-3);scene.add(rim);

    const root=new THREE.Group();root.position.y=-1.25;scene.add(root);
    const touchables=[];
    const parts={};
    const mat=(color,rough=.72)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});
    const skin=mat(0xffd9c9,.85), hair=mat(0x174f42,.76), hairLite=mat(0x286d5d,.72);
    const navy=mat(0x28334a,.78), white=mat(0xf4f5f7,.82), green=mat(0x2f8b70,.72);
    const eye=mat(0x3c6f66,.55), blush=mat(0xf29aa7,.8), shoe=mat(0x25262c,.9);

    function mesh(geo,material,name,parent=root){const m=new THREE.Mesh(geo,material);m.name=name;parent.add(m);return m;}
    function tag(m,part){m.userData.touchPart=part;touchables.push(m);return m;}

    parts.torso=mesh(new THREE.CapsuleGeometry(.48,.85,5,12),navy,'torso');parts.torso.position.y=1.85;parts.torso.scale.set(1,.75,.62);
    const shirt=mesh(new THREE.BoxGeometry(.68,.26,.45),white,'shirt');shirt.position.set(0,2.21,.13);shirt.rotation.x=.07;
    const ribbon=mesh(new THREE.ConeGeometry(.13,.32,3),green,'ribbon');ribbon.position.set(0,2.13,.39);ribbon.rotation.z=Math.PI;
    const collarL=mesh(new THREE.BoxGeometry(.34,.08,.5),white,'collarL');collarL.position.set(-.18,2.33,.12);collarL.rotation.z=.35;
    const collarR=collarL.clone();collarR.name='collarR';collarR.position.x=.18;collarR.rotation.z=-.35;root.add(collarR);
    const skirt=mesh(new THREE.CylinderGeometry(.58,.78,.72,10,1,false),navy,'skirt');skirt.position.y=1.07;
    const skirtBand=mesh(new THREE.TorusGeometry(.59,.035,6,24),green,'skirtBand');skirtBand.position.y=1.39;skirtBand.rotation.x=Math.PI/2;
    const neck=mesh(new THREE.CylinderGeometry(.14,.16,.24,10),skin,'neck');neck.position.y=2.46;
    parts.head=tag(mesh(new THREE.SphereGeometry(.48,24,18),skin,'head'),'head');parts.head.position.set(0,2.92,0);parts.head.scale.set(.93,1.05,.86);

    const cap=mesh(new THREE.SphereGeometry(.52,20,14,0,Math.PI*2,0,Math.PI*.65),hair,'hairCap');cap.position.set(0,3.02,-.01);cap.scale.set(1.03,1.05,.94);
    const backHair=mesh(new THREE.CapsuleGeometry(.43,1.25,5,10),hair,'backHair');backHair.position.set(0,2.40,-.30);backHair.scale.set(.88,1,.55);
    const lockL=mesh(new THREE.CapsuleGeometry(.10,.92,4,8),hairLite,'hairLockL');lockL.position.set(-.42,2.56,.03);lockL.rotation.z=.08;
    const lockR=lockL.clone();lockR.name='hairLockR';lockR.position.x=.42;lockR.rotation.z=-.08;root.add(lockR);
    const bang1=mesh(new THREE.ConeGeometry(.13,.62,5),hairLite,'bang1');bang1.position.set(-.15,3.06,.38);bang1.rotation.x=-.18;bang1.rotation.z=.14;
    const bang2=mesh(new THREE.ConeGeometry(.12,.58,5),hair,'bang2');bang2.position.set(.08,3.09,.39);bang2.rotation.x=-.2;bang2.rotation.z=-.10;
    const bang3=mesh(new THREE.ConeGeometry(.10,.48,5),hairLite,'bang3');bang3.position.set(.28,3.04,.34);bang3.rotation.x=-.18;bang3.rotation.z=-.22;

    function eyeMesh(x){const e=mesh(new THREE.SphereGeometry(.064,12,8),eye,'eye');e.position.set(x,2.98,.414);e.scale.set(1,.75,.35);return e;}
    parts.eyeL=eyeMesh(-.16);parts.eyeR=eyeMesh(.16);
    const eyeHiL=mesh(new THREE.SphereGeometry(.018,8,6),white,'eyeHiL');eyeHiL.position.set(-.142,3.01,.465);
    const eyeHiR=eyeHiL.clone();eyeHiR.name='eyeHiR';eyeHiR.position.x=.178;root.add(eyeHiR);
    parts.mouth=mesh(new THREE.TorusGeometry(.07,.012,5,14,Math.PI),blush,'mouth');parts.mouth.position.set(0,2.78,.45);parts.mouth.rotation.z=Math.PI;

    function arm(side){
      const s=side==='L'?-1:1;
      const g=new THREE.Group();g.position.set(.60*s,2.05,0);root.add(g);
      const upper=mesh(new THREE.CapsuleGeometry(.11,.63,4,8),navy,'arm'+side,g);upper.position.y=-.26;upper.rotation.z=-.08*s;
      const hand=tag(mesh(new THREE.SphereGeometry(.13,12,9),skin,'hand'+side,g),'hand'+side);hand.position.set(.03*s,-.68,.02);
      return {group:g,upper,hand};
    }
    parts.armL=arm('L');parts.armR=arm('R');

    function leg(side){
      const s=side==='L'?-1:1;
      const l=mesh(new THREE.CapsuleGeometry(.13,.78,4,8),skin,'leg'+side);l.position.set(.23*s,.30,0);
      const sock=mesh(new THREE.CapsuleGeometry(.14,.52,4,8),white,'sock'+side);sock.position.set(.23*s,-.20,.01);
      const sh=mesh(new THREE.BoxGeometry(.32,.16,.48),shoe,'shoe'+side);sh.position.set(.23*s,-.62,.11);sh.rotation.x=-.10;
      return {l,sock,sh};
    }
    leg('L');leg('R');

    const floor=mesh(new THREE.CircleGeometry(1.18,40),new THREE.MeshBasicMaterial({color:0x95a4b8,transparent:true,opacity:.10}),'floor');floor.position.set(0,-.72,-.03);floor.rotation.x=-Math.PI/2;

    let yaw=0,pitch=0,targetYaw=0,targetPitch=0;
    let pointerDown=false,moved=false,startX=0,startY=0,startYaw=0,startPitch=0;
    let waveUntil=0,lookUntil=0,bounceUntil=0,blinkAt=performance.now()+1800+Math.random()*2200;
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();

    function updateCamera(){
      const cp=Math.cos(pitch),sp=Math.sin(pitch),sy=Math.sin(yaw),cy=Math.cos(yaw);
      camera.position.set(
        orbitTarget.x+orbitRadius*sy*cp,
        orbitTarget.y+orbitRadius*sp,
        orbitTarget.z+orbitRadius*cy*cp
      );
      camera.up.set(-sy*sp,cp,-cy*sp).normalize();
      camera.lookAt(orbitTarget);
    }
    updateCamera();

    function resize(){
      const r=slot.getBoundingClientRect();if(!r.width||!r.height)return;
      renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    }
    resize();new ResizeObserver(resize).observe(slot);

    function setPointer(e){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
    function react(part){
      const now=performance.now();bounceUntil=now+420;
      if(part==='head'){message.textContent='「……髪が気になりますか？」　栞子が少し照れたようにこちらを見ました。';lookUntil=now+1600;}
      else if(part==='handL'||part==='handR'){message.textContent='栞子が手を取り返すように、小さく手を振りました。';waveUntil=now+1500;}
      else message.textContent='栞子がこちらに気づいて、静かに視線を向けました。';
    }

    canvas.addEventListener('pointerdown',e=>{pointerDown=true;moved=false;startX=e.clientX;startY=e.clientY;startYaw=targetYaw;startPitch=targetPitch;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing';});
    canvas.addEventListener('pointermove',e=>{
      if(!pointerDown)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.hypot(dx,dy)>5)moved=true;
      targetYaw=startYaw-dx*.010;
      targetPitch=startPitch+dy*.010;
    });
    canvas.addEventListener('pointerup',e=>{pointerDown=false;canvas.style.cursor='grab';if(moved)return;setPointer(e);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(touchables,true)[0];react(hit?.object?.userData?.touchPart||'body');});
    canvas.addEventListener('pointercancel',()=>{pointerDown=false;canvas.style.cursor='grab';});

    const lookBtn=document.querySelector('#interactionRoomScreen [data-action="look"]');
    const waveBtn=document.querySelector('#interactionRoomScreen [data-action="wave"]');
    const danceBtn=document.querySelector('#interactionRoomScreen [data-action="dance"]');
    const actions=document.getElementById('interactionActions');
    if(actions&&!document.getElementById('interactionTopViewBtn')){
      const top=document.createElement('button');top.id='interactionTopViewBtn';top.type='button';top.textContent='真上から見る';
      const bottom=document.createElement('button');bottom.id='interactionBottomViewBtn';bottom.type='button';bottom.textContent='真下から見る';
      const reset=document.createElement('button');reset.id='interactionFrontViewBtn';reset.type='button';reset.textContent='正面に戻す';
      actions.append(top,bottom,reset);
      top.addEventListener('click',()=>{targetPitch=Math.PI/2;targetYaw=0;message.textContent='カメラを真上へ移動しました。キャラは立ったまま、頭上から見下ろします。';});
      bottom.addEventListener('click',()=>{targetPitch=-Math.PI/2;targetYaw=0;message.textContent='カメラを真下へ移動しました。キャラは立ったまま、足元から見上げます。';});
      reset.addEventListener('click',()=>{targetPitch=0;targetYaw=0;message.textContent='正面視点に戻しました。';});
    }
    if(lookBtn){lookBtn.disabled=false;lookBtn.addEventListener('click',()=>{lookUntil=performance.now()+2200;targetYaw=0;targetPitch=0;message.textContent='正面視点に戻しました。';});}
    if(waveBtn){waveBtn.disabled=false;waveBtn.addEventListener('click',()=>{waveUntil=performance.now()+2200;message.textContent='「ごきげんよう。」　栞子が控えめに手を振っています。';});}
    if(danceBtn){danceBtn.disabled=false;danceBtn.textContent='ミニダンス';danceBtn.addEventListener('click',()=>{window.__shiorikoDanceUntil=performance.now()+5200;message.textContent='簡易ダンスモーションを再生します。';});}

    message.textContent='3D栞子を読み込みました。キャラは固定したまま、カメラが周囲を360°移動します。';
    document.querySelector('.interaction-touch-hint')?.replaceChildren(document.createTextNode('ドラッグでカメラを360°周回／真上・真下にも対応'));

    let last=performance.now();
    function loop(now){
      const dt=Math.min(.04,(now-last)/1000);last=now;
      yaw+=(targetYaw-yaw)*Math.min(1,dt*9);
      pitch+=(targetPitch-pitch)*Math.min(1,dt*9);
      updateCamera();

      const idle=Math.sin(now*.0017)*.014;
      root.position.y=-1.25+idle+(now<bounceUntil?Math.sin((bounceUntil-now)/420*Math.PI)*.05:0);
      const dance=now<(window.__shiorikoDanceUntil||0);
      root.rotation.y=dance?Math.sin(now*.006)*.10:0;
      root.rotation.z=dance?Math.sin(now*.009)*.045:0;
      const waving=now<waveUntil||dance;
      parts.armR.group.rotation.z=waving?(-.9+Math.sin(now*.018)*.28):0;
      parts.armR.group.rotation.x=waving?-.18:0;
      const looking=now<lookUntil;
      parts.head.rotation.y=looking?Math.sin(now*.004)*.03:Math.sin(now*.0007)*.035;
      if(now>blinkAt){parts.eyeL.scale.y=.08;parts.eyeR.scale.y=.08;if(now>blinkAt+110){parts.eyeL.scale.y=.75;parts.eyeR.scale.y=.75;blinkAt=now+1800+Math.random()*2600;}}
      renderer.render(scene,camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  waitForRoom();
})();
