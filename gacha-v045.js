// Ver.0.4.8 ten-pull scouting with envelope reveal, UR spotlight, hidden owner test rate and room unlocks.
(function(){
  const DEFAULT_UR_RATE=.01;
  const DEFAULT_LR_RATE=.0001;
  const PULL_COUNT=10;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const GACHA_BGM_SRC='assets/audio/gacha-starry-loop-v0864.wav?v=0.8.66-bgm2';
  let activePullSession=null;
  let gachaAudioCtx=null;
  let gachaBgmBuffer=null;
  let gachaBgmSource=null;
  let gachaBgmGain=null;
  let previousAudioSessionType=null;
  let gachaBgmLoadPromise=null;

  function setGachaAmbientSession(){
    try{
      if(navigator.audioSession){
        previousAudioSessionType=navigator.audioSession.type;
        navigator.audioSession.type='ambient';
      }
    }catch(_){}
  }
  function restoreAudioSession(){
    try{
      if(navigator.audioSession&&previousAudioSessionType){
        navigator.audioSession.type=previousAudioSessionType;
      }
    }catch(_){}
    previousAudioSessionType=null;
  }
  function ensureGachaAudioContext(){
    if(gachaAudioCtx)return gachaAudioCtx;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    gachaAudioCtx=new Ctx();
    gachaBgmGain=gachaAudioCtx.createGain();
    gachaBgmGain.gain.value=0;
    gachaBgmGain.connect(gachaAudioCtx.destination);
    return gachaAudioCtx;
  }
  async function loadGachaBgm(){
    const ctx=ensureGachaAudioContext();
    if(!ctx)return null;
    if(gachaBgmBuffer)return gachaBgmBuffer;
    if(gachaBgmLoadPromise)return gachaBgmLoadPromise;
    gachaBgmLoadPromise=fetch(GACHA_BGM_SRC,{cache:'force-cache'})
      .then(r=>{if(!r.ok)throw new Error('BGM load failed');return r.arrayBuffer();})
      .then(buf=>ctx.decodeAudioData(buf))
      .then(decoded=>(gachaBgmBuffer=decoded))
      .catch(()=>null)
      .finally(()=>{gachaBgmLoadPromise=null;});
    return gachaBgmLoadPromise;
  }
  async function startGachaBgm(){
    setGachaAmbientSession();
    const ctx=ensureGachaAudioContext();
    if(!ctx)return;
    try{await ctx.resume();}catch(_){}
    const buffer=await loadGachaBgm();
    if(!buffer||document.getElementById('gachaScreen')?.hidden)return;
    try{gachaBgmSource?.stop();}catch(_){}
    const src=ctx.createBufferSource();
    src.buffer=buffer;
    src.loop=true;
    src.connect(gachaBgmGain);
    const now=ctx.currentTime;
    gachaBgmGain.gain.cancelScheduledValues(now);
    gachaBgmGain.gain.setValueAtTime(0,now);
    gachaBgmGain.gain.linearRampToValueAtTime(.28,now+.32);
    src.start();
    gachaBgmSource=src;
  }
  function stopGachaBgm(reset=true){
    const ctx=gachaAudioCtx;
    if(!ctx||!gachaBgmGain){
      restoreAudioSession();
      return;
    }
    const src=gachaBgmSource;
    gachaBgmSource=null;
    const now=ctx.currentTime;
    try{
      gachaBgmGain.gain.cancelScheduledValues(now);
      gachaBgmGain.gain.setValueAtTime(gachaBgmGain.gain.value,now);
      gachaBgmGain.gain.linearRampToValueAtTime(0,now+.18);
    }catch(_){}
    if(src){
      setTimeout(()=>{try{src.stop();src.disconnect();}catch(_){}},220);
    }
    setTimeout(restoreAudioSession,240);
  }

  function rand(){
    if(window.crypto?.getRandomValues){
      const a=new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return a[0]/4294967296;
    }
    return Math.random();
  }
  function choice(pool){
    return pool[Math.floor(rand()*pool.length)];
  }
  function getGachaSettings(){
    if(typeof window.getAdminGachaSettings==='function') return window.getAdminGachaSettings();
    return {urRate:DEFAULT_UR_RATE,lrRate:DEFAULT_LR_RATE,testMode:false,testLrFirst:false,saveOwned:true};
  }
  function pullOne(index=0,cfg=getGachaSettings()){
    const lrPool=window.GACHA_LR_POOL||[];
    const urPool=window.GACHA_UR_POOL||[];
    const nPool=window.GACHA_N_POOL||[];
    if(cfg.testLrFirst){
      if(index===0&&lrPool.length) return {unit:choice(lrPool),rarity:'LR'};
      return {unit:choice(urPool),rarity:'UR'};
    }
    const roll=rand();
    const lrRate=Number.isFinite(Number(cfg.lrRate))?Number(cfg.lrRate):DEFAULT_LR_RATE;
    const urRate=Number.isFinite(Number(cfg.urRate))?Number(cfg.urRate):DEFAULT_UR_RATE;
    if(roll<lrRate&&lrPool.length) return {unit:choice(lrPool),rarity:'LR'};
    if(roll<lrRate+urRate) return {unit:choice(urPool),rarity:'UR'};
    return {unit:choice(nPool),rarity:'N'};
  }
  function updateRateDisplay(screen){
    if(!screen) return;
    const cfg=getGachaSettings();
    const urPercent=(Number(cfg.urRate)*100).toFixed(Number(cfg.urRate)<.1?2:0).replace(/\.00$/,'');
    const mini=screen.querySelector('.gacha-rate-mini');
    const copy=screen.querySelector('.gacha-copy span');
    if(mini){
      mini.innerHTML=cfg.testLrFirst?'<b>LR→UR</b> <em>TEST</em>':cfg.testMode?`<b>UR</b> ${urPercent}% <em>TEST</em>`:'<b>LR</b> 0.01% ／ <b>UR</b> 1%';
    }
    if(copy){
      copy.textContent=cfg.testLrFirst?'テスト設定 ／ 1枠目LR・残りUR':cfg.testMode?`テスト設定 ／ UR ${urPercent}%`:'LR 0.01% ／ UR 1% ／ N 98.99%';
    }
    screen.classList.toggle('is-admin-test',cfg.testMode);
  }

  function featuredUnits(){
    const urPool=Array.isArray(window.GACHA_UR_POOL)?window.GACHA_UR_POOL:[];
    const lrPool=Array.isArray(window.GACHA_LR_POOL)?window.GACHA_LR_POOL:[];
    const preferred=['monthly-shioriko','monthly-setsuna'];
    const picked=[...lrPool.slice(0,1),...preferred.map(id=>urPool.find(u=>u.id===id)).filter(Boolean)];
    urPool.forEach(u=>{if(picked.length<3&&!picked.some(x=>x.id===u.id))picked.push(u);});
    return picked.slice(0,3);
  }
  function cleanName(unit){return String(unit?.name||'').replace(/【[^】]+】$/u,'');}

  function renderScoutLobby(screen){
    const featured=featuredUnits();
    const cards=screen.querySelector('.gacha-featured-cards');

    if(cards){
      cards.innerHTML=featured.map((u,i)=>`<article class="gacha-feature-card ${u.rarity==='LR'?'is-lr-feature':''}"><div class="gacha-feature-rarity">${u.rarity||'UR'}</div><div class="gacha-feature-image-wrap"><img src="${u.card||u.icon}" alt="${cleanName(u)}"></div><div class="gacha-feature-series">${u.series||'マンスリーソング'}</div><strong>${cleanName(u)}</strong><small>${i===0?'LEGEND PICK UP':'FEATURED'}</small></article>`).join('');
    }
  }

  function ensureScreen(){
    let screen=document.getElementById('gachaScreen');
    if(screen){updateRateDisplay(screen);renderScoutLobby(screen);return screen;}
    const shell=document.querySelector('.app-shell')||document.body;
    screen=document.createElement('section');
    screen.id='gachaScreen';
    screen.className='app-screen gacha-screen';
    screen.hidden=true;
    screen.innerHTML=`
      <div class="gacha-topbar">
        <button id="gachaHomeBtn" class="gacha-home-btn" type="button">‹ 戻る</button>
        <div class="gacha-heading"><div class="gacha-heading-kicker">SCOUT</div><h1>SCOUT / 勧誘</h1><small>あなたと、もう一度ステージへ</small></div>
        <div class="gacha-wallet"><span class="gacha-gem">◆</span><div><small>SCOUT PASS</small><strong>FREE</strong></div></div>
      </div>
      <div id="gachaLobby" class="gacha-lobby">
        <aside class="gacha-nav">
          <button class="active" type="button"><span>開催中</span><strong>星の約束</strong><small>ピックアップスカウト</small></button>
          <button type="button" disabled><strong>メモリーズ</strong><small>COMING SOON</small></button>
          <button type="button" disabled><strong>恒常スカウト</strong><small>COMING SOON</small></button>
          <button type="button" disabled><strong>チケット</strong><small>COMING SOON</small></button>
        </aside>
        <main class="gacha-lobby-main">
          <div class="gacha-banner">
            <img src="assets/gacha/hoshi-no-yakusoku-banner-v0868.jpg" width="1536" height="864" alt="星の約束 マンスリーソングURピックアップ">
          </div>
          <section class="gacha-featured-cards" aria-label="ピックアップメンバー"></section>
          <div class="gacha-lobby-bottom">
            <div class="gacha-links">
              <button id="gachaRateBtn" type="button">提供割合</button>
              <button id="gachaDetailBtn" type="button">詳細</button>
            </div>
            <div class="gacha-main-actions">
              <button id="gachaPullOneBtn" class="gacha-pull-btn gacha-pull-one" type="button"><span>1回勧誘</span><small>FREE</small></button>
              <button id="gachaPullTenBtn" class="gacha-pull-btn gacha-pull-ten" type="button"><b>UR期待の10連</b><span>10回勧誘</span><small>FREE</small></button>
              <button id="gachaPullHundredBtn" class="gacha-pull-btn gacha-pull-hundred" type="button"><span>100回勧誘</span><small>FREE</small></button>
            </div>
          </div>
        </main>
      </div>
      <div id="gachaRevealStage" class="gacha-stage" hidden>
        <div class="gacha-copy"><strong>勧誘結果</strong><span>LR 0.01% ／ UR 1% ／ N 98.99%</span></div>
        <div id="gachaOmen" class="gacha-omen" aria-live="polite"></div>
        <div id="gachaEnvelopeGrid" class="gacha-envelope-grid" aria-live="polite"></div>
        <div id="gachaSkipActions" class="gacha-skip-actions" hidden>
          <button id="gachaSkipNormalBtn" type="button">URまでスキップ</button>
          <button id="gachaSkipAllBtn" type="button">全スキップ</button>
        </div>
        <div class="gacha-actions">
          <button id="gachaBackLobbyBtn" class="gacha-secondary-btn" type="button">スカウト画面へ戻る</button>
          <span class="gacha-note">同じメンバーが重複して出ることがあります。UR/LRは初獲得時に部室へ追加されます。</span>
        </div>
      </div>`;
    shell.appendChild(screen);

    const backHome=()=>{
      if(screen.classList.contains('is-pulling'))return;
      stopGachaBgm(true);
      screen.hidden=true;
      if(typeof window.showAppScreen==='function')window.showAppScreen('home');
      else document.getElementById('homeScreen')?.removeAttribute('hidden');
    };
    screen.querySelector('#gachaHomeBtn')?.addEventListener('click',backHome);
    screen.querySelector('#gachaPullOneBtn')?.addEventListener('click',()=>runPull(1));
    screen.querySelector('#gachaPullTenBtn')?.addEventListener('click',()=>runPull(10));
    screen.querySelector('#gachaPullHundredBtn')?.addEventListener('click',()=>runPull(100));
    screen.querySelector('#gachaSkipNormalBtn')?.addEventListener('click',()=>{if(activePullSession)activePullSession.skipMode='normal';});
    screen.querySelector('#gachaSkipAllBtn')?.addEventListener('click',()=>{if(activePullSession)activePullSession.skipMode='all';});
    screen.querySelector('#gachaBackLobbyBtn')?.addEventListener('click',()=>{
      if(screen.classList.contains('is-pulling'))return;
      screen.querySelector('#gachaRevealStage').hidden=true;
      screen.querySelector('#gachaLobby').hidden=false;
      renderScoutLobby(screen);
    });
    screen.querySelector('#gachaRateBtn')?.addEventListener('click',()=>{
      const cfg=getGachaSettings();if(cfg.testLrFirst)alert('提供割合（テスト）\n1枠目 LR 100%\n2枠目以降 UR 100%');else alert(`提供割合\nLR【煌めくミントローズ】 ${(Number(cfg.lrRate||DEFAULT_LR_RATE)*100).toFixed(2)}%\nUR【マンスリーソング】 ${(Number(cfg.urRate||DEFAULT_UR_RATE)*100).toFixed(2)}%\nN【音符ロリータ】 ${(100-(Number(cfg.lrRate||DEFAULT_LR_RATE)+Number(cfg.urRate||DEFAULT_UR_RATE))*100).toFixed(2)}%`);
    });
    screen.querySelector('#gachaDetailBtn')?.addEventListener('click',()=>{
      alert('ピックアップスカウト「星の約束」\n最高レアリティLR「三船栞子【煌めくミントローズ】」が登場します。\nUR/LRは初獲得時に部室へ追加され、LR栞子は専用ホーム立ち絵も解放されます。');
    });
    renderScoutLobby(screen);
    updateRateDisplay(screen);
    return screen;
  }

  function hideOtherScreens(){
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=true;});
    document.getElementById('timingCalibration')?.setAttribute('hidden','');
  }

  function makeEnvelope(result,index){
    const item=document.createElement('div');
    item.className=`gacha-envelope-slot rarity-slot-${String(result.rarity||'N').toLowerCase()}`;
    item.dataset.index=String(index);
    const rarityClass=result.rarity==='LR'?'rarity-lr':result.rarity==='UR'?'rarity-ur':'rarity-n';
    const imageSrc=result.rarity==='LR'?result.unit.card:result.unit.icon;
    item.innerHTML=`
      <div class="gacha-envelope-shell" aria-hidden="true">
        <div class="gacha-envelope-paper"></div>
        <div class="gacha-envelope-flap"></div>
        <div class="gacha-envelope-seal">☆</div>
        <div class="gacha-envelope-sparkles"></div>
      </div>
      <article class="gacha-pull-card ${rarityClass}">
        <div class="gacha-rarity">${result.rarity}</div>
        <img src="${imageSrc}" alt="${result.unit.name}" loading="lazy" decoding="async">
        <div class="gacha-card-series">${result.unit.series}</div>
        <div class="gacha-card-name">${String(result.unit.name).replace(/【[^】]+】$/u,'')}</div>
        ${result.isNew?'<span class="gacha-new">NEW</span>':''}
      </article>`;
    return item;
  }

  function ensureUrSpotlight(){
    let overlay=document.getElementById('gachaUrSpotlight');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='gachaUrSpotlight';
    overlay.className='gacha-ur-spotlight';
    overlay.hidden=true;
    const particles=Array.from({length:24},(_,i)=>`<i class="gacha-ur-particle p-${i+1}" style="--i:${i}"></i>`).join('');
    overlay.innerHTML=`
      <div class="gacha-ur-spotlight-backdrop"></div>
      <div class="gacha-ur-beam"></div>
      <div class="gacha-ur-rainbow-rays"></div>
      <div class="gacha-ur-impact-ring ring-a"></div>
      <div class="gacha-ur-impact-ring ring-b"></div>
      <div class="gacha-ur-flash"></div>
      <div class="gacha-ur-particles">${particles}</div>
      <div class="gacha-ur-spotlight-rays"></div>
      <div class="gacha-ur-spotlight-sparkles"></div>
      <div class="gacha-ur-spotlight-card">
        <div class="gacha-ur-spotlight-label">UR GET!</div>
        <div class="gacha-ur-spotlight-image-wrap">
          <img class="gacha-ur-spotlight-image" alt="URメンバー">
        </div>
        <div class="gacha-ur-spotlight-series"></div>
        <div class="gacha-ur-spotlight-name"></div>
        <div class="gacha-ur-spotlight-new" hidden>NEW</div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  async function pullSleep(ms,session,{skipNormal=false}={}){
    const end=performance.now()+ms;
    while(performance.now()<end){
      if(session?.skipMode==='all') return;
      if(skipNormal&&session?.skipMode==='normal') return;
      await sleep(Math.min(40,Math.max(0,end-performance.now())));
    }
  }

  function revealAllSlots(slots){
    slots.forEach(slot=>{
      slot.classList.add('is-open');
      slot.classList.remove('is-ur-pre','is-ur-burst','is-lr-pre','is-lr-burst','is-ready');
    });
  }

  function preloadGachaImage(src){
    return new Promise(resolve=>{
      if(!src){resolve();return;}
      const probe=new Image();
      probe.onload=()=>resolve();
      probe.onerror=()=>resolve();
      probe.src=src;
      if(probe.complete) resolve();
    });
  }

  async function showUrSpotlight(result,session){
    if(session?.skipMode==='all') return;
    const overlay=ensureUrSpotlight();
    const image=overlay.querySelector('.gacha-ur-spotlight-image');
    const series=overlay.querySelector('.gacha-ur-spotlight-series');
    const name=overlay.querySelector('.gacha-ur-spotlight-name');
    const badge=overlay.querySelector('.gacha-ur-spotlight-new');
    const label=overlay.querySelector('.gacha-ur-spotlight-label');
    const nextSrc=result.unit.icon;

    overlay.classList.remove('is-lr');

    image.style.visibility='hidden';
    image.removeAttribute('src');
    await preloadGachaImage(nextSrc);
    if(session?.skipMode==='all') return;

    image.src=nextSrc;
    image.alt=result.unit.name;
    image.style.visibility='visible';
    series.textContent=result.unit.series;
    name.textContent=String(result.unit.name).replace(/【[^】]+】$/u,'');
    if(label) label.textContent='UR GET!';
    badge.hidden=!result.isNew;
    overlay.hidden=false;
    overlay.classList.remove('is-leaving');
    void overlay.offsetWidth;
    requestAnimationFrame(()=>overlay.classList.add('is-active'));
    await pullSleep(1500,session);
    if(session?.skipMode!=='all'){
      overlay.classList.add('is-leaving');
      await pullSleep(250,session);
    }
    overlay.classList.remove('is-active','is-leaving','is-lr');
    overlay.hidden=true;
    image.style.visibility='hidden';
  }


  function ensureLrPrelude(){
    let overlay=document.getElementById('gachaLrPrelude');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='gachaLrPrelude';
    overlay.className='gacha-lr-prelude';
    overlay.hidden=true;
    overlay.innerHTML=`
      <div class="gacha-lr-prelude-backdrop"></div>
      <div class="gacha-lr-prelude-stars"></div>
      <div class="gacha-lr-prelude-ring ring-a"></div>
      <div class="gacha-lr-prelude-ring ring-b"></div>
      <div class="gacha-lr-prelude-ring ring-c"></div>
      <div class="gacha-lr-prelude-mark">✦</div>
      <div class="gacha-lr-prelude-text">
        <small>LEGEND SIGNAL</small>
        <strong>特別な気配を感じます…</strong>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  async function showLrPrelude(session){
    if(session?.skipMode==='all') return;
    const overlay=ensureLrPrelude();
    overlay.hidden=false;
    overlay.classList.remove('is-leaving');
    void overlay.offsetWidth;
    requestAnimationFrame(()=>overlay.classList.add('is-active'));
    await pullSleep(1350,session);
    if(session?.skipMode!=='all'){
      overlay.classList.add('is-leaving');
      await pullSleep(320,session);
    }
    overlay.classList.remove('is-active','is-leaving');
    overlay.hidden=true;
  }

  function ensureLrCinematic(){
    let overlay=document.getElementById('gachaLrCinematic');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='gachaLrCinematic';
    overlay.className='gacha-lr-cinematic';
    overlay.hidden=true;
    const particles=Array.from({length:36},(_,i)=>`<i class="gacha-lr-cinematic-particle p-${i+1}" style="--i:${i}"></i>`).join('');
    overlay.innerHTML=`
      <div class="gacha-lr-cinematic-bg"></div>
      <div class="gacha-lr-cinematic-aurora"></div>
      <div class="gacha-lr-cinematic-rays"></div>
      <div class="gacha-lr-cinematic-rings">
        <i class="ring ring-a"></i><i class="ring ring-b"></i><i class="ring ring-c"></i>
      </div>
      <div class="gacha-lr-cinematic-flash"></div>
      <div class="gacha-lr-cinematic-particles">${particles}</div>
      <div class="gacha-lr-cinematic-panel">
        <div class="gacha-lr-label">LEGEND RARE</div>
        <div class="gacha-lr-image-wrap"><img class="gacha-lr-image" alt="LRメンバー"></div>
        <div class="gacha-lr-name">三船栞子</div>
        <div class="gacha-lr-get">LR GET!</div>
        <div class="gacha-lr-new" hidden>NEW</div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  async function showLrCinematic(result,session){
    if(session?.skipMode==='all') return;
    const overlay=ensureLrCinematic();
    const image=overlay.querySelector('.gacha-lr-image');
    const name=overlay.querySelector('.gacha-lr-name');
    const badge=overlay.querySelector('.gacha-lr-new');
    const src=result.unit.card;

    image.style.visibility='hidden';
    image.removeAttribute('src');
    await preloadGachaImage(src);
    if(session?.skipMode==='all') return;

    image.src=src;
    image.alt=result.unit.name;
    name.textContent=String(result.unit.name).replace(/【[^】]+】$/u,'');
    badge.hidden=!result.isNew;
    image.style.visibility='visible';

    overlay.hidden=false;
    overlay.classList.remove('is-leaving');
    void overlay.offsetWidth;
    requestAnimationFrame(()=>overlay.classList.add('is-active'));
    await pullSleep(2750,session);
    if(session?.skipMode!=='all'){
      overlay.classList.add('is-leaving');
      await pullSleep(420,session);
    }
    overlay.classList.remove('is-active','is-leaving');
    overlay.hidden=true;
    image.style.visibility='hidden';
  }

  async function revealSlot(slot,result,session){
    if(session?.skipMode==='all'){
      slot.classList.add('is-open');
      return;
    }
    if(result.rarity==='LR'){
      slot.classList.add('is-lr-pre');
      await pullSleep(520,session);
      if(session?.skipMode==='all'){slot.classList.add('is-open');slot.classList.remove('is-lr-pre');return;}
      slot.classList.add('is-lr-burst');
      await pullSleep(360,session);
      slot.classList.add('is-open');
      await pullSleep(260,session);
      slot.classList.remove('is-lr-pre','is-lr-burst','is-ready');
      await showLrCinematic(result,session);
    }else if(result.rarity==='UR'){
      slot.classList.add('is-ur-pre');
      await pullSleep(480,session);
      if(session?.skipMode==='all'){slot.classList.add('is-open');slot.classList.remove('is-ur-pre');return;}
      slot.classList.add('is-ur-burst');
      await pullSleep(260,session);
      slot.classList.add('is-open');
      await pullSleep(360,session);
      slot.classList.remove('is-ur-pre','is-ur-burst','is-lr-pre','is-lr-burst','is-ready');
      await showUrSpotlight(result,session);
    }else{
      if(session?.skipMode==='normal'){
        slot.classList.add('is-open');
        return;
      }
      slot.classList.add('is-ready');
      await pullSleep(55,session,{skipNormal:true});
      slot.classList.add('is-open');
      await pullSleep(75,session,{skipNormal:true});
      slot.classList.remove('is-ready');
    }
  }

  async function runPull(count=PULL_COUNT){
    const screen=ensureScreen();
    if(screen.classList.contains('is-pulling')) return;
    const nPool=window.GACHA_N_POOL||[];
    const urPool=window.GACHA_UR_POOL||[];
    const lrPool=window.GACHA_LR_POOL||[];
    if(!nPool.length||!urPool.length||!lrPool.length){
      alert('勧誘データを読み込めませんでした。');
      return;
    }

    const cfg=getGachaSettings();
    const pullButtons=[
      screen.querySelector('#gachaPullOneBtn'),
      screen.querySelector('#gachaPullTenBtn'),
      screen.querySelector('#gachaPullHundredBtn')
    ].filter(Boolean);
    const skipActions=screen.querySelector('#gachaSkipActions');
    const session={skipMode:count===100?'normal':'none',count};
    activePullSession=session;

    screen.querySelector('#gachaLobby').hidden=true;
    screen.querySelector('#gachaRevealStage').hidden=false;
    const grid=screen.querySelector('#gachaEnvelopeGrid');
    const omen=screen.querySelector('#gachaOmen');
    updateRateDisplay(screen);
    screen.classList.add('is-pulling');
    pullButtons.forEach(b=>b.disabled=true);
    if(skipActions) skipActions.hidden=count===1;
    grid.innerHTML='';
    grid.classList.toggle('is-single',count===1);
    grid.classList.toggle('is-hundred',count===100);
    omen.textContent='';
    screen.classList.remove('has-ur-omen');

    const owned=typeof window.loadGachaOwned==='function'?window.loadGachaOwned():new Set();
    const results=[];
    for(let i=0;i<count;i++){
      const result=pullOne(i,cfg);
      result.isNew=(result.rarity==='UR'||result.rarity==='LR')&&!owned.has(result.unit.id);
      if(result.rarity==='UR'||result.rarity==='LR') owned.add(result.unit.id);
      results.push(result);
    }
    if(cfg.saveOwned&&typeof window.saveGachaOwned==='function') window.saveGachaOwned(owned);

    const hasLR=results.some(result=>result.rarity==='LR');
    if(hasLR&&session.skipMode!=='all'){
      await showLrPrelude(session);
    }

    results.forEach((result,index)=>grid.appendChild(makeEnvelope(result,index)));
    const slots=[...grid.querySelectorAll('.gacha-envelope-slot')];
    omen.textContent='開封中…';
    await pullSleep(120,session,{skipNormal:true});

    for(let i=0;i<slots.length;i++){
      if(session.skipMode==='all'){
        revealAllSlots(slots.slice(i));
        break;
      }
      const result=results[i];
      if(session.skipMode==='normal'&&result.rarity==='N'){
        slots[i].classList.add('is-open');
        continue;
      }
      omen.textContent=result.rarity==='LR'?'LEGEND RARE…！':result.rarity==='UR'?'UR演出！':`${i+1} / ${count}`;
      await revealSlot(slots[i],result,session);
    }

    if(session.skipMode==='all') revealAllSlots(slots);
    const newCount=results.filter(r=>r.isNew).length;
    const urCount=results.filter(r=>r.rarity==='UR').length;
    const lrCount=results.filter(r=>r.rarity==='LR').length;
    const tempNote=cfg.testMode&&!cfg.saveOwned?' ／ 部室未登録':'';
    const rareParts=[];
    if(lrCount) rareParts.push(`LR ${lrCount}枚`);
    if(urCount) rareParts.push(`UR ${urCount}枚`);
    omen.textContent=rareParts.length?`${rareParts.join(' ／ ')}${newCount?` ／ 新規 ${newCount}人`:''}${tempNote}`:'勧誘結果';
    pullButtons.forEach(b=>b.disabled=false);
    if(skipActions) skipActions.hidden=true;
    screen.classList.remove('is-pulling');
    activePullSession=null;
  }
  async function runTenPull(){return runPull(10);}

  window.openGachaScreen=function(){
    const screen=ensureScreen();
    hideOtherScreens();
    updateRateDisplay(screen);
    screen.hidden=false;
    startGachaBgm();
    screen.querySelector('#gachaPullTenBtn')?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'auto'});
  };

  window.addEventListener('rhythmGameAdminSettingsChanged',()=>updateRateDisplay(document.getElementById('gachaScreen')));
  window.startGachaBgm=startGachaBgm;
  window.stopGachaBgm=stopGachaBgm;

  // 部室は初期N＋獲得済みUR/LRだけを表示する。
  function installOwnedRoomFilter(){
    if(typeof window.getRoomCharacters!=='function') return;
    const replacement=function(){
      const grid=document.getElementById('characterGrid');
      const available=window.getRoomCharacters();
      if(!grid||!Array.isArray(available)||!available.length) return;
      const saved=typeof getSavedLaneCharacters==='function'?getSavedLaneCharacters():Array.from({length:9},()=> 'default');
      const availableIds=new Set(available.map(c=>c.id));
      const current=saved.map(id=>availableIds.has(id)?id:'default');
      grid.innerHTML='';
      current.forEach((id,i)=>{
        const c=available.find(item=>item.id===id)||available.find(item=>item.id==='default')||available[0];
        const card=document.createElement('div');
        card.className='lane-character-card';
        const title=document.createElement('div');
        title.className='lane-character-title';
        title.textContent=`レーン ${i+1}`;
        const img=document.createElement('img');
        img.className='lane-character-preview';
        img.alt=`レーン ${i+1} キャラ`;
        img.src=c?.icon||'icon-192.png';
        img.onerror=()=>{img.src='icon-192.png';};
        const select=document.createElement('select');
        select.className='lane-character-select';
        select.dataset.lane=String(i);
        available.forEach(item=>{
          const option=document.createElement('option');
          option.value=item.id;
          option.textContent=item.name;
          option.selected=item.id===id;
          select.appendChild(option);
        });
        select.addEventListener('change',()=>{
          const selected=available.find(item=>item.id===select.value);
          img.src=selected?.icon||'icon-192.png';
        });
        card.append(title,img,select);
        grid.appendChild(card);
      });
      const status=document.getElementById('characterSaveStatus');
      if(status){
        const urOwned=available.filter(c=>c.rarity==='UR').length;
        const lrOwned=available.filter(c=>c.rarity==='LR').length;
        status.textContent=`音符ロリータは初期加入。UR/LRは勧誘で獲得すると追加されます。（LR ${lrOwned}/1・UR ${urOwned}/12）`;
      }
    };
    window.renderCharacterSelectors=replacement;
    try{renderCharacterSelectors=replacement;}catch(_){}
  }

  ensureScreen();
  ensureUrSpotlight();
  ensureLrPrelude();
  ensureLrCinematic();
  installOwnedRoomFilter();
})();
