// Ver.0.7.0: second-stage mobile performance tuning + reliable pause button.
(function(){
  const VERSION='0.7.0';
  let cachedGeometry=null;
  let noteRef=null;
  let firstActiveIndex=0;
  const notePool=[];
  const pooled=new WeakSet();

  function computeGeometry(){
    const w=game.clientWidth;
    const h=game.clientHeight;
    const spawn={x:w*0.5,y:h*0.075};
    const centerX=w*0.5;
    const centerY=h*0.20;
    const radiusX=w*0.33;
    const radiusY=h*0.70;
    const targetPoints=Array.from({length:9},(_,i)=>{
      const angle=Math.PI+(Math.PI*i/8);
      return {x:centerX+Math.cos(angle)*radiusX,y:centerY-Math.sin(angle)*radiusY};
    });
    cachedGeometry={spawn,targetPoints};
    return cachedGeometry;
  }

  function liveGeometry(){return cachedGeometry||computeGeometry();}
  function invalidateGeometry(){cachedGeometry=null;}
  window.addEventListener('resize',invalidateGeometry,{passive:true});
  window.addEventListener('orientationchange',invalidateGeometry,{passive:true});
  try{getGeometry=liveGeometry;}catch(_){}

  // Pool note elements to avoid repeated allocation/removal and iOS GC spikes.
  function pooledCreateNoteEl(){
    let el=notePool.pop();
    if(!el){
      el=document.createElement('div');
      el.className='note';
    }
    el.className='note';
    el.style.display='block';
    el.style.left='0px';
    el.style.top='0px';
    el.style.opacity='';
    el.style.filter='';
    el.style.transform='translate3d(-9999px,-9999px,0)';
    el.style.willChange='transform';
    el.style.backfaceVisibility='hidden';
    if(el.parentNode!==notesLayer)notesLayer.appendChild(el);
    return el;
  }

  function pooledRemoveNoteEl(note){
    const el=note?.el;
    if(!el)return;
    note.el=null;
    el.style.display='none';
    el.classList.remove('missed');
    if(!pooled.has(el)){
      pooled.add(el);
      if(notePool.length<64)notePool.push(el);
      else el.remove();
    }
  }
  try{createNoteEl=pooledCreateNoteEl;}catch(_){}
  try{removeNoteEl=pooledRemoveNoteEl;}catch(_){}
  window.createNoteEl=pooledCreateNoteEl;
  window.removeNoteEl=pooledRemoveNoteEl;

  function resetCursorIfNeeded(){
    if(noteRef!==activeNotes){noteRef=activeNotes;firstActiveIndex=0;}
  }

  function retireOldNotes(now){
    while(firstActiveIndex<activeNotes.length){
      const n=activeNotes[firstActiveIndex];
      if(n.finished){firstActiveIndex++;continue;}
      const dt=n.timeMs-now;
      if(!n.hit&&!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(n.hit){n.finished=true;pooledRemoveNoteEl(n);firstActiveIndex++;continue;}
      if(dt<-TRAIL_MS){pooledRemoveNoteEl(n);n.finished=true;firstActiveIndex++;continue;}
      break;
    }
  }

  function moveNote(n,x,y,scale){
    if(!n.el)n.el=pooledCreateNoteEl();
    n.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
    const missed=n.missRegistered;
    if(missed!==n.el.classList.contains('missed'))n.el.classList.toggle('missed',missed);
  }

  function optimizedLoop(){
    if(!playing)return;
    resetCursorIfNeeded();
    const now=currentMs();
    const leadMs=1600/Number(speed.value);
    const {spawn,targetPoints}=liveGeometry();
    retireOldNotes(now);

    for(let i=firstActiveIndex;i<activeNotes.length;i++){
      const n=activeNotes[i];
      if(n.finished||n.hit)continue;
      const dt=n.timeMs-now;
      if(dt>leadMs)break;
      if(!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(dt<-TRAIL_MS){pooledRemoveNoteEl(n);n.finished=true;continue;}
      const progress=getNoteProgress(dt,leadMs);
      const p=targetPoints[n.lane];
      const x=spawn.x+(p.x-spawn.x)*progress;
      const y=spawn.y+(p.y-spawn.y)*progress;
      const scale=progress<=1?0.45+0.55*progress:1;
      moveNote(n,x,y,scale);
    }

    if(isSilentMode()&&now>=silentDurationMs){finishGame();return;}
    rafId=requestAnimationFrame(optimizedLoop);
  }

  function optimizedHitLane(lane){
    flashTarget(lane);
    if(!playing)return;
    resetCursorIfNeeded();
    const now=currentMs();
    const windowMs=HIT_WINDOWS.good;
    let candidate=null,bestAbs=Infinity;
    for(let i=firstActiveIndex;i<activeNotes.length;i++){
      const n=activeNotes[i];
      if(n.timeMs>now+windowMs)break;
      if(n.lane!==lane||n.hit||n.missRegistered||n.finished)continue;
      const abs=Math.abs(now-n.timeMs);
      if(abs<bestAbs&&abs<=windowMs){bestAbs=abs;candidate=n;}
    }
    if(!candidate)return;
    let grade='good';
    if(bestAbs<=HIT_WINDOWS.perfect)grade='perfect';
    else if(bestAbs<=HIT_WINDOWS.great)grade='great';
    registerHit(candidate,grade);
    playTapSound(grade);
  }
  try{loop=optimizedLoop;}catch(_){}
  try{hitLane=optimizedHitLane;}catch(_){}

  // Reduce expensive paint effects only while playing. Geometry and judgement stay unchanged.
  const old=document.getElementById('performance-style-v069');if(old)old.remove();
  const style=document.createElement('style');
  style.id='performance-style-v070';
  style.textContent=`
    body.playing-mode:not(.finished-mode) .pause-btn{display:block!important;position:fixed!important;z-index:2147483647!important;top:max(8px,env(safe-area-inset-top))!important;right:max(10px,env(safe-area-inset-right))!important;bottom:auto!important;left:auto!important;pointer-events:auto!important;touch-action:manipulation!important}
    .pause-menu{z-index:2147483646!important;pointer-events:auto!important}
    body.playing-mode .game::before,body.playing-mode .game::after,body.playing-mode .live-backdrop{display:none!important}
    body.playing-mode .game{background:#07101e!important;contain:layout paint style}
    body.playing-mode .note{will-change:transform!important;backface-visibility:hidden!important;box-shadow:0 0 8px rgba(96,165,250,.55)!important;filter:none!important}
    body.playing-mode .target-avatar{box-shadow:inset 0 0 0 1px rgba(255,255,255,.28)!important}
    body.playing-mode .target-ring{box-shadow:0 0 0 2px rgba(96,165,250,.18)!important}
    body.playing-mode .lane{opacity:.34!important}
  `;
  document.head.appendChild(style);

  // Capture pause before the playfield can consume the touch on iOS.
  const pauseCapture=(e)=>{
    const btn=e.target?.closest?.('#pauseBtn');
    if(!btn||!playing)return;
    e.preventDefault();
    e.stopPropagation();
    try{openPauseMenu();}catch(_){}
  };
  document.addEventListener('pointerdown',pauseCapture,true);
  document.addEventListener('touchstart',pauseCapture,{capture:true,passive:false});

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ描画をさらに軽量化し、ノーツのカクつきとライブ中断ボタンの操作不良を修正しました。';
  }
  syncVersion();
})();
