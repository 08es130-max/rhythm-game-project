// Ver.0.8.50: detailed Shioriko-inspired stage model. Elegant SIF-style live costume, layered hair, expressions, camera orbit.
(function(){
'use strict';
const CDN='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
function wait(){const slot=document.getElementById('interactionModelSlot'),msg=document.getElementById('interactionMessage');if(!slot||!msg){setTimeout(wait,80);return;}if(slot.dataset.threeReady==='1')return;slot.dataset.threeReady='loading';init(slot,msg).catch(e=>{console.warn(e);slot.dataset.threeReady='error';msg.textContent='3D表示の読み込みに失敗しました。最新版に更新してください。';});}
async function init(slot,msg){
const T=await import(CDN);slot.dataset.threeReady='1';slot.innerHTML='';
const canvas=document.createElement('canvas');canvas.id='interaction3dCanvas';canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';slot.appendChild(canvas);
const scene=new T.Scene();const camera=new T.PerspectiveCamera(34,1,.1,100);const target=new T.Vector3(0,.18,0);const radius=8.5;
const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
scene.add(new T.HemisphereLight(0xffffff,0x26333a,2.35));const key=new T.DirectionalLight(0xffffff,2.7);key.position.set(3.8,5.2,4.5);scene.add(key);const rim=new T.DirectionalLight(0x90e8d0,1.25);rim.position.set(-3,2,-4);scene.add(rim);
const root=new T.Group();root.position.y=-1.24;scene.add(root);const parts={},touch=[];
const M=(c,r=.7,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const skin=M(0xffd9c8,.88),skin2=M(0xf7c8b6,.9),hair=M(0x143f39,.72),hair2=M(0x245b50,.68),white=M(0xfaf9f3,.78),navy=M(0x17233f,.66),navy2=M(0x26385d,.66),gold=M(0xc9a95f,.42,.2),mint=M(0x63b7a1,.58),black=M(0x121722,.75),rose=M(0xba6076,.7),eye=M(0x7a2e34,.45),eyeDark=M(0x3c161a,.5);
function mesh(g,m,n,p=root){const x=new T.Mesh(g,m);x.name=n;p.add(x);return x;}function tag(x,p){x.userData.touchPart=p;touch.push(x);return x;}
// body proportions
parts.body=mesh(new T.CapsuleGeometry(.37,.83,6,16),white,'body');parts.body.position.y=1.84;parts.body.scale.set(1,.93,.66);
const waist=mesh(new T.CylinderGeometry(.34,.38,.22,16),navy,'waist');waist.position.y=1.34;
const belt=mesh(new T.TorusGeometry(.39,.035,8,32),gold,'belt');belt.position.y=1.43;belt.rotation.x=Math.PI/2;
// layered skirt: white outer, navy asymmetrical panel, gold trim
const skirt1=mesh(new T.CylinderGeometry(.46,.92,.64,24,1,true),white,'skirt1');skirt1.position.y=.98;
const skirt2=mesh(new T.CylinderGeometry(.40,.78,.50,20,1,true),navy,'skirt2');skirt2.position.set(.08,1.03,.04);skirt2.rotation.z=-.08;skirt2.scale.x=.80;
const hem=mesh(new T.TorusGeometry(.88,.038,8,40),gold,'hem');hem.position.y=.67;hem.rotation.x=Math.PI/2;
for(let i=0;i<10;i++){const r=mesh(new T.SphereGeometry(.055,8,6),white,'ruffle'+i);const a=(i/10)*Math.PI*2;r.position.set(Math.cos(a)*.86,.63,Math.sin(a)*.86);r.scale.set(1.3,.55,.55);}
// chest / collar / sash
const chest=mesh(new T.BoxGeometry(.66,.24,.42),white,'chest');chest.position.set(0,2.12,.14);chest.rotation.x=.08;
const collarL=mesh(new T.BoxGeometry(.34,.075,.48),navy,'collarL');collarL.position.set(-.17,2.28,.16);collarL.rotation.z=.36;const collarR=collarL.clone();collarR.position.x=.17;collarR.rotation.z=-.36;root.add(collarR);
const trimL=mesh(new T.BoxGeometry(.30,.028,.50),gold,'trimL');trimL.position.set(-.16,2.32,.18);trimL.rotation.z=.36;const trimR=trimL.clone();trimR.position.x=.16;trimR.rotation.z=-.36;root.add(trimR);
const bow=mesh(new T.TorusKnotGeometry(.09,.025,48,8,2,3),mint,'chestGem');bow.position.set(0,2.08,.39);bow.scale.set(1,.75,.45);
const sash=mesh(new T.BoxGeometry(.86,.16,.11),navy2,'sash');sash.position.set(.15,1.58,.36);sash.rotation.z=-.18;
const tassel=mesh(new T.CylinderGeometry(.025,.035,.42,8),gold,'tassel');tassel.position.set(.43,1.43,.39);tassel.rotation.z=-.22;
// neck + refined face
mesh(new T.CylinderGeometry(.12,.14,.23,12),skin,'neck').position.y=2.43;
const headGroup=new T.Group();headGroup.position.set(0,2.91,0);root.add(headGroup);parts.headGroup=headGroup;
parts.head=tag(mesh(new T.SphereGeometry(.47,32,24),skin,'head',headGroup),'head');parts.head.scale.set(.94,1.07,.84);parts.head.position.y=-.01;
// chin / jaw illusion
const chin=mesh(new T.SphereGeometry(.31,24,16),skin2,'chin',headGroup);chin.position.set(0,-.25,.035);chin.scale.set(1,.62,.80);
// ears
for(const s of [-1,1]){const e=mesh(new T.SphereGeometry(.085,12,8),skin,'ear',headGroup);e.position.set(.44*s,-.02,-.005);e.scale.set(.55,1,.42);}
// eyes: layered sclera/iris/pupil/highlight + lashes
function makeEye(x){const g=new T.Group();g.position.set(x,.03,.405);headGroup.add(g);const scl=mesh(new T.SphereGeometry(.095,16,10),white,'sclera',g);scl.scale.set(1.15,.58,.26);const ir=mesh(new T.SphereGeometry(.061,14,10),eye,'iris',g);ir.position.z=.052;ir.scale.set(.9,1,.25);const pu=mesh(new T.SphereGeometry(.030,12,8),eyeDark,'pupil',g);pu.position.z=.078;pu.scale.z=.20;const hi=mesh(new T.SphereGeometry(.017,8,6),white,'highlight',g);hi.position.set(-.018,.022,.096);const lash=mesh(new T.BoxGeometry(.20,.018,.018),eyeDark,'lash',g);lash.position.set(0,.055,.075);lash.rotation.z=x<0?.07:-.07;return g;}
parts.eyeL=makeEye(-.155);parts.eyeR=makeEye(.155);
for(const s of [-1,1]){const b=mesh(new T.BoxGeometry(.17,.018,.02),hair2,'brow',headGroup);b.position.set(.155*s,.17,.40);b.rotation.z=s<0?.07:-.07;}
parts.mouth=mesh(new T.TorusGeometry(.067,.010,6,20,Math.PI),rose,'mouth',headGroup);parts.mouth.position.set(0,-.18,.438);parts.mouth.rotation.z=Math.PI;
parts.blushL=mesh(new T.SphereGeometry(.055,10,6),new T.MeshStandardMaterial({color:0xf09aaa,transparent:true,opacity:0}),'blushL',headGroup);parts.blushL.position.set(-.24,-.11,.40);parts.blushL.scale.set(1.5,.45,.18);parts.blushR=parts.blushL.clone();parts.blushR.position.x=.24;headGroup.add(parts.blushR);
// layered hair
const cap=mesh(new T.SphereGeometry(.52,28,20,0,Math.PI*2,0,Math.PI*.70),hair,'hairCap',headGroup);cap.position.y=.09;cap.scale.set(1.03,1.05,.95);
const back=new T.Group();back.position.set(0,2.46,-.28);root.add(back);parts.backHair=back;
for(let i=-3;i<=3;i++){const strand=mesh(new T.CapsuleGeometry(.085,.92+Math.abs(i)*.05,5,10),i%2?hair2:hair,'backStrand'+i,back);strand.position.set(i*.115,-.02-Math.abs(i)*.02,0);strand.rotation.z=i*.022;strand.scale.z=.65;}
function bang(x,y,z,rz,len,w,mat){const b=mesh(new T.ConeGeometry(w,len,7),mat,'bang',headGroup);b.position.set(x,y,z);b.rotation.x=-.20;b.rotation.z=rz;return b;}
bang(-.25,.05,.40,.30,.63,.11,hair2);bang(-.08,.10,.43,.12,.69,.12,hair);bang(.10,.10,.43,-.08,.67,.12,hair2);bang(.27,.04,.38,-.27,.58,.10,hair);
for(const s of [-1,1]){const lock=mesh(new T.CapsuleGeometry(.075,.72,5,9),hair2,'sideLock',headGroup);lock.position.set(.43*s,-.38,.08);lock.rotation.z=.08*s;}
// elegant hair ornament: navy/gold/mint
const ornament=new T.Group();ornament.position.set(-.40,3.29,.12);root.add(ornament);const flower=mesh(new T.TorusGeometry(.14,.035,6,18),gold,'flower',ornament);flower.rotation.x=Math.PI/2;const jewel=mesh(new T.SphereGeometry(.065,12,8),mint,'jewel',ornament);jewel.position.z=.03;const feather=mesh(new T.ConeGeometry(.055,.42,6),white,'feather',ornament);feather.position.set(-.12,.19,0);feather.rotation.z=.55;
// arms: puff sleeve + long white sleeve + gold cuff + hands
function arm(side){const s=side==='L'?-1:1,g=new T.Group();g.position.set(.54*s,2.06,0);root.add(g);const puff=mesh(new T.SphereGeometry(.20,14,10),white,'puff'+side,g);puff.scale.set(1.0,.75,.85);const upper=mesh(new T.CapsuleGeometry(.095,.48,5,9),white,'upper'+side,g);upper.position.y=-.27;upper.rotation.z=-.07*s;const cuff=mesh(new T.TorusGeometry(.105,.022,6,18),gold,'cuff'+side,g);cuff.position.set(.025*s,-.56,.01);cuff.rotation.x=Math.PI/2;const hand=tag(mesh(new T.SphereGeometry(.115,14,10),skin,'hand'+side,g),'hand'+side);hand.position.set(.03*s,-.68,.02);return {group:g,hand};}
parts.armL=arm('L');parts.armR=arm('R');
// legs + boots
function leg(side){const s=side==='L'?-1:1;const thigh=mesh(new T.CapsuleGeometry(.12,.53,5,10),skin,'thigh'+side);thigh.position.set(.20*s,.33,0);const sock=mesh(new T.CapsuleGeometry(.125,.50,5,10),white,'sock'+side);sock.position.set(.20*s,-.18,0);const band=mesh(new T.TorusGeometry(.128,.018,6,18),gold,'sockBand'+side);band.position.set(.20*s,.07,0);band.rotation.x=Math.PI/2;const shoe=mesh(new T.BoxGeometry(.29,.15,.44),black,'shoe'+side);shoe.position.set(.20*s,-.60,.10);shoe.rotation.x=-.10;return {thigh,sock,shoe};}leg('L');leg('R');
const floor=mesh(new T.CircleGeometry(1.22,40),new T.MeshBasicMaterial({color:0x93a8ac,transparent:true,opacity:.09}),'floor');floor.position.set(0,-.72,-.03);floor.rotation.x=-Math.PI/2;
let yaw=0,pitch=0,ty=0,tp=0,down=false,moved=false,sx=0,sy=0,syaw=0,spitch=0,waveUntil=0,lookUntil=0,bounceUntil=0,blinkAt=performance.now()+1800+Math.random()*2200,expression='normal';const ray=new T.Raycaster(),pointer=new T.Vector2();
function cam(){const cp=Math.cos(pitch),sp=Math.sin(pitch),a=Math.sin(yaw),b=Math.cos(yaw);camera.position.set(target.x+radius*a*cp,target.y+radius*sp,target.z+radius*b*cp);camera.up.set(-a*sp,cp,-b*sp).normalize();camera.lookAt(target);}cam();
function resize(){const r=slot.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}resize();new ResizeObserver(resize).observe(slot);
function setP(e){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
function setExpression(name){expression=name;const shy=name==='shy',smile=name==='smile';parts.blushL.material.opacity=shy?.45:0;parts.blushR.material.opacity=shy?.45:0;parts.mouth.scale.x=smile?1.2:1;parts.mouth.position.y=smile?-.16:-.18;}
function react(part){const n=performance.now();bounceUntil=n+380;if(part==='head'){setExpression('shy');lookUntil=n+1800;msg.textContent='「……そんなに見つめられると、少し困ってしまいます。」';setTimeout(()=>setExpression('normal'),1900);}else if(part&&part.startsWith('hand')){setExpression('smile');waveUntil=n+1600;msg.textContent='「ふふ。ごきげんよう。」';setTimeout(()=>setExpression('normal'),1700);}else{lookUntil=n+1000;msg.textContent='栞子が静かにこちらへ視線を向けました。';}}
canvas.addEventListener('pointerdown',e=>{down=true;moved=false;sx=e.clientX;sy=e.clientY;syaw=ty;spitch=tp;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing';});canvas.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>5)moved=true;ty=syaw-dx*.010;tp=spitch+dy*.010;});canvas.addEventListener('pointerup',e=>{down=false;canvas.style.cursor='grab';if(moved)return;setP(e);ray.setFromCamera(pointer,camera);const h=ray.intersectObjects(touch,true)[0];react(h?.object?.userData?.touchPart||'body');});canvas.addEventListener('pointercancel',()=>{down=false;canvas.style.cursor='grab';});
const lookBtn=document.querySelector('#interactionRoomScreen [data-action="look"]'),waveBtn=document.querySelector('#interactionRoomScreen [data-action="wave"]'),danceBtn=document.querySelector('#interactionRoomScreen [data-action="dance"]'),actions=document.getElementById('interactionActions');
if(actions&&!document.getElementById('interactionTopViewBtn')){for(const [id,label,p] of [['interactionTopViewBtn','真上から見る',Math.PI/2],['interactionBottomViewBtn','真下から見る',-Math.PI/2],['interactionFrontViewBtn','正面に戻す',0]]){const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;actions.appendChild(b);b.addEventListener('click',()=>{tp=p;ty=0;msg.textContent=label+'に切り替えました。';});}}
if(lookBtn){lookBtn.disabled=false;lookBtn.onclick=()=>{ty=0;tp=0;lookUntil=performance.now()+1800;msg.textContent='栞子が正面へ向き直りました。';};}if(waveBtn){waveBtn.disabled=false;waveBtn.onclick=()=>{waveUntil=performance.now()+2000;setExpression('smile');msg.textContent='「ごきげんよう。」';setTimeout(()=>setExpression('normal'),2100);};}if(danceBtn){danceBtn.disabled=false;danceBtn.textContent='ミニダンス';danceBtn.onclick=()=>{window.__shiorikoDanceUntil=performance.now()+5200;msg.textContent='ライブ衣装で簡易ダンスを再生します。';};}
msg.textContent='詳細版3D栞子を読み込みました。白・濃紺・金を基調にした上品なライブ衣装です。';document.querySelector('.interaction-room-status')?.replaceChildren(document.createTextNode('3D ROOM β'));
let last=performance.now();function loop(now){const dt=Math.min(.04,(now-last)/1000);last=now;yaw+=(ty-yaw)*Math.min(1,dt*9);pitch+=(tp-pitch)*Math.min(1,dt*9);cam();const idle=Math.sin(now*.0016)*.012;root.position.y=-1.24+idle+(now<bounceUntil?Math.sin((bounceUntil-now)/380*Math.PI)*.04:0);const dance=now<(window.__shiorikoDanceUntil||0);root.rotation.y=dance?Math.sin(now*.006)*.11:0;root.rotation.z=dance?Math.sin(now*.009)*.035:0;parts.armR.group.rotation.z=(now<waveUntil||dance)?(-.92+Math.sin(now*.018)*.24):0;parts.armR.group.rotation.x=(now<waveUntil||dance)?-.16:0;parts.headGroup.rotation.y=now<lookUntil?Math.sin(now*.003)*.02:Math.sin(now*.0008)*.025;parts.backHair.rotation.z=Math.sin(now*.0014)*.018;parts.backHair.rotation.x=Math.sin(now*.0011)*.012;if(now>blinkAt){parts.eyeL.scale.y=.08;parts.eyeR.scale.y=.08;if(now>blinkAt+115){parts.eyeL.scale.y=1;parts.eyeR.scale.y=1;blinkAt=now+1900+Math.random()*2600;}}renderer.render(scene,camera);requestAnimationFrame(loop);}requestAnimationFrame(loop);
}
wait();
})();