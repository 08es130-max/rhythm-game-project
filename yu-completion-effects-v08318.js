// Yu first-wave LR completion: isolated visual effects (v0.8.320).
(()=>{'use strict';
const home=document.getElementById('homeScreen');
if(!home)return;
const key='rhythmGame.shiorikoHomeArt.v1';
const ids=['lr-shioriko-eternal-rose','lr-ayumu-flower-garden','lr-kasumi-flower-garden','lr-shizuku-blue-garden','lr-karin-blue-garden','lr-kanata-lavender-garden','lr-setsuna-rose-garden','lr-ai-sunflower-garden','lr-emma-flower-garden','lr-mia-silver-garden','lr-rina-pink-garden','lr-lanzhu-rose-palace'];
const colors=['#f48aa8','#ffe45c','#60d9fa','#667eea','#ff9b48','#c98acb','#f85e73','#a7e19b','#d7c8ef','#7de0bf','#e4eaf8','#ffb5c7'];
const owned=()=>{try{if(typeof window.loadGachaOwned==='function')return window.loadGachaOwned();return new Set(JSON.parse(localStorage.getItem('rhythmGame.unlockedCharacters.v1')||'[]'));}catch(_){return new Set();}};
const eligible=()=>localStorage.getItem(key)==='yu'&&ids.every(id=>owned().has(id));
const css=document.createElement('style');css.textContent=`
#homeScreen .yu-special-effects{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;isolation:isolate}
#homeScreen .yu-special-effects .yu-spark{position:absolute;width:var(--size);height:var(--size);left:var(--x);top:var(--y);border-radius:50%;background:var(--color);box-shadow:0 0 9px 3px var(--color);opacity:0;animation:yu-drift var(--dur) ease-in-out infinite;animation-delay:var(--delay)}
#homeScreen .yu-special-effects .yu-glow{position:absolute;left:27%;top:11%;width:13%;height:24%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.20),rgba(148,227,255,.10) 40%,transparent 75%);filter:blur(10px);animation:yu-pulse 3s ease-in-out infinite}
#homeScreen .yu-special-effects .yu-orbit-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#homeScreen .yu-special-effects .yu-flash{position:absolute;pointer-events:none;opacity:0;mix-blend-mode:screen;background:radial-gradient(ellipse,rgba(255,255,255,.86) 0%,rgba(255,255,255,.36) 16%,rgba(155,220,255,.20) 42%,transparent 74%);filter:blur(5px);animation:yu-flash 1.15s ease-out forwards}
#homeScreen .yu-special-effects .yu-rainbow-flash{background:conic-gradient(from 25deg,rgba(255,105,130,.36),rgba(255,214,110,.38),rgba(112,238,187,.32),rgba(105,175,255,.40),rgba(196,132,255,.36),rgba(255,105,130,.36));mask-image:radial-gradient(ellipse,transparent 0%,black 36%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse,transparent 0%,black 36%,transparent 75%)}
@keyframes yu-flash{0%{opacity:0;transform:scale(.65)}24%{opacity:.92}100%{opacity:0;transform:scale(1.35)}}
#homeScreen .yu-special-effects .yu-burst{position:absolute;left:31%;top:33%;width:8px;height:8px;border-radius:50%;background:var(--color);box-shadow:0 0 14px var(--color);animation:yu-burst .9s ease-out forwards}
#homeScreen .yu-special-effects .yu-note{position:absolute;left:31%;top:35%;font-size:20px;color:var(--color);text-shadow:0 0 9px var(--color);animation:yu-note 1.3s ease-out forwards}
@keyframes yu-drift{0%,100%{opacity:0;transform:translateY(12px) scale(.5)}40%,65%{opacity:.8}80%{transform:translateY(-18px) scale(1.15)}}
@keyframes yu-pulse{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:.85;transform:scale(1.18)}}
@keyframes yu-burst{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.15)}}
@keyframes yu-note{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(25deg) scale(1.3)}}
@media(prefers-reduced-motion:reduce){#homeScreen .yu-special-effects .yu-intro,#homeScreen .yu-special-effects .yu-spark,#homeScreen .yu-special-effects .yu-glow{animation:none;opacity:0}}
`;document.head.appendChild(css);
const layer=document.createElement('div');layer.className='yu-special-effects';layer.hidden=true;home.appendChild(layer);
const el=(cls,props={})=>{const n=document.createElement('span');n.className=cls;for(const [k,v]of Object.entries(props))n.style.setProperty(k,v);return n;};
const rnd=(a,b)=>a+Math.random()*(b-a);
function ambient(){layer.replaceChildren();const glow=el('yu-glow');layer.appendChild(glow);for(let i=0;i<34;i++){layer.appendChild(el('yu-spark',{'--x':rnd(4,96)+'%','--y':rnd(5,94)+'%','--size':rnd(2,5)+'px','--color':colors[i%12],'--dur':rnd(3,7)+'s','--delay':-rnd(0,7)+'s'}));}}
function intro(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const canvas=document.createElement('canvas');canvas.className='yu-orbit-canvas';layer.appendChild(canvas);
const rect=layer.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
const ctx=canvas.getContext('2d');if(!ctx||!w||!h){canvas.remove();return;}
ctx.scale(dpr,dpr);
const cx=w*.31,cy=h*.36,start=performance.now(),duration=2800;
const rgb=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
let stopped=false;
function frame(now){
if(stopped||!canvas.isConnected)return;
const t=Math.min(1,(now-start)/duration);ctx.clearRect(0,0,w,h);
for(let i=0;i<12;i++){
const base=i*Math.PI*2/12;
const p=Math.max(0,Math.min(1,(t-i*.014)/.87));
const ease=p*p*(3-2*p);
const radius=(Math.min(w*.48,h*.77)*(1-ease)+w*.026);
const theta=base+Math.PI*2*(1.6*ease);
const opacity=Math.min(1,p*7)*(1-Math.pow(Math.max(0,(p-.77)/.23),1.5));
const [rr,gg,bb]=rgb[i];
ctx.lineCap='round';
for(let j=15;j>=0;j--){
const q=Math.max(0,ease-j*.008);
const rad=Math.min(w*.48,h*.77)*(1-q)+w*.026;
const angle=base+Math.PI*2*1.6*q;
const x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad*.65;
const fade=(1-j/16)*opacity;
ctx.beginPath();ctx.strokeStyle='rgba('+rr+','+gg+','+bb+','+(fade*.58)+')';ctx.lineWidth=(j<3?3.5:2.2)*(1-j/23);ctx.shadowBlur=13;ctx.shadowColor=colors[i];
if(j===15)ctx.moveTo(x,y);else{const pq=Math.max(0,ease-(j+1)*.008),pr=Math.min(w*.48,h*.77)*(1-pq)+w*.026,pa=base+Math.PI*2*1.6*pq;ctx.moveTo(cx+Math.cos(pa)*pr,cy+Math.sin(pa)*pr*.65);ctx.lineTo(x,y);ctx.stroke();}
}
}
if(t>.67){const blend=(t-.67)/.33;const gradient=ctx.createRadialGradient(cx,cy,0,cx,cy,w*.20);gradient.addColorStop(0,'rgba(255,255,255,'+(Math.sin(blend*Math.PI)*.68)+')');gradient.addColorStop(.35,'rgba(195,175,255,'+(Math.sin(blend*Math.PI)*.28)+')');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(cx-w*.2,cy-w*.2,w*.4,w*.4);}
if(t<1)requestAnimationFrame(frame);else canvas.remove();
}
requestAnimationFrame(frame);}
function flash(){for(const [cls,x,y,w,h] of [['yu-flash','24%','7%','17%','40%'],['yu-flash yu-rainbow-flash','50%','6%','47%','78%']]){const n=el(cls);Object.assign(n.style,{left:x,top:y,width:w,height:h});layer.appendChild(n);n.addEventListener('animationend',()=>n.remove(),{once:true});}}
function burst(){if(layer.hidden)return;for(let i=0;i<24;i++){const angle=i*Math.PI/12,dist=rnd(70,190);const n=el(i%3?'yu-burst':'yu-note',{'--color':colors[i%12],'--dx':Math.cos(angle)*dist+'px','--dy':Math.sin(angle)*dist+'px'});if(i%3===0)n.textContent='♪';layer.appendChild(n);n.addEventListener('animationend',()=>n.remove(),{once:true});}}
let active=false,taps=0;
function refresh(){const visible=!home.hidden&&getComputedStyle(home).display!=='none';const next=visible&&eligible();if(next&&!active){layer.hidden=false;taps=0;ambient();intro();}else if(!next&&active){layer.hidden=true;layer.replaceChildren();}active=next;}
home.addEventListener('click',e=>{if(!active)return;if(e.target.closest('button,a,.home-menu,.home-dialogue-bubble,.home-notice,.home-version'))return;const r=home.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.left+r.width*.53)return;burst();flash();taps++;if(taps>=5){taps=0;intro();}});
const observer=new MutationObserver(refresh);observer.observe(home,{attributes:true,attributeFilter:['class','style','hidden']});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-shio-mode']});document.addEventListener('visibilitychange',refresh);document.addEventListener('click',()=>requestAnimationFrame(refresh));window.addEventListener('storage',refresh);refresh();
})();