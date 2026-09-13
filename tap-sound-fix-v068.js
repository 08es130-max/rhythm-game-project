// Ver.0.6.8: restore the live tap "shaan" sound on iOS/PWA.
(function(){
  const VERSION='0.6.8';
  let pool=[];
  let poolIndex=0;
  let fallbackCtx=null;

  function buildPool(){
    if(pool.length)return;
    try{
      if(typeof BOOSTED_TAP_DATA!=='undefined' && BOOSTED_TAP_DATA){
        pool=Array.from({length:6},()=>{
          const a=new Audio(BOOSTED_TAP_DATA);
          a.preload='auto';
          a.volume=0.9;
          return a;
        });
      }
    }catch(_){pool=[];}
  }

  function fallbackShan(grade){
    try{
      fallbackCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      const ctx=fallbackCtx;
      const play=()=>{
        const now=ctx.currentTime;
        const gain=ctx.createGain();
        const high=ctx.createBiquadFilter();
        high.type='highpass';
        high.frequency.value=700;
        gain.gain.setValueAtTime(0.20,now);
        gain.gain.exponentialRampToValueAtTime(0.001,now+0.11);
        high.connect(gain).connect(ctx.destination);
        const base=grade==='perfect'?1900:grade==='great'?1700:1500;
        [1,1.42].forEach((mul,i)=>{
          const osc=ctx.createOscillator();
          osc.type=i===0?'sine':'triangle';
          osc.frequency.setValueAtTime(base*mul,now);
          osc.frequency.exponentialRampToValueAtTime(base*mul*0.58,now+0.09);
          osc.connect(high);
          osc.start(now);
          osc.stop(now+0.1);
        });
      };
      if(ctx.state==='suspended')ctx.resume().then(play).catch(()=>{}); else play();
    }catch(_){}
  }

  window.playTapSound=function(grade){
    buildPool();
    if(pool.length){
      const a=pool[poolIndex++%pool.length];
      try{
        a.pause();
        a.currentTime=0;
        const p=a.play();
        if(p&&typeof p.catch==='function')p.catch(()=>fallbackShan(grade));
        return;
      }catch(_){}
    }
    fallbackShan(grade);
  };

  // iOS/PWA can leave WebAudio suspended after changing screens or starting media.
  // Resume it from the next user gesture so the fallback is always ready.
  document.addEventListener('pointerdown',()=>{
    try{if(fallbackCtx?.state==='suspended')fallbackCtx.resume().catch(()=>{});}catch(_){}
  },{passive:true});

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>el.textContent=`Ver. ${VERSION}`);
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ中のタップ効果音が鳴らない問題を修正しました。';
  }
  syncVersion();
})();
