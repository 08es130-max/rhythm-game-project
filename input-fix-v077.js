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

  function handlePointerDown(e){
    if(!playing||gamePaused)return;
    const target=e.target;
    if(target?.closest?.('#pauseBtn')){
      openPauseMenu();
      return;
    }
    if(!game.contains(target))return;
    const lane=laneFromTarget(target);
    if(lane<0)return;
    if(activePointers.has(e.pointerId))return;
    activePointers.add(e.pointerId);
    fastHitLaneAt(lane,songTimeForEvent(e.timeStamp));
  }

  function releasePointer(e){activePointers.delete(e.pointerId);}
  function resetPointers(){activePointers.clear();}

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
    reset:resetPointers
  };
})();