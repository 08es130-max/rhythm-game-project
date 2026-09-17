// Ver.0.8.32: keep the gameplay clock monotonic through transient iPhone/PWA media stalls.
(function(){
  const VERSION='0.8.32';
  let anchorPerf=0;
  let anchorAudioMs=0;
  let clockRunning=false;
  let lastSoftSyncPerf=0;
  let lastReturnedMs=0;

  function playbackRate(){
    const r=Number(audio?.playbackRate||1);
    return Number.isFinite(r)&&r>0?r:1;
  }

  function hardAnchorToAudio(){
    if(!audio)return;
    const actual=Math.max(0,Number(audio.currentTime||0)*1000);
    anchorAudioMs=actual;
    anchorPerf=performance.now();
    lastSoftSyncPerf=anchorPerf;
    clockRunning=!audio.paused&&!audio.ended;
    lastReturnedMs=actual+Number(offsetInput?.value||0);
  }

  function startClockIfNeeded(){
    if(!audio||audio.paused||audio.ended||clockRunning)return;
    const actual=Math.max(0,Number(audio.currentTime||0)*1000);
    const now=performance.now();
    // Only use the media position when starting from a real stopped state.
    anchorAudioMs=actual;
    anchorPerf=now;
    lastSoftSyncPerf=now;
    clockRunning=true;
  }

  function freezeToAudio(){
    if(!audio)return;
    const offset=Number(offsetInput?.value||0);
    const actual=Math.max(0,Number(audio.currentTime||0)*1000);
    // Never move gameplay time backwards on a pause event.
    const frozen=Math.max(lastReturnedMs-offset,actual);
    anchorAudioMs=frozen;
    anchorPerf=performance.now();
    lastSoftSyncPerf=anchorPerf;
    clockRunning=false;
    lastReturnedMs=frozen+offset;
  }

  audio?.addEventListener('play',startClockIfNeeded);
  audio?.addEventListener('playing',startClockIfNeeded);
  audio?.addEventListener('seeked',hardAnchorToAudio);
  audio?.addEventListener('loadedmetadata',()=>{ if(!playing) hardAnchorToAudio(); });
  audio?.addEventListener('pause',freezeToAudio);
  audio?.addEventListener('ended',freezeToAudio);

  // IMPORTANT: do not freeze the gameplay clock for `waiting` or `stalled`.
  // iOS/PWA may emit those events for very short decoder/buffer hiccups even
  // while playback audibly continues. Freezing here caused notes to stop,
  // then jump forward on `playing`, which also made valid taps miss their window.

  function smoothCurrentMs(){
    const offset=Number(offsetInput?.value||0);
    if(isSilentMode()){
      const value=performance.now()-silentStartAt+offset;
      lastReturnedMs=Math.max(lastReturnedMs,value);
      return lastReturnedMs;
    }
    if(!audio)return Math.max(lastReturnedMs,offset);

    if(!clockRunning){
      if(!audio.paused&&!audio.ended)startClockIfNeeded();
      else return lastReturnedMs || (anchorAudioMs+offset);
    }

    const now=performance.now();
    let estimate=anchorAudioMs+(now-anchorPerf)*playbackRate();

    // Correct only small, trustworthy drift. Large discrepancies are usually
    // transient iOS media-clock stalls and must not snap the gameplay clock.
    if(now-lastSoftSyncPerf>=2000){
      const actual=Number(audio.currentTime||0)*1000;
      const drift=actual-estimate;
      if(Number.isFinite(drift)&&Math.abs(drift)>=12&&Math.abs(drift)<=120){
        const correction=Math.max(-5,Math.min(5,drift*0.08));
        anchorAudioMs+=correction;
        estimate+=correction;
      }
      lastSoftSyncPerf=now;
    }

    const value=estimate+offset;
    lastReturnedMs=Math.max(lastReturnedMs,value);
    return lastReturnedMs;
  }

  try{currentMs=smoothCurrentMs;}catch(_){window.currentMs=smoothCurrentMs;}

  // Reset the monotonic clamp for a genuinely new live/retry.
  document.getElementById('startBtn')?.addEventListener('click',()=>{lastReturnedMs=0;clockRunning=false;});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{lastReturnedMs=0;clockRunning=false;});

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{
      const t=`Ver. ${window.APP_VERSION||VERSION}`;if(el.textContent!==t)el.textContent=t;
    });
  }
  syncVersion();
})();
