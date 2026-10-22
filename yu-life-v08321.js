// v0.8.321 - Yu reward: non-destructive subtle motion and rare spotlight.
(()=>{'use strict';
const home=document.getElementById('homeScreen');
if(!home)return;
const key='rhythmGame.shiorikoHomeArt.v1';
const ids=['lr-shioriko-eternal-rose','lr-ayumu-flower-garden','lr-kasumi-flower-garden','lr-shizuku-blue-garden','lr-karin-blue-garden','lr-kanata-lavender-garden','lr-setsuna-rose-garden','lr-ai-sunflower-garden','lr-emma-flower-garden','lr-mia-silver-garden','lr-rina-pink-garden','lr-lanzhu-rose-palace'];
const eligible=()=>{try{const owned=typeof window.loadGachaOwned==='function'?window.loadGachaOwned():new Set(JSON.parse(localStorage.getItem('rhythmGame.unlockedCharacters.v1')||'[]'));return localStorage.getItem(key)==='yu'&&ids.every(id=>owned.has(id));}catch(_){return false;}};
const style=document.createElement('style');
style.textContent=`
#homeScreen .yu-life-layer{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
#homeScreen .yu-life-layer[hidden]{display:none!important}
#homeScreen .yu-life-canvas{position:absolute;inset:0;width:100%;height:100%}
#homeScreen .yu-life-dim{position:absolute;inset:0;background:rgba(5,7,25,.82);opacity:0;transition:opacity .42s ease}
#homeScreen .yu-life-spot{position:absolute;left:8%;top:-18%;width:46%;height:110%;background:radial-gradient(ellipse at 50% 42%,rgba(255,255,255,.26) 0%,rgba(255,245,209,.17) 22%,rgba(150,200,255,.08) 44%,transparent 72%);opacity:0;transition:opacity .6s ease}
#homeScreen .yu-life-layer.is-show .yu-life-dim,#homeScreen .yu-life-layer.is-show .yu-life-spot{opacity:1}
#homeScreen .yu-life-layer.is-show .yu-life-spot{animation:yu-spot-sway 2.8s ease-in-out infinite}
@keyframes yu-spot-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@media(prefers-reduced-motion:reduce){#homeScreen .yu-life-canvas{display:none!important}#homeScreen .yu-life-layer.is-show .yu-life-spot{animation:none}}
`;
document.head.appendChild(style);
const layer=document.createElement('div');layer.className='yu-life-layer';layer.hidden=true;
const canvas=document.createElement('canvas');canvas.className='yu-life-canvas';layer.appendChild(canvas);
const dim=document.createElement('div');dim.className='yu-life-dim';layer.appendChild(dim);
const spot=document.createElement('div');spot.className='yu-life-spot';layer.appendChild(spot);
home.appendChild(layer);
const ctx=canvas.getContext('2d',{alpha:true});
let active=false,raf=0,taps=0,playing=false,lastRare=0,scene=null,seq=0;
const patches=[
  {x:.243,y:.142,w:.066,h:.115,amp:2.1,period:3100}, // left ponytail
  {x:.355,y:.139,w:.060,h:.135,amp:2.4,period:3450}, // right ponytail
  {x:.250,y:.365,w:.135,h:.160,amp:1.7,period:4100}, // left feathered skirt
  {x:.355,y:.370,w:.095,h:.160,amp:1.9,period:3800}, // right feathered skirt
  {x:.290,y:.255,w:.075,h:.088,amp:.65,period:3700} // subtle breathing at bodice
];
function render(t){
 if(!active||!scene||!scene.complete||!scene.naturalWidth||!ctx){raf=0;return;}
 const rect=home.getBoundingClientRect(),im=scene.getBoundingClientRect();
 if(rect.width<1||rect.height<1){raf=requestAnimationFrame(render);return;}
 const scale=Math.min(window.devicePixelRatio||1,1.5);
 const cw=Math.round(rect.width*scale),ch=Math.round(rect.height*scale);
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,rect.width,rect.height);
 // Source remains unchanged. Feathered localized patches move just 1-3 px.
 // Scene is drawn in its actual on-screen bounds to preserve home framing.
 const left=im.left-rect.left,top=im.top-rect.top;
 const sw=im.width,sh=im.height;
 if(sw>0&&sh>0){
  for(const p of patches){
   const x=left+sw*p.x,y=top+sh*p.y,w=sw*p.w,h=sh*p.h;
   const dx=Math.sin(t*2*Math.PI/p.period)*p.amp*(playing?2.1:1);
   const dy=Math.sin(t*2*Math.PI/4400)*(.7+(p.amp*.12));
   ctx.save();
   ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w*.45,h*.44,0,0,Math.PI*2);ctx.clip();
   ctx.globalAlpha=.55;
   // draw original at a shifted position within the feathered region
   ctx.drawImage(scene,left+dx,top+dy,sw,sh);
   ctx.restore();
  }
 }
 raf=requestAnimationFrame(render);
}
function start(){if(raf)return;raf=requestAnimationFrame(render);}
function refresh(){
 const next=eligible()&&!home.hidden&&getComputedStyle(home).display!=='none';
 if(next&&!active){scene=home.querySelector('.home-lr-scene-v096');layer.hidden=false;active=true;start();}
 else if(!next&&active){active=false;layer.hidden=true;layer.classList.remove('is-show');playing=false;seq++;if(raf)cancelAnimationFrame(raf);raf=0;ctx?.clearRect(0,0,canvas.width,canvas.height);}
}
function rare(){
 if(playing)return;playing=true;lastRare=Date.now();const id=++seq;
 layer.classList.add('is-show');
 setTimeout(()=>{if(id===seq)layer.classList.remove('is-show');},4000);
 setTimeout(()=>{if(id===seq)playing=false;},4800);
}
home.addEventListener('click',e=>{
 if(!active||playing||e.target.closest('button,a,.home-menu,.home-notice,.home-version'))return;
 const r=home.getBoundingClientRect();if(e.clientX>r.left+r.width*.54)return;
 taps++;
 if(taps>=5&&Date.now()-lastRare>30000&&Math.random()<.1){taps=0;rare();}
});
new MutationObserver(refresh).observe(home,{attributes:true,attributeFilter:['style','hidden','class']});
document.addEventListener('click',()=>requestAnimationFrame(refresh));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else{refresh();if(active)start();}});
refresh();
})();