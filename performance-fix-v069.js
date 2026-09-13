// Ver.0.6.9: optimize live rendering for dense charts on mobile/PWA.
(function(){
  const VERSION='0.6.9';
  let cachedGeometry=null;
  let cachedW=0;
  let cachedH=0;
  let noteRef=null;
  let firstActiveIndex=0;

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
    cachedW=w;
    cachedH=h;
    cachedGeometry={spawn,targetPoints};
    return cachedGeometry;
  }

  function liveGeometry(){
    if(!cachedGeometry)return computeGeometry();
    return cachedGeometry;
  }

  function invalidateGeometry(){
    cachedGeometry=null;
    requestAnimationFrame(()=>{
      computeGeometry();
      try{layoutPlayfield();}catch(_){}
    });
  }

  if(typeof ResizeObserver!=='undefined'){
    try{new ResizeObserver(invalidateGeometry).observe(game);}catch(_){}
  }
  window.addEventListener('orientationchange',invalidateGeometry,{passive:true});

  // Replaces the original geometry helper so the animation loop no longer
  // reads layout and rebuilds all 9 target positions on every frame.
  try{getGeometry=liveGeometry;}catch(_){}

  function resetCursorIfNeeded(){
    if(noteRef!==activeNotes){
      noteRef=activeNotes;
      firstActiveIndex=0;
    }
  }

  function retireOldNotes(now){
    while(firstActiveIndex<activeNotes.length){
      const n=activeNotes[firstActiveIndex];
      if(n.finished){firstActiveIndex++;continue;}
      const dt=n.timeMs-now;
      if(!n.hit&&!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(n.hit){n.finished=true;removeNoteEl(n);firstActiveIndex++;continue;}
      if(dt<-TRAIL_MS){removeNoteEl(n);n.finished=true;firstActiveIndex++;continue;}
      break;
    }
  }

  function moveNoteWithTransform(n,x,y,scale){
    if(!n.el)n.el=createNoteEl();
    if(n.el.dataset.gpu069!=='1'){
      n.el.dataset.gpu069='1';
      n.el.style.left='0px';
      n.el.style.top='0px';
      n.el.style.willChange='transform';
      n.el.style.backfaceVisibility='hidden';
    }
    n.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
    if(n.missRegistered!==n.el.classList.contains('missed'))n.el.classList.toggle('missed',n.missRegistered);
  }

  function optimizedLoop(){
    if(!playing)return;
    resetCursorIfNeeded();
    const now=currentMs();
    const leadMs=1600/Number(speed.value);
    const {spawn,targetPoints}=liveGeometry();

    retireOldNotes(now);

    // activeNotes is time-sorted. Only touch notes currently near the screen;
    // do not scan all ~1350 notes on every requestAnimationFrame.
    for(let i=firstActiveIndex;i<activeNotes.length;i++){
      const n=activeNotes[i];
      if(n.finished||n.hit)continue;
      const dt=n.timeMs-now;
      if(dt>leadMs)break;
      if(!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(dt<-TRAIL_MS){removeNoteEl(n);n.finished=true;continue;}
      if(dt>=-TRAIL_MS){
        const progress=getNoteProgress(dt,leadMs);
        const p=targetPoints[n.lane];
        const x=spawn.x+(p.x-spawn.x)*progress;
        const y=spawn.y+(p.y-spawn.y)*progress;
        const scale=progress<=1?0.45+0.55*progress:1;
        moveNoteWithTransform(n,x,y,scale);
      }
    }

    if(isSilentMode()&&now>=silentDurationMs){finishGame();return;}
    rafId=requestAnimationFrame(optimizedLoop);
  }

  function optimizedHitLane(lane){
    flashTarget(lane);
    if(!playing)return;
    resetCursorIfNeeded();
    const now=currentMs();
    let candidate=null;
    let bestAbs=Infinity;
    const windowMs=HIT_WINDOWS.good;

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

  const style=document.createElement('style');
  style.id='performance-style-v069';
  style.textContent='.note{will-change:transform;backface-visibility:hidden;transform-origin:center center}';
  document.head.appendChild(style);

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ描画を軽量化し、高密度譜面のノーツをより滑らかに表示するよう改善しました。';
  }
  syncVersion();
})();
