// Ver.0.7.4: reduce hit-sound and HUD overhead on iPhone/PWA.
(function(){
  const VERSION='0.7.4';
  let tapCtx=null;
  let tapBuffer=null;
  let tapBufferPromise=null;
  let hudRaf=0;

  function getTapContext(){
    if(tapCtx)return tapCtx;
    try{tapCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(_){tapCtx=null;}
    return tapCtx;
  }

  function makeSyntheticBuffer(ctx){
    const rate=ctx.sampleRate||44100;
    const length=Math.max(1,Math.floor(rate*.105));
    const buffer=ctx.createBuffer(1,length,rate);
    const out=buffer.getChannelData(0);
    for(let i=0;i<length;i++){
      const t=i/rate;
      const env=Math.exp(-36*t);
      const v=Math.sin(2*Math.PI*(1780-520*t)*t)*.72 + Math.sin(2*Math.PI*(2480-760*t)*t)*.28;
      out[i]=v*env*.34;
    }
    return buffer;
  }

  async function prepareTapBuffer(){
    if(tapBuffer)return tapBuffer;
    if(tapBufferPromise)return tapBufferPromise;
    tapBufferPromise=(async()=>{
      const ctx=getTapContext();
      if(!ctx)return null;
      try{
        if(typeof BOOSTED_TAP_DATA!=='undefined'&&BOOSTED_TAP_DATA){
          const res=await fetch(BOOSTED_TAP_DATA);
          const arr=await res.arrayBuffer();
          tapBuffer=await ctx.decodeAudioData(arr.slice(0));
          return tapBuffer;
        }
      }catch(_){}
      try{tapBuffer=makeSyntheticBuffer(ctx);}catch(_){tapBuffer=null;}
      return tapBuffer;
    })();
    return tapBufferPromise;
  }

  function playBufferedTap(grade){
    const ctx=getTapContext();
    if(!ctx)return;
    const play=()=>{
      const buffer=tapBuffer||makeSyntheticBuffer(ctx);
      if(!tapBuffer)tapBuffer=buffer;
      const src=ctx.createBufferSource();
      const gain=ctx.createGain();
      src.buffer=buffer;
      const pitch=grade==='perfect'?1.0:grade==='great'?.96:.92;
      src.playbackRate.value=pitch;
      gain.gain.value=.92;
      src.connect(gain).connect(ctx.destination);
      src.start();
    };
    if(ctx.state==='suspended')ctx.resume().then(play).catch(()=>{}); else play();
  }

  // Pre-decode the tap sample before dense gameplay. Reusing one decoded AudioBuffer
  // is much lighter than repeatedly starting pooled <audio> MP3 elements on iOS.
  prepareTapBuffer().catch(()=>{});
  document.addEventListener('pointerdown',()=>{
    const ctx=getTapContext();
    try{if(ctx?.state==='suspended')ctx.resume().catch(()=>{});}catch(_){}
    prepareTapBuffer().catch(()=>{});
  },{passive:true});

  const bufferedPlayTapSound=function(grade){
    playBufferedTap(grade);
  };
  try{playTapSound=bufferedPlayTapSound;}catch(_){window.playTapSound=bufferedPlayTapSound;}

  // SCORE/COMBO DOM writes do not need to run multiple times inside one frame.
  // Coalesce them so dense simultaneous hits/misses leave more main-thread time for input.
  const originalUpdateHud=updateHud;
  const lightUpdateHud=function(){
    if(hudRaf)return;
    hudRaf=requestAnimationFrame(()=>{
      hudRaf=0;
      originalUpdateHud();
    });
  };
  try{updateHud=lightUpdateHud;}catch(_){window.updateHud=lightUpdateHud;}

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{
      const t=`Ver. ${VERSION}`;
      if(el.textContent!==t)el.textContent=t;
    });
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ノーツを見やすく拡大し、Canvas描画負荷とタップ時の音声負荷をさらに軽減しました。';
  }
  syncVersion();
})();
