// Ver.0.8.221: Pointer Events input + buffered tap SFX + assist judgment windows.
(function(){
  'use strict';
  const VERSION='0.8.221';
  let ref=null;
  let lanes=Array.from({length:9},()=>[]);
  let cursors=Array(9).fill(0);
  const flashTimers=Array(9).fill(0);
  const activePointers=new Set();

  function rebuild(){
    ref=activeNotes;
    lanes=Array.from({length:9},()=>[]);
    cursors=Array(9).fill(0);
    for(const n of activeNotes){
      if(n&&Number.isInteger(n.lane)&&n.lane>=0&&n.lane<9)lanes[n.lane].push(n);
    }
  }
  function ensure(){if(ref!==activeNotes)rebuild();}
  const ASSIST_NEIGHBOR_GUARD_MS=10;
  function assistEnabled(){
    try{return typeof isPerfectAssistEnabled==='function'&&isPerfectAssistEnabled();}catch(_){return false;}
  }
  function maxHitWindow(){
    try{return typeof getComboAssistWindow==='function'?getComboAssistWindow():HIT_WINDOWS.good;}catch(_){return HIT_WINDOWS.good;}
  }
  function gradeForAbs(abs){
    try{return typeof getAssistGrade==='function'?getAssistGrade(abs):(abs<=getPerfectWindow()?'perfect':abs<=HIT_WINDOWS.great?'great':'good');}
    catch(_){return abs<=HIT_WINDOWS.perfect?'perfect':abs<=HIT_WINDOWS.great?'great':'good';}
  }
  function noteWindows(list,index){
    if(!assistEnabled())return {early:HIT_WINDOWS.good,late:HIT_WINDOWS.good};
    const n=list[index];
    let early=maxHitWindow(),late=maxHitWindow();
    const prev=list[index-1],next=list[index+1];
    if(prev&&Number.isFinite(prev.timeMs)){
      early=Math.min(early,Math.max(0,(n.timeMs-prev.timeMs)/2-ASSIST_NEIGHBOR_GUARD_MS));
    }
    if(next&&Number.isFinite(next.timeMs)){
      late=Math.min(late,Math.max(0,(next.timeMs-n.timeMs)/2-ASSIST_NEIGHBOR_GUARD_MS));
    }
    return {early,late};
  }
  function noteInWindow(list,index,now){
    const n=list[index];
    if(!n)return false;
    const delta=now-n.timeMs;
    const w=noteWindows(list,index);
    return delta<0?(-delta<=w.early):(delta<=w.late);
  }
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

  const holdPointers=new Map();
  const recentPointerDowns=[];
  const pendingTouchFallbacks=new Map();
  const touchFallbackPointers=new Map();
  function rememberPointerDown(e){
    const now=performance.now();
    recentPointerDowns.push({t:now,x:e.clientX,y:e.clientY,pointerId:e.pointerId});
    while(recentPointerDowns.length&&now-recentPointerDowns[0].t>180)recentPointerDowns.shift();
    // If TouchEvent arrived first on iOS, cancel its pending fallback as soon as the
    // matching PointerEvent appears.
    for(const [id,p] of pendingTouchFallbacks){
      if(now-p.t<=80&&Math.hypot((e.clientX??0)-p.x,(e.clientY??0)-p.y)<=42){
        clearTimeout(p.timer);
        pendingTouchFallbacks.delete(id);
        break;
      }
    }
  }
  function hasRecentPointerForTouch(touch){
    const now=performance.now();
    return recentPointerDowns.some(p=>now-p.t<=80&&Math.hypot((touch.clientX??0)-p.x,(touch.clientY??0)-p.y)<=42);
  }

  // Temporary live input diagnostics. Kept in memory only; no personal/device data.
  const inputDiag=[];
  const DIAG_MAX=1400;
  const diagnosedMisses=new WeakSet();
  function pushDiag(type,data={}){
    const row={t:Math.round(performance.now()),song:playing?Math.round(currentMs()):-1,type,...data};
    inputDiag.push(row);
    if(inputDiag.length>DIAG_MAX)inputDiag.splice(0,inputDiag.length-DIAG_MAX);
  }
  function scanMisses(){
    try{
      for(const n of activeNotes||[]){
        if(!n||!n.missRegistered||diagnosedMisses.has(n))continue;
        diagnosedMisses.add(n);
        pushDiag('note-miss',{
          lane:n.lane,
          noteTime:Math.round(n.timeMs),
          hold:!!n.holdVisualOnly,
          holdStarted:!!n.holdStarted,
          holdEnd:Number.isFinite(n.holdEndMs)?Math.round(n.holdEndMs):null
        });
      }
    }catch(_){}
  }
  function diag(type,data={}){
    scanMisses();
    pushDiag(type,data);
  }
  function diagCandidate(lane,whenMs){
    ensure();
    const win=maxHitWindow();
    let best=null,bestDelta=null;
    for(const n of (lanes[lane]||[])){
      if(!n||n.finished||n.hit||n.missRegistered||n.holdStarted)continue;
      const delta=Math.round(whenMs-n.timeMs);
      if(bestDelta===null||Math.abs(delta)<Math.abs(bestDelta)){best=n;bestDelta=delta;}
    }
    return {candidate:!!best,delta:bestDelta,inGood:bestDelta!==null&&Math.abs(bestDelta)<=win};
  }

  function findHoldStart(lane,now){
    ensure();
    const list=lanes[lane];
    if(!list)return null;
    let best=null,bestAbs=Infinity,bestIndex=-1;
    for(let i=0;i<list.length;i++){
      const n=list[i];
      if(!n.holdVisualOnly||!Number.isFinite(n.holdEndMs)||n.holdStarted||n.missRegistered)continue;
      const d=Math.abs(now-n.timeMs);
      if(noteInWindow(list,i,now)&&d<bestAbs){best=n;bestAbs=d;bestIndex=i;}
    }
    return best?{note:best,abs:bestAbs,index:bestIndex}:null;
  }

  function startHoldIfPresent(lane,whenMs,pointerId){
    const now=Number.isFinite(whenMs)?whenMs:currentMs();
    const found=findHoldStart(lane,now);
    if(!found)return false;
    diag('hold-start',{lane,delta:Math.round(now-found.note.timeMs),pointerId});
    const n=found.note;
    const grade=gradeForAbs(found.abs);
    // Stage 1: record hold state only. End/release judgment and extra scoring are intentionally not added yet.
    n.holdStarted=true;
    n.holdPointerId=pointerId;
    n.holdStartGrade=grade;
    n.holdStartAt=now;
    n.holdResolved=false;
    n.holdFailed=false;
    holdPointers.set(pointerId,n);
    // Capture the hold pointer on the game surface. Once a hold starts, movement
    // outside the judgment circle must not hand the pointer to another element or
    // cancel the hold; only pointerup/pointercancel resolves it.
    try{
      if(game?.setPointerCapture&&Number.isFinite(pointerId))game.setPointerCapture(pointerId);
    }catch(_){}
    // A hold counts as two judgments: start + release. Award the start immediately.
    counts[grade]++;
    combo++;
    maxCombo=Math.max(maxCombo,combo);
    score+=grade==='perfect'?1000:grade==='great'?700:400;
    judgeEl.textContent=grade.toUpperCase();
    updateHud();
    playTapSound(grade);
    return true;
  }

  function fastHitLaneAt(lane,whenMs){
    lightFlash(lane);
    if(!playing||gamePaused)return;
    ensure();
    const list=lanes[lane];
    if(!list)return;
    const now=Number.isFinite(whenMs)?whenMs:currentMs();
    const win=maxHitWindow();
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
      if(noteInWindow(list,j,now)&&d<best){best=d;candidate=n;bestIndex=j;}
    }
    if(!candidate){
      const d=diagCandidate(lane,now);
      diag('no-candidate',{lane,pointerId:null,...d});
      return;
    }
    const grade=gradeForAbs(best);
    diag('tap-hit',{lane,delta:Math.round(now-candidate.timeMs),grade});
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

  function laneFromPoint(x,y){
    const rect=game?.getBoundingClientRect?.();
    if(!rect||!Number.isFinite(x)||!Number.isFinite(y))return -1;

    // While holding, treat the full playable width as nine continuous lane sectors.
    // The free thumb can land above/below or between the visible circular targets;
    // horizontal position is the stable cue for which lane was intended.
    if(holdPointers.size>0){
      const rel=(x-rect.left)/Math.max(1,rect.width);
      if(rel<0||rel>1)return -1;
      return Math.max(0,Math.min(8,Math.floor(rel*9)));
    }

    let best=-1,bestD=Infinity;
    for(let lane=0;lane<9;lane++){
      const el=targets.children[lane];
      if(!el)continue;
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      const d=Math.hypot(x-cx,y-cy);
      if(d<bestD){bestD=d;best=lane;}
    }
    const target=best>=0?targets.children[best]:null;
    const tr=target?.getBoundingClientRect?.();
    const radius=tr?Math.max(tr.width,tr.height)*1.15:0;
    return bestD<=radius?best:-1;
  }

  function handlePointerDown(e){
    if(!playing||gamePaused)return;
    const target=e.target;
    if(target?.closest?.('#pauseBtn')){
      openPauseMenu();
      return;
    }
    if(!game.contains(target))return;
    // During a hold always resolve the free thumb by coordinates. On iOS/PWA the
    // second pointer can inherit/retarget to the held element, which made taps land
    // on the hold lane or disappear even when e.target looked valid.
    let lane=holdPointers.size>0?laneFromPoint(e.clientX,e.clientY):laneFromTarget(target);
    if(lane<0)lane=laneFromTarget(target);
    if(lane<0)return;
    if(activePointers.has(e.pointerId))return;
    activePointers.add(e.pointerId);
    // Capture every live pointer, not only the hold pointer. On iOS the free thumb can
    // otherwise be cancelled/retargeted when the first thumb is already captured.
    try{
      if(game?.setPointerCapture&&Number.isFinite(e.pointerId))game.setPointerCapture(e.pointerId);
    }catch(_){}
    const whenMs=songTimeForEvent(e.timeStamp);
    diag('pointerdown',{pointerId:e.pointerId,lane,holdCount:holdPointers.size,x:Math.round(e.clientX),y:Math.round(e.clientY),...diagCandidate(lane,whenMs)});
    if(startHoldIfPresent(lane,whenMs,e.pointerId))return;
    let hitWhenMs=whenMs;
    if(holdPointers.size>0){
      ensure();
      const win=maxHitWindow();
      // iOS/PWA can report a PointerEvent timeStamp about 100-150ms behind the
      // actual game clock during multi-touch. That made valid free-thumb taps fall
      // outside GOOD even though pointerdown itself reached the game. For hold-free
      // taps only, use the live game clock; normal taps keep the proven timestamp path.
      const holdTapWhenMs=currentMs();
      hitWhenMs=holdTapWhenMs;
      const held=[...holdPointers.values()][0];
      const heldLeft=held&&held.lane<4;
      const heldRight=held&&held.lane>4;
      let bestNote=null,bestAbs=Infinity;
      // While one thumb is holding, the chart intentionally supplies at most one
      // ordinary tap at a time on the free side. Select that note primarily by timing;
      // the touch x-position is only a hint. This removes misses caused by radial
      // target geometry, thumb drift, or iOS retargeting during multi-touch.
      for(const n of activeNotes){
        if(!n||n.holdVisualOnly||n.finished||n.hit||n.missRegistered)continue;
        if(!Number.isInteger(n.lane)||n.lane<0||n.lane>8)continue;
        if(heldLeft&&n.lane<5)continue;
        if(heldRight&&n.lane>3)continue;
        if(held&&n.lane===held.lane)continue;
        const d=Math.abs(n.timeMs-holdTapWhenMs);
        if(d<=win&&d<bestAbs){bestNote=n;bestAbs=d;}
      }
      if(bestNote){
        diag('hold-free-select',{
          pointerId:e.pointerId,
          heldLane:held?.lane??null,
          touchLane:lane,
          selectedLane:bestNote.lane,
          noteTime:Math.round(bestNote.timeMs),
          delta:Math.round(holdTapWhenMs-bestNote.timeMs)
        });
        lane=bestNote.lane;
      }else{
        diag('hold-free-no-note',{pointerId:e.pointerId,heldLane:held?.lane??null,touchLane:lane});
      }
    }
    fastHitLaneAt(lane,hitWhenMs);
  }

  function resolveHoldRelease(n,whenMs){
    if(!n||n.holdResolved)return;
    n.holdReleasedAt=whenMs;
    const delta=whenMs-n.holdEndMs;
    diag('hold-release',{lane:n.lane,delta:Math.round(delta),start:n.timeMs,end:n.holdEndMs,pointerId:n.holdPointerId});
    const abs=Math.abs(delta);
    if(abs<=maxHitWindow()){
      const grade=gradeForAbs(abs);
      n.holdEndGrade=grade;
      n.holdResolved=true;
      n.hit=true;
      n.finished=true;
      counts[grade]++;
      combo++;
      maxCombo=Math.max(maxCombo,combo);
      score+=grade==='perfect'?1000:grade==='great'?700:400;
      judgeEl.textContent=grade.toUpperCase();
      updateHud();
      playTapSound(grade);
      return;
    }
    // Any release before the GOOD end window is an interrupted hold.
    // A late release outside the window is also a miss.
    n.holdFailed=true;
    n.holdResolved=true;
    n.missRegistered=true;
    n.finished=true;
    counts.miss++;
    combo=0;
    judgeEl.textContent='MISS';
    updateHud();
  }

  function releasePointer(e){
    diag(e.type,{pointerId:e.pointerId,wasHold:holdPointers.has(e.pointerId),activeCount:activePointers.size});
    activePointers.delete(e.pointerId);
    const n=holdPointers.get(e.pointerId);
    if(n){
      resolveHoldRelease(n,songTimeForEvent(e.timeStamp));
      holdPointers.delete(e.pointerId);
    }
    try{
      if(game?.hasPointerCapture?.(e.pointerId))game.releasePointerCapture(e.pointerId);
    }catch(_){}
  }
  function resetPointers(){
    for(const pointerId of holdPointers.keys()){
      try{
        if(game?.hasPointerCapture?.(pointerId))game.releasePointerCapture(pointerId);
      }catch(_){}
    }
    for(const p of pendingTouchFallbacks.values())clearTimeout(p.timer);
    pendingTouchFallbacks.clear();
    touchFallbackPointers.clear();
    recentPointerDowns.length=0;
    activePointers.clear();
    holdPointers.clear();
  }

  // Live gameplay must own multi-touch. preventDefault suppresses iOS long-press
  // magnifier/callout/gesture handling that otherwise steals or delays the second thumb.
  function livePointerDown(e){
    if(playing&&!gamePaused&&game.contains(e.target))rememberPointerDown(e);
    if(playing&&!gamePaused&&game.contains(e.target)){
      if(e.cancelable)e.preventDefault();
    }
    handlePointerDown(e);
  }
  function livePointerRelease(e){
    if(playing&&game.contains(e.target)&&e.cancelable)e.preventDefault();
    releasePointer(e);
  }
  // iOS Safari can recognize magnifier/double-tap gestures at the Touch Event
  // layer before Pointer Events fully reach the game. Suppress native touch gestures
  // only while an actual live is running; menus and the rest of the app are untouched.
  function suppressNativeLiveTouch(e){
    if(!playing||gamePaused)return;
    const t=e.target;
    if(!t||!game.contains(t))return;
    if(t.closest?.('#pauseBtn'))return;

    // Pointer Events remain primary. A small number of iOS/PWA contacts produce
    // touchstart + pointerup but no pointerdown. Queue a zero-delay fallback only
    // when no matching pointerdown was seen, then cancel it if PointerEvent arrives.
    if(e.type==='touchstart'&&e.changedTouches){
      for(const touchItem of e.changedTouches){
        const id=touchItem.identifier;
        if(hasRecentPointerForTouch(touchItem)||pendingTouchFallbacks.has(id))continue;
        const pending={t:performance.now(),x:touchItem.clientX,y:touchItem.clientY,timer:0};
        pending.timer=setTimeout(()=>{
          pendingTouchFallbacks.delete(id);
          if(!playing||gamePaused)return;
          const syntheticId='touch-fallback-'+id;
          touchFallbackPointers.set(id,syntheticId);
          diag('touch-fallback-down',{touchId:id,x:Math.round(touchItem.clientX),y:Math.round(touchItem.clientY),holdCount:holdPointers.size});
          handlePointerDown({
            target:t,
            pointerId:syntheticId,
            clientX:touchItem.clientX,
            clientY:touchItem.clientY,
            timeStamp:performance.now()
          });
        },0);
        pendingTouchFallbacks.set(id,pending);
      }
    }
    if((e.type==='touchend'||e.type==='touchcancel')&&e.changedTouches){
      for(const touchItem of e.changedTouches){
        const id=touchItem.identifier;
        const p=pendingTouchFallbacks.get(id);
        if(p){clearTimeout(p.timer);pendingTouchFallbacks.delete(id);}
        const syntheticId=touchFallbackPointers.get(id);
        if(syntheticId){
          touchFallbackPointers.delete(id);
          diag('touch-fallback-up',{touchId:id,pointerId:syntheticId});
          releasePointer({type:e.type==='touchcancel'?'pointercancel':'pointerup',pointerId:syntheticId,timeStamp:performance.now()});
        }
      }
    }

    const touch=e.changedTouches?.[0];
    diag(e.type,{
      touches:e.touches?.length??0,
      x:touch?Math.round(touch.clientX):null,
      y:touch?Math.round(touch.clientY):null,
      cancelable:!!e.cancelable,
      holdCount:holdPointers.size,
      heldLanes:[...holdPointers.values()].map(n=>n.lane)
    });
    if(e.cancelable)e.preventDefault();
  }
  game.addEventListener('touchstart',suppressNativeLiveTouch,{capture:true,passive:false});
  game.addEventListener('touchmove',suppressNativeLiveTouch,{capture:true,passive:false});
  game.addEventListener('touchend',suppressNativeLiveTouch,{capture:true,passive:false});
  game.addEventListener('touchcancel',suppressNativeLiveTouch,{capture:true,passive:false});

  document.addEventListener('pointerdown',livePointerDown,{capture:true,passive:false});
  document.addEventListener('pointerup',livePointerRelease,{capture:true,passive:false});
  document.addEventListener('pointercancel',livePointerRelease,{capture:true,passive:false});
  window.addEventListener('blur',resetPointers,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPointers();},{passive:true});

  document.getElementById('startBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);resetPointers();inputDiag.length=0;});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);resetPointers();inputDiag.length=0;});
  document.getElementById('stopBtn')?.addEventListener('click',resetPointers);

  window.LOVEFES_INPUT_DEBUG={
    version:VERSION,
    tapSfxDuringLive:true,
    activePointerCount:()=>activePointers.size,
    activeHoldCount:()=>holdPointers.size,
    activeHolds:()=>[...holdPointers.values()].map(n=>({lane:n.lane,start:n.timeMs,end:n.holdEndMs,grade:n.holdStartGrade})),
    diagnostics:()=>inputDiag.slice(),
    clearDiagnostics:()=>{inputDiag.length=0;},
    copyDiagnostics:async()=>{
      scanMisses();
      const payload=JSON.stringify({
        version:window.APP_VERSION,
        createdAt:new Date().toISOString(),
        songTime:playing?Math.round(currentMs()):null,
        activeHolds:[...holdPointers.values()].map(n=>({lane:n.lane,start:n.timeMs,end:n.holdEndMs,startedAt:n.holdStartAt})),
        events:inputDiag
      },null,2);
      try{await navigator.clipboard.writeText(payload);return true;}catch(_){return payload;}
    },
    reset:resetPointers
  };
})();