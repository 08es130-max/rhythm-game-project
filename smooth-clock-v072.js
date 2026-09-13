// Ver.0.7.2: use a high-resolution gameplay clock instead of per-frame media currentTime.
(function(){
  const VERSION='0.7.2';
  let anchorPerf=0;
  let anchorAudioMs=0;
  let clockRunning=false;
  let lastSoftSyncPerf=0;

  function playbackRate(){
    const r=Number(audio?.playbackRate||1);
    return Number.isFinite(r)&&r>0?r:1;
  }

  function anchorToAudio(){
    if(!audio)return;
    anchorAudioMs=Math.max(0,Number(audio.currentTime||0)*1000);
    anchorPerf=performance.now();
    lastSoftSyncPerf=anchorPerf;
    clockRunning=!audio.paused&&!audio.ended;
  }

  function freezeToAudio(){
    if(!audio)return;
    anchorAudioMs=Math.max(0,Number(audio.currentTime||0)*1000);
    anchorPerf=performance.now();
    clockRunning=false;
  }

  audio?.addEventListener('play',anchorToAudio);
  audio?.addEventListener('playing',anchorToAudio);
  audio?.addEventListener('seeked',anchorToAudio);
  audio?.addEventListener('loadedmetadata',()=>{ if(!playing) anchorToAudio(); });
  audio?.addEventListener('pause',freezeToAudio);
  audio?.addEventListener('waiting',freezeToAudio);
  audio?.addEventListener('stalled',freezeToAudio);
  audio?.addEventListener('ended',freezeToAudio);

  function smoothCurrentMs(){
    const offset=Number(offsetInput?.value||0);
    if(isSilentMode()) return performance.now()-silentStartAt+offset;
    if(!audio) return offset;

    if(!clockRunning){
      if(!audio.paused&&!audio.ended) anchorToAudio();
      else return anchorAudioMs+offset;
    }

    const now=performance.now();
    let estimate=anchorAudioMs+(now-anchorPerf)*playbackRate();

    // Gentle drift correction only. Never snap note positions to a coarse/stalled
    // media clock; seek/pause/buffering events re-anchor explicitly instead.
    if(now-lastSoftSyncPerf>=2000){
      const actual=Number(audio.currentTime||0)*1000;
      const drift=actual-estimate;
      if(Number.isFinite(drift)&&Math.abs(drift)>=12&&Math.abs(drift)<=250){
        const correction=Math.max(-8,Math.min(8,drift*0.12));
        anchorAudioMs+=correction;
        estimate+=correction;
      }
      lastSoftSyncPerf=now;
    }

    return estimate+offset;
  }

  try{currentMs=smoothCurrentMs;}catch(_){window.currentMs=smoothCurrentMs;}

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{
      const t=`Ver. ${VERSION}`;
      if(el.textContent!==t)el.textContent=t;
    });
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ノーツ描画の基準時計を高精度タイマーへ変更し、iPhoneでのコマ送り表示を改善しました。';
  }
  syncVersion();
})();
