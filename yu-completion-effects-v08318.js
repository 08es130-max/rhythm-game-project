// Yu first-wave LR completion: isolated visual effects (v0.8.318).
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
#homeScreen .yu-special-effects .yu-intro{position:absolute;inset:0;overflow:hidden;animation:yu-intro-hide 2.7s forwards}
#homeScreen .yu-special-effects .yu-intro i{position:absolute;left:var(--sx);top:var(--sy);width:12px;height:12px;border-radius:50%;background:var(--color);box-shadow:0 0 18px 8px var(--color);animation:yu-gather 2.3s cubic-bezier(.2,.5,.2,1) both;animation-delay:var(--delay)}
#homeScreen .yu-special-effects .yu-burst{position:absolute;left:31%;top:33%;width:8px;height:8px;border-radius:50%;background:var(--color);box-shadow:0 0 14px var(--color);animation:yu-burst .9s ease-out forwards}
#homeScreen .yu-special-effects .yu-note{position:absolute;left:31%;top:35%;font-size:20px;color:var(--color);text-shadow:0 0 9px var(--color);animation:yu-note 1.3s ease-out forwards}
@keyframes yu-drift{0%,100%{opacity:0;transform:translateY(12px) scale(.5)}40%,65%{opacity:.8}80%{transform:translateY(-18px) scale(1.15)}}
@keyframes yu-pulse{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:.85;transform:scale(1.18)}}
@keyframes yu-gather{0%{opacity:0;transform:scale(.3)}20%{opacity:1}75%{opacity:1}100%{opacity:0;left:31%;top:33%;transform:scale(2)}}
@keyframes yu-intro-hide{0%,85%{opacity:1}100%{opacity:0;visibility:hidden}}
@keyframes yu-burst{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.15)}}
@keyframes yu-note{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(25deg) scale(1.3)}}
@media(prefers-reduced-motion:reduce){#homeScreen .yu-special-effects .yu-intro,#homeScreen .yu-special-effects .yu-spark,#homeScreen .yu-special-effects .yu-glow{animation:none;opacity:0}}
`;document.head.appendChild(css);
const layer=document.createElement('div');layer.className='yu-special-effects';layer.hidden=true;home.appendChild(layer);
const el=(cls,props={})=>{const n=document.createElement('span');n.className=cls;for(const [k,v]of Object.entries(props))n.style.setProperty(k,v);return n;};
const rnd=(a,b)=>a+Math.random()*(b-a);
function ambient(){layer.replaceChildren();const glow=el('yu-glow');layer.appendChild(glow);for(let i=0;i<34;i++){layer.appendChild(el('yu-spark',{'--x':rnd(4,96)+'%','--y':rnd(5,94)+'%','--size':rnd(2,5)+'px','--color':colors[i%12],'--dur':rnd(3,7)+'s','--delay':-rnd(0,7)+'s'}));}}
function intro(){const box=el('yu-intro');for(let i=0;i<12;i++){const n=document.createElement('i');n.style.setProperty('--sx',rnd(5,95)+'%');n.style.setProperty('--sy',rnd(5,90)+'%');n.style.setProperty('--color',colors[i]);n.style.setProperty('--delay',i*.065+'s');box.appendChild(n);}layer.appendChild(box);box.addEventListener('animationend',()=>box.remove(),{once:true});}
function burst(){if(layer.hidden)return;for(let i=0;i<24;i++){const angle=i*Math.PI/12,dist=rnd(70,190);const n=el(i%3?'yu-burst':'yu-note',{'--color':colors[i%12],'--dx':Math.cos(angle)*dist+'px','--dy':Math.sin(angle)*dist+'px'});if(i%3===0)n.textContent='♪';layer.appendChild(n);n.addEventListener('animationend',()=>n.remove(),{once:true});}}
let active=false;
function refresh(){const visible=!home.hidden&&getComputedStyle(home).display!=='none';const next=visible&&eligible();if(next&&!active){layer.hidden=false;ambient();intro();}else if(!next&&active){layer.hidden=true;layer.replaceChildren();}active=next;}
home.addEventListener('click',e=>{if(!active)return;if(e.target.closest('button,a,.home-menu,.home-dialogue-bubble,.home-notice,.home-version'))return;const r=home.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.left+r.width*.53)return;burst();});
const observer=new MutationObserver(refresh);observer.observe(home,{attributes:true,attributeFilter:['class','style','hidden']});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-shio-mode']});document.addEventListener('visibilitychange',refresh);document.addEventListener('click',()=>requestAnimationFrame(refresh));window.addEventListener('storage',refresh);refresh();
})();