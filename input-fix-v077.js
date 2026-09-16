// Ver.0.7.8: make gameplay input resilient to brief main-thread stalls and repeated taps.
(function(){
  const VERSION='0.7.8';
  let ref=null;
  let lanes=Array.from({length:9},()=>[]);
  let cursors=Array(9).fill(0);
  const flashTimers=Array(9).fill(0);
  const useTouchEvents='ontouchstart' in window;

  function rebuild(){
    ref=activeNotes;
    lanes=Array.from({length:9},()=>[]);
    cursors=Array(9).fill(0);
    for(const n of activeNotes){
      if(n&&Number.isInteger(n.lane)&&n.lane>=0&&n.lane<9)lanes[n.lane].push(n);
    }
  }
  function ensure(){if(ref!==activeNotes)rebuild();}
  function toPerfTimestamp(ts){
    let v=Number(ts);
    if(!Number.isFinite(v)||v<=0)return performance.now();
    if(v>1e12&&Number.isFinite(performance.timeOrigin))v-=performance.timeOrigin;
    return v;
  }
  function songTimeForEvent(eventTs){
    const processedAt=performance.now();
    const eventPerf=toPerfTimestamp(eventTs);
    const queueDelay=Math.max(0,Math.min(1500,processedAt-eventPerf));
    return currentMs()-queueDelay;
  }
  function lightFlash(lane){
    const el=targets.children[lane];
    if(!el)return;
    el.classList.add('active');
    if(flashTimers[lane])clearTimeout(flashTimers[lane]);
    flashTimers[lane]=setTimeout(()=>{flashTimers[lane]=0;el.classList.remove('active');},55);
  }
  try{flashTarget=lightFlash;}catch(_){window.flashTarget=lightFlash;}
  function fastHitLaneAt(lane,whenMs){
    lightFlash(lane);
    if(!playing)return;
    ensure();
    const list=lanes[lane];
    if(!list)return;
    const now=Number.isFinite(whenMs)?whenMs:currentMs();
    const win=HIT_WINDOWS.good;
    let i=cursors[lane]||0;
    while(i<list.length){
      const n=list[i];
      if(n.finished||n.hit||n.missRegistered||n.timeMs<now-win){i++;continue;}
      break;
    }
    cursors[lane]=i;
    let candidate=null,best=Infinity,bestIndex=i;
    for(let j=i;j<list.length;j++){
      const n=list[j];
      if(n.timeMs>now+win)break;
      if(n.finished||n.hit||n.missRegistered)continue;
      const d=Math.abs(now-n.timeMs);
      if(d<best){best=d;candidate=n;bestIndex=j;}
    }
    if(!candidate)return;
    let grade='good';
    if(best<=getPerfectWindow())grade='perfect';
    else if(best<=HIT_WINDOWS.great)grade='great';
    registerHit(candidate,grade);
    playTapSound(grade);
    if(bestIndex===cursors[lane]){
      while(cursors[lane]<list.length){
        const n=list[cursors[lane]];
        if(n.finished||n.hit||n.missRegistered)cursors[lane]++;else break;
      }
    }
  }
  function fastHitLane(lane){fastHitLaneAt(lane,currentMs());}
  try{hitLane=fastHitLane;}catch(_){window.hitLane=fastHitLane;}
  function laneFromTarget(target){
    const el=target?.closest?.('.target');
    if(!el)return -1;
    const lane=Number(el.dataset.lane);
    return Number.isInteger(lane)&&lane>=0&&lane<9?lane:-1;
  }
  function handleLivePress(target,e){
    if(!playing||gamePaused)return;
    if(target?.closest?.('#pauseBtn')){
      if(e.cancelable)e.preventDefault();
      openPauseMenu();
      return;
    }
    if(!game.contains(target))return;
    const lane=laneFromTarget(target);
    if(lane<0)return;
    if(e.cancelable)e.preventDefault();
    fastHitLaneAt(lane,songTimeForEvent(e.timeStamp));
  }
  document.addEventListener('pointerdown',(e)=>{
    if(useTouchEvents&&e.pointerType==='touch')return;
    handleLivePress(e.target,e);
  },{capture:true,passive:false});
  if(useTouchEvents)document.addEventListener('touchstart',(e)=>{
    for(const touch of e.changedTouches)handleLivePress(touch.target,e);
  },{capture:true,passive:false});
  document.getElementById('startBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);});
  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>el.textContent=`Ver. ${VERSION}`);
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ中のタップ入力を強化し、処理落ち時や同じレーンの連打でも入力を取りこぼしにくくしました。';
  }
  syncVersion();
})();

// Temporary iPhone/PWA diagnostics. Observation only: gameplay behavior is unchanged.
(function(){
  const KEY='lovefes.iosInputDiagnostics.v1';
  const MAX_EVENTS=260;
  const MAX_SNAPSHOTS=65;
  const diag={schema:1,startedAt:new Date().toISOString(),ua:navigator.userAgent,events:[],snapshots:[],counts:{},last:{},raf:{count:0,last:0,maxGap:0},session:0};
  let lastRaf=performance.now(),lastPersist=0,lastSongMs=null,stallLogged=false;
  function trim(a,n){if(a.length>n)a.splice(0,a.length-n);}
  function safeCurrentMs(){try{return Number(currentMs());}catch(_){return null;}}
  function addEvent(kind,extra){
    const now=performance.now();
    diag.counts[kind]=(diag.counts[kind]||0)+1;
    diag.last[kind]=now;
    diag.events.push(Object.assign({t:Math.round(now),kind},extra||{}));
    trim(diag.events,MAX_EVENTS);
  }
  function describeEl(el){
    if(!el)return null;
    let cs=null;try{cs=getComputedStyle(el);}catch(_){}
    return {tag:el.tagName||'',id:el.id||'',cls:typeof el.className==='string'?el.className:String(el.className?.baseVal||''),pe:cs?.pointerEvents||'',zi:cs?.zIndex||'',vis:cs?.visibility||'',dis:cs?.display||'',op:cs?.opacity||''};
  }
  function pointInfo(el){
    if(!el)return null;
    const r=el.getBoundingClientRect();
    if(!r.width||!r.height)return null;
    const x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2));
    const y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));
    return {x:Math.round(x),y:Math.round(y),top:describeEl(document.elementFromPoint(x,y))};
  }
  function snapshot(){
    const now=performance.now(),songMs=safeCurrentMs();
    const lanePoints=[];
    try{Array.from(document.querySelectorAll('.target')).slice(0,9).forEach((el,i)=>lanePoints.push({lane:i,p:pointInfo(el)}));}catch(_){}
    const pause=document.getElementById('pauseBtn');
    const gs=game?getComputedStyle(game):null,ts=targets?getComputedStyle(targets):null,ps=pause?getComputedStyle(pause):null;
    const s={t:Math.round(now),wall:new Date().toISOString(),playing:typeof playing!=='undefined'?!!playing:null,paused:typeof gamePaused!=='undefined'?!!gamePaused:null,visibility:document.visibilityState,focus:document.hasFocus(),fullscreen:!!document.fullscreenElement,orientation:screen.orientation?.type||'',currentMs:songMs==null?null:Math.round(songMs),audioMs:typeof audio!=='undefined'&&audio?Math.round(Number(audio.currentTime||0)*1000):null,score:typeof score!=='undefined'?score:null,combo:typeof combo!=='undefined'?combo:null,miss:typeof counts!=='undefined'&&counts?counts.miss:null,active:typeof activeNotes!=='undefined'&&Array.isArray(activeNotes)?activeNotes.filter(n=>!n.finished&&!n.hit).length:null,lastInput:Math.max(diag.last['window:pointerdown']||0,diag.last['window:touchstart']||0),rafCount:diag.raf.count,rafGap:Math.round(diag.raf.maxGap*10)/10,activeEl:describeEl(document.activeElement),gamePE:gs?.pointerEvents||'',targetPE:ts?.pointerEvents||'',pausePE:ps?.pointerEvents||'',touchAction:gs?.touchAction||'',pausePoint:pointInfo(pause),lanes:lanePoints};
    diag.snapshots.push(s);trim(diag.snapshots,MAX_SNAPSHOTS);
    const advanced=lastSongMs!=null&&songMs!=null&&songMs-lastSongMs>300;
    if(s.playing&&!s.paused&&advanced&&s.lastInput&&now-s.lastInput>4000){
      if(!stallLogged){addEvent('input-stall-candidate',{since:Math.round(now-s.lastInput),score:s.score,combo:s.combo,miss:s.miss,currentMs:s.currentMs});stallLogged=true;}
    }else if(s.lastInput&&now-s.lastInput<1500)stallLogged=false;
    lastSongMs=songMs;
  }
  function persist(force){
    const now=performance.now();if(!force&&now-lastPersist<4500)return;lastPersist=now;
    try{localStorage.setItem(KEY,JSON.stringify(diag));}catch(_){}
  }
  function observe(type,name,opts){
    const target=name==='window'?window:name==='game'?game:document;if(!target)return;
    target.addEventListener(type,(e)=>{
      const x=e.changedTouches?.[0]?.clientX??e.clientX??null,y=e.changedTouches?.[0]?.clientY??e.clientY??null;
      addEvent(`${name}:${type}`,{x:x==null?null:Math.round(x),y:y==null?null:Math.round(y),pt:e.pointerType||'',target:describeEl(e.target)});
      if(type.includes('cancel'))persist(true);
    },opts);
  }
  ['pointerdown','pointerup','pointercancel'].forEach(t=>{observe(t,'window',{capture:true,passive:true});observe(t,'document',{capture:true,passive:true});});
  ['touchstart','touchend','touchcancel'].forEach(t=>{observe(t,'window',{capture:true,passive:true});observe(t,'document',{capture:true,passive:true});});
  if(game)['pointerdown','pointercancel','touchstart','touchcancel'].forEach(t=>observe(t,'game',{capture:true,passive:true}));
  function rafBeat(now){const gap=now-lastRaf;lastRaf=now;diag.raf.count++;diag.raf.last=now;if(gap>diag.raf.maxGap)diag.raf.maxGap=gap;requestAnimationFrame(rafBeat);}
  requestAnimationFrame(rafBeat);
  setInterval(()=>{snapshot();persist(false);},1000);
  window.addEventListener('pagehide',()=>persist(true));
  document.addEventListener('visibilitychange',()=>{addEvent('visibility',{state:document.visibilityState});persist(true);});
  document.getElementById('startBtn')?.addEventListener('click',()=>{diag.session++;addEvent('live-start',{session:diag.session});persist(true);});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{diag.session++;addEvent('live-retry',{session:diag.session});persist(true);});
  function report(d){
    d=d||diag;const s=d.snapshots?.[d.snapshots.length-1]||{},c=(d.events||[]).filter(e=>e.kind==='input-stall-candidate');
    return ['ラブフェス！ iOS入力診断',`開始: ${d.startedAt||''}`,`UA: ${d.ua||''}`,`session: ${d.session||0}`,`最新: playing=${s.playing} paused=${s.paused} currentMs=${s.currentMs} score=${s.score} combo=${s.combo} miss=${s.miss}`,`visibility=${s.visibility} focus=${s.focus} fullscreen=${s.fullscreen} orientation=${s.orientation}`,`pointerdown window/document=${d.counts?.['window:pointerdown']||0}/${d.counts?.['document:pointerdown']||0}`,`touchstart window/document/game=${d.counts?.['window:touchstart']||0}/${d.counts?.['document:touchstart']||0}/${d.counts?.['game:touchstart']||0}`,`pointercancel=${d.counts?.['window:pointercancel']||0} touchcancel=${d.counts?.['window:touchcancel']||0}`,`rAF=${d.raf?.count||0} maxGap=${Math.round((d.raf?.maxGap||0)*10)/10}ms`,`stall候補=${c.length}`,'','--- FULL JSON ---',JSON.stringify(d)].join('\n');
  }
  function installViewer(){
    if(document.getElementById('iosDiagBtn'))return;
    const b=document.createElement('button');b.id='iosDiagBtn';b.type='button';b.textContent='診断ログ';Object.assign(b.style,{position:'fixed',left:'8px',bottom:'8px',zIndex:'100000',fontSize:'12px',padding:'7px 10px',opacity:'.88'});
    const st=document.createElement('style');st.textContent='body.playing-mode #iosDiagBtn{display:none!important}';document.head.appendChild(st);
    b.addEventListener('click',()=>{
      let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){}
      const text=report(saved||diag),w=document.createElement('div'),ta=document.createElement('textarea'),cp=document.createElement('button'),cl=document.createElement('button');
      Object.assign(w.style,{position:'fixed',inset:'0',zIndex:'100001',background:'rgba(0,0,0,.88)',padding:'16px',overflow:'auto'});ta.value=text;ta.readOnly=true;Object.assign(ta.style,{width:'100%',height:'75vh',fontSize:'11px',boxSizing:'border-box'});cp.type='button';cp.textContent='全文コピー';cp.style.margin='8px';cl.type='button';cl.textContent='閉じる';cl.style.margin='8px';cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);cp.textContent='コピーしました';}catch(_){ta.focus();ta.select();}});cl.addEventListener('click',()=>w.remove());w.append(ta,cp,cl);document.body.appendChild(w);
    });
    document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installViewer,{once:true});else installViewer();
  window.__lovefesIOSDiag={key:KEY,get:()=>diag,report:()=>report(diag),persist:()=>persist(true)};
})();
