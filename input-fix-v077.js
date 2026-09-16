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
