// Ver.0.7.7: reduce per-tap work by indexing notes per lane.
(function(){
  const VERSION='0.7.7';
  let ref=null;
  let lanes=Array.from({length:9},()=>[]);
  let cursors=Array(9).fill(0);

  function rebuild(){
    ref=activeNotes;
    lanes=Array.from({length:9},()=>[]);
    cursors=Array(9).fill(0);
    for(const n of activeNotes){if(n&&Number.isInteger(n.lane)&&n.lane>=0&&n.lane<9)lanes[n.lane].push(n);}
  }
  function ensure(){if(ref!==activeNotes)rebuild();}

  function fastHitLane(lane){
    flashTarget(lane);
    if(!playing)return;
    ensure();
    const list=lanes[lane]; if(!list)return;
    const now=currentMs();
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
    if(best<=HIT_WINDOWS.perfect)grade='perfect';
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

  try{hitLane=fastHitLane;}catch(_){window.hitLane=fastHitLane;}
  document.getElementById('startBtn')?.addEventListener('click',()=>{ref=null;});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{ref=null;});

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>el.textContent=`Ver. ${VERSION}`);
  }
  syncVersion();
})();
