// Ver.0.4.0: six built-in voices are independent MP3 blobs, same HTMLAudio route as device-added files.
(function(){
  const ORDER=['fullhouse','nanisore','dareka','nico','ieni','yohane'];
  let currentAudio=null;
  let currentUrl=null;
  let lastId=null;
  let restoreTimer=null;

  function base64ToBlob(base64,mime){
    const bin=atob(base64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return new Blob([bytes],{type:mime||'audio/mpeg'});
  }
  function stopCurrent(){
    if(currentAudio){ try{currentAudio.pause();}catch(_){} currentAudio=null; }
    if(currentUrl){ try{URL.revokeObjectURL(currentUrl);}catch(_){} currentUrl=null; }
  }
  function duckMusic(ms){
    if(typeof audio==='undefined'||!audio||audio.paused) return;
    const prev=Number.isFinite(audio.volume)?audio.volume:1;
    audio.volume=Math.min(prev,.18);
    clearTimeout(restoreTimer);
    restoreTimer=setTimeout(()=>{try{audio.volume=prev;}catch(_){}},Math.max(1000,ms||3200));
  }
  async function playBuiltinIndex(index){
    const key=ORDER[index];
    const entry=window.LOVEFES_BUILTIN_VOICES?.[key];
    if(!entry) throw new Error('内蔵音声データがありません');
    stopCurrent();
    const blob=base64ToBlob(entry.base64,entry.mime);
    const url=URL.createObjectURL(blob);
    const el=new Audio(url);
    el.preload='auto'; el.playsInline=true; el.volume=1;
    currentAudio=el; currentUrl=url; duckMusic(4200);
    try{ await el.play(); }
    catch(e){ stopCurrent(); throw e; }
    el.onended=()=>{ if(currentAudio===el){ currentAudio=null; } if(currentUrl===url){ try{URL.revokeObjectURL(url);}catch(_){} currentUrl=null; } };
  }

  const localPlayer=typeof playManagedVoice==='function'?playManagedVoice:null;
  playManagedVoice=async function(item){
    if(item?.kind==='builtin'){
      const index=Number(item.index ?? String(item.id||'').replace('builtin-',''));
      return playBuiltinIndex(index);
    }
    return localPlayer?localPlayer(item):Promise.resolve();
  };

  playRandomTenHitVoice=async function(){
    const candidates=typeof getManagedVoiceCandidates==='function'?await getManagedVoiceCandidates():[];
    if(!candidates.length) return;
    let pool=candidates;
    if(candidates.length>1 && lastId){ const f=candidates.filter(v=>v.id!==lastId); if(f.length) pool=f; }
    const item=pool[Math.floor(Math.random()*pool.length)];
    lastId=item.id;
    try{await playManagedVoice(item);}catch(e){console.warn('10回成功音声の再生に失敗しました',e);}
  };

  document.addEventListener('pointerdown',()=>{
    try{ if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended') audioCtx.resume().catch(()=>{}); }catch(_){}
  },true);
})();
