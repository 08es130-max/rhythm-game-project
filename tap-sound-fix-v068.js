// Ver.0.8.37: lightweight AudioBuffer tap SFX for iPhone/PWA.
(function(){
  'use strict';
  const VERSION='0.8.168';
  const LIVE_MODE_KEY='rhythmGame.tapSoundTestMode.v1';
  const BUILTIN_SKIP_SECONDS=0.020;
  const MAX_VOICES=12;
  let ctx=null;
  let buffer=null;
  let loading=null;
  let master=null;
  let outputLatencySec=0;
  let lastPointerPerf=0;
  let lastDiag=null;
  const voices=[];

  function ensureContext(){
    if(!ctx){
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      ctx=new Ctx({latencyHint:'interactive'});
      master=ctx.createGain();
      master.gain.value=0.9;
      master.connect(ctx.destination);
      outputLatencySec=Math.max(0,Number(ctx.outputLatency||ctx.baseLatency||0));
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

  function playLowLatencyShan(){
    const c=ensureContext();
    if(!c||!buffer||!master)return false;
    try{
      const source=c.createBufferSource(),gain=c.createGain(),now=c.currentTime;
      source.buffer=buffer;source.connect(gain).connect(master);
      // Keep the same 20 ms start point so the leading "shi" is not cut.
      // Only emphasize the first attack, then immediately return to normal level.
      const skip=Math.min(BUILTIN_SKIP_SECONDS,Math.max(0,buffer.duration-0.02));
      gain.gain.setValueAtTime(1.75,now);
      gain.gain.exponentialRampToValueAtTime(1.0,now+0.035);
      source.start(now,skip);return true;
    }catch(_){return false;}
  }

  function playInstantShan(){
    const c=ensureContext();
    if(!c||!buffer||!master)return false;
    try{
      const now=c.currentTime;
      // Keep the current shan intact; layer only a tiny high-frequency transient
      // at touch-down so the ear detects the attack sooner.
      const osc=c.createOscillator(),tg=c.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(3200,now);osc.frequency.exponentialRampToValueAtTime(2200,now+0.012);
      tg.gain.setValueAtTime(0.055,now);tg.gain.exponentialRampToValueAtTime(0.0001,now+0.014);
      osc.connect(tg).connect(master);osc.start(now);osc.stop(now+0.015);
      const source=c.createBufferSource();source.buffer=buffer;source.connect(master);
      const skip=Math.min(BUILTIN_SKIP_SECONDS,Math.max(0,buffer.duration-0.02));source.start(now,skip);
      return true;
    }catch(_){return false;}
  }

  function playDiagnosticClick(c){
    try{
      const osc=c.createOscillator(),gain=c.createGain(),now=c.currentTime;
      osc.type='square';osc.frequency.value=1800;
      gain.gain.setValueAtTime(0.10,now);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.018);
      osc.connect(gain).connect(c.destination);osc.start(now);osc.stop(now+0.02);
      return true;
    }catch(_){return false;}
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
      // The pointer handler already fires at touch-down. Start immediately; do not
      // add a software delay. WebAudio interactive context keeps device latency minimal.
      const skip=Math.min(BUILTIN_SKIP_SECONDS,Math.max(0,buffer.duration-0.02));
      const startPerf=performance.now();
      source.start(c.currentTime,skip);
      lastDiag={
        pointerToPlayMs:lastPointerPerf?Math.max(0,startPerf-lastPointerPerf):null,
        state:c.state,
        baseLatencyMs:Math.round(Number(c.baseLatency||0)*1000),
        outputLatencyMs:Math.round(Number(c.outputLatency||0)*1000),
        bufferDurationMs:Math.round(buffer.duration*1000),
        skipMs:Math.round(skip*1000)
      };
      return true;
    }catch(_){
      return false;
    }
  }

  function getLiveMode(){const v=localStorage.getItem(LIVE_MODE_KEY);return ['current','low','instant'].includes(v)?v:'current';}
  function setLiveMode(v){if(['current','low','instant'].includes(v))localStorage.setItem(LIVE_MODE_KEY,v);}

  window.playTapSound=function(){
    const mode=getLiveMode();
    if(mode==='low'&&playLowLatencyShan())return;
    if(mode==='instant'&&playInstantShan())return;
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
  document.addEventListener('pointerdown',(e)=>{
    lastPointerPerf=performance.now();
    if(ctx?.state==='suspended')ctx.resume().catch(()=>{});
  },{capture:true,passive:true});

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
    maxVoices:MAX_VOICES,
    outputLatencyMs:()=>Math.round(outputLatencySec*1000),
    last:()=>lastDiag,
    context:()=>{const c=ensureContext();return c?{state:c.state,baseLatencyMs:Math.round(Number(c.baseLatency||0)*1000),outputLatencyMs:Math.round(Number(c.outputLatency||0)*1000),sampleRate:c.sampleRate}:null;},
    testClick:()=>{const c=ensureContext();return !!c&&playDiagnosticClick(c);},
    testShan:()=>playBuffered(),
    testLowLatencyShan:()=>playLowLatencyShan(),
    testInstantShan:()=>playInstantShan(),
    liveMode:()=>getLiveMode(),
    setLiveMode
  };

  function installDiagnosticPanel(){
    const host=document.querySelector('#settingsScreen .settings-grid');
    if(!host||document.getElementById('tapLatencyDiag'))return;
    const card=document.createElement('div');card.className='setting-card';card.id='tapLatencyDiag';
    card.innerHTML='<div><strong>ライブ用タップ音テスト</strong></div><small>下の3種類から選ぶと、ライブ中のタップ音だけが切り替わります。判定・譜面・入力タイミングは変わりません。</small><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="timing-adjust-btn tap-live-mode" data-mode="current" type="button">現在</button><button class="timing-adjust-btn tap-live-mode" data-mode="low" type="button">低遅延</button><button class="timing-adjust-btn tap-live-mode" data-mode="instant" type="button">瞬発</button></div><div id="tapLiveModeStatus" style="margin-top:8px;font-size:12px"></div><hr style="opacity:.2;margin:12px 0"><div><strong>タップ音診断</strong></div><small>ライブ判定には影響しません。同じ指・同じ感覚で4つを押し比べてください。</small><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button id="tapDiagShan" class="timing-adjust-btn" type="button">現在のシャン</button><button id="tapDiagFastShan" class="timing-adjust-btn" type="button">低遅延シャン</button><button id="tapDiagInstantShan" class="timing-adjust-btn" type="button">瞬発シャン</button><button id="tapDiagClick" class="timing-adjust-btn" type="button">診断クリック音</button></div><div id="tapDiagInfo" style="margin-top:10px;font-size:12px;line-height:1.55;white-space:pre-line">準備中…</div>';
    host.appendChild(card);
    const info=card.querySelector('#tapDiagInfo');
    const modeStatus=card.querySelector('#tapLiveModeStatus');
    const modeLabel={current:'現在のシャン',low:'低遅延シャン',instant:'瞬発シャン'};
    const refreshMode=()=>{const m=getLiveMode();modeStatus.textContent=`ライブ中: ${modeLabel[m]}`;card.querySelectorAll('.tap-live-mode').forEach(b=>{b.disabled=b.dataset.mode===m;});};
    card.querySelectorAll('.tap-live-mode').forEach(b=>b.addEventListener('click',()=>{setLiveMode(b.dataset.mode);refreshMode();}));
    refreshMode();
    const show=()=>{const x=window.LOVEFES_TAP_SFX_DEBUG.context();const d=window.LOVEFES_TAP_SFX_DEBUG.last();info.textContent=`AudioContext: ${x?.state||'-'}\nタップ→再生命令: ${d?.pointerToPlayMs==null?'-':d.pointerToPlayMs.toFixed(1)} ms\nbaseLatency: ${x?.baseLatencyMs??'-'} ms\noutputLatency: ${x?.outputLatencyMs??'-'} ms\nsampleRate: ${x?.sampleRate??'-'} Hz`};
    card.querySelector('#tapDiagShan').addEventListener('pointerdown',()=>{playBuffered();setTimeout(show,0)},{passive:true});
    card.querySelector('#tapDiagFastShan').addEventListener('pointerdown',()=>{playLowLatencyShan();setTimeout(show,0)},{passive:true});
    card.querySelector('#tapDiagInstantShan').addEventListener('pointerdown',()=>{playInstantShan();setTimeout(show,0)},{passive:true});
    card.querySelector('#tapDiagClick').addEventListener('pointerdown',()=>{const x=ensureContext();if(x)playDiagnosticClick(x);setTimeout(show,0)},{passive:true});
    preload().finally(show);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installDiagnosticPanel,{once:true});else installDiagnosticPanel();
})();