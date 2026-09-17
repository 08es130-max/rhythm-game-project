// Ver.0.8.37: lightweight AudioBuffer tap SFX for iPhone/PWA.
(function(){
  'use strict';
  const VERSION='0.8.37';
  const MAX_VOICES=12;
  let ctx=null;
  let buffer=null;
  let loading=null;
  let master=null;
  const voices=[];

  function ensureContext(){
    if(!ctx){
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      ctx=new Ctx({latencyHint:'interactive'});
      master=ctx.createGain();
      master.gain.value=0.9;
      master.connect(ctx.destination);
    }
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    return ctx;
  }

  function dataUriToArrayBuffer(uri){
    const comma=uri.indexOf(',');
    if(comma<0)throw new Error('invalid tap sound data');
    const meta=uri.slice(0,comma);
    const body=uri.slice(comma+1);
    if(/;base64/i.test(meta)){
      const bin=atob(body);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      return bytes.buffer;
    }
    return new TextEncoder().encode(decodeURIComponent(body)).buffer;
  }

  function preload(){
    if(buffer)return Promise.resolve(buffer);
    if(loading)return loading;
    const c=ensureContext();
    if(!c||typeof BOOSTED_TAP_DATA==='undefined'||!BOOSTED_TAP_DATA){
      return Promise.resolve(null);
    }
    try{
      const raw=dataUriToArrayBuffer(BOOSTED_TAP_DATA);
      loading=c.decodeAudioData(raw.slice(0)).then(decoded=>{
        buffer=decoded;
        return buffer;
      }).catch(()=>null).finally(()=>{loading=null;});
      return loading;
    }catch(_){
      return Promise.resolve(null);
    }
  }

  function dropVoice(source){
    const i=voices.indexOf(source);
    if(i>=0)voices.splice(i,1);
  }

  function playBuffered(){
    const c=ensureContext();
    if(!c||!buffer||!master)return false;

    // Hard cap simultaneous sounds so rapid tapping never creates an unbounded
    // audio workload on iPhone. Stop the oldest voice before starting a new one.
    while(voices.length>=MAX_VOICES){
      const old=voices.shift();
      try{old.stop();}catch(_){}
    }

    try{
      const source=c.createBufferSource();
      source.buffer=buffer;
      source.connect(master);
      source.onended=()=>dropVoice(source);
      voices.push(source);
      source.start(0);
      return true;
    }catch(_){
      return false;
    }
  }

  window.playTapSound=function(){
    if(playBuffered())return;
    // Do not fall back to HTMLAudio or oscillator creation during live play.
    // If preloading is still in progress, simply skip this one tap sound.
    preload();
  };

  // Prime/decode before the first live note. The START gesture also unlocks
  // WebAudio on iOS, so gameplay itself performs no expensive decode work.
  const prime=()=>{ensureContext();preload();};
  document.getElementById('startBtn')?.addEventListener('pointerdown',prime,{passive:true});
  document.getElementById('retryBtn')?.addEventListener('pointerdown',prime,{passive:true});
  document.addEventListener('pointerdown',()=>{
    if(ctx?.state==='suspended')ctx.resume().catch(()=>{});
  },{passive:true});

  // Decode opportunistically after initial page work. This does not play audio.
  if('requestIdleCallback' in window){
    requestIdleCallback(()=>preload(),{timeout:1500});
  }else{
    setTimeout(()=>preload(),500);
  }

  window.LOVEFES_TAP_SFX_DEBUG={
    version:VERSION,
    ready:()=>!!buffer,
    voices:()=>voices.length,
    maxVoices:MAX_VOICES
  };
})();