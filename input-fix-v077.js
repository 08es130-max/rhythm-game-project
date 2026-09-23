// Ver.0.8.37: Pointer Events input + buffered tap SFX.
(function(){
  'use strict';
  const VERSION='0.8.37';
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

  function findHoldStart(lane,now){
    ensure();
    const list=lanes[lane];
    if(!list)return null;
    const win=HIT_WINDOWS.good;
    let best=null,bestAbs=Infinity;
    for(const n of list){
      if(!n.holdVisualOnly||!Number.isFinite(n.holdEndMs)||n.holdStarted||n.missRegistered)continue;
      const d=Math.abs(now-n.timeMs);
      if(d<=win&&d<bestAbs){best=n;bestAbs=d;}
    }
    return best?{note:best,abs:bestAbs}:null;
  }

  function startHoldIfPresent(lane,whenMs,pointerId){
    const now=Number.isFinite(whenMs)?whenMs:currentMs();
    const found=findHoldStart(lane,now);
    if(!found)return false;
    const n=found.note;
    let grade='good';
    if(found.abs<=getPerfectWindow())grade='perfect';
    else if(found.abs<=HIT_WINDOWS.great)grade='great';
    // Stage 1: record hold state only. End/release judgment and extra scoring are intentionally not added yet.
    n.holdStarted=true;
    n.holdPointerId=pointerId;
    n.holdStartGrade=grade;
    n.holdStartAt=now;
    n.holdResolved=false;
    n.holdFailed=false;
    holdPointers.set(pointerId,n);
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

  function laneFromPoint(x,y){
    const rect=targets?.getBoundingClientRect?.();
    if(!rect||!Number.isFinite(x)||!Number.isFinite(y))return -1;
    let best=-1,bestD=Infinity;
    for(let lane=0;lane<9;lane++){
      const el=targets.children[lane];
      if(!el)continue;
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      const d=Math.hypot(x-cx,y-cy);
      if(d<bestD){bestD=d;best=lane;}
    }
    // While another thumb is held, iOS can retarget the second pointer to the game
    // surface instead of the target element. Accept a generous target-radius here;
    // normal pointer handling remains unchanged when closest('.target') succeeds.
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
    let lane=laneFromTarget(target);
    if(lane<0&&holdPointers.size>0)lane=laneFromPoint(e.clientX,e.clientY);
    if(lane<0)return;
    if(activePointers.has(e.pointerId))return;
    activePointers.add(e.pointerId);
    const whenMs=songTimeForEvent(e.timeStamp);
    if(startHoldIfPresent(lane,whenMs,e.pointerId))return;
    fastHitLaneAt(lane,whenMs);
  }

  function resolveHoldRelease(n,whenMs){
    if(!n||n.holdResolved)return;
    n.holdReleasedAt=whenMs;
    const delta=whenMs-n.holdEndMs;
    const abs=Math.abs(delta);
    if(abs<=HIT_WINDOWS.good){
      let grade='good';
      if(abs<=getPerfectWindow())grade='perfect';
      else if(abs<=HIT_WINDOWS.great)grade='great';
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
    activePointers.delete(e.pointerId);
    const n=holdPointers.get(e.pointerId);
    if(n){
      resolveHoldRelease(n,songTimeForEvent(e.timeStamp));
      holdPointers.delete(e.pointerId);
    }
  }
  function resetPointers(){
    activePointers.clear();
    holdPointers.clear();
  }

  document.addEventListener('pointerdown',handlePointerDown,{capture:true,passive:true});
  document.addEventListener('pointerup',releasePointer,{capture:true,passive:true});
  document.addEventListener('pointercancel',releasePointer,{capture:true,passive:true});
  window.addEventListener('blur',resetPointers,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPointers();},{passive:true});

  document.getElementById('startBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);resetPointers();});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{ref=null;cursors.fill(0);resetPointers();});
  document.getElementById('stopBtn')?.addEventListener('click',resetPointers);

  window.LOVEFES_INPUT_DEBUG={
    version:VERSION,
    tapSfxDuringLive:true,
    activePointerCount:()=>activePointers.size,
    activeHoldCount:()=>holdPointers.size,
    activeHolds:()=>[...holdPointers.values()].map(n=>({lane:n.lane,start:n.timeMs,end:n.holdEndMs,grade:n.holdStartGrade})),
    reset:resetPointers
  };
})();