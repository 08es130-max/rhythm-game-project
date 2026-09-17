// Ver.0.8.20: Shioriko home art, secret expressions, and room-selectable art sets.
(function(){
  const VERSION=window.APP_VERSION || '0.8.20';
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const HOME_ART_KEY='rhythmGame.shiorikoHomeArt.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const CURRENT_ART={
    normal:`assets/home-characters/shioriko/normal.png?v=${VERSION}-homeart4`,
    dere:`assets/home-characters/shioriko/dere.png?v=${VERSION}-pngset1`,
    yandere:`assets/home-characters/shioriko/yandere.png?v=${VERSION}-pngset1`,
    scold:`assets/home-characters/shioriko/scold.png?v=${VERSION}-pngset1`,
    drunk:`assets/home-characters/shioriko/drunk.png?v=${VERSION}-pngset1`,
    clumsy:`assets/home-characters/shioriko/clumsy.png?v=${VERSION}-pngset1`,
    casual:`assets/home-characters/shioriko/casual.png?v=${VERSION}-pngset1`
  };
  // Keep stored IDs, including the historical new -> current alias below.
  // Add verified new expressions to latest after the normal-art review.
  // Missing expressions explicitly fall back to the current generation.
  const ART_SETS={
    current:CURRENT_ART,
    latest:{normal:`assets/home-characters/shioriko/candidates/stage-v085.webp?v=${VERSION}-homeart6`},
    legacy:{normal:`assets/home-characters/shioriko/normal-v0814.png?v=${VERSION}-homeart4`}
  };
  const MENU={
    homeLiveBtn:`assets/home-ui/live.png?v=${VERSION}`,
    homeSettingsBtn:`assets/home-ui/settings.png?v=${VERSION}`,
    homeCharactersBtn:`assets/home-ui/room.png?v=${VERSION}`,
    homeGachaBtn:`assets/home-ui/gacha.png?v=${VERSION}`
  };

  const card=document.querySelector('.home-character-card');
  const original=card?.querySelector('.home-character-img');
  if(!card||!original) return;

  let cutout=card.querySelector('.home-character-cutout-v084');
  if(!cutout){
    cutout=document.createElement('img');
    cutout.className='home-character-cutout-v084';
    cutout.alt='三船栞子';
    cutout.decoding='async';
    cutout.draggable=false;
    card.appendChild(cutout);
  }

  const fallbackToOriginal=()=>{
    cutout.hidden=true;
    original.classList.remove('home-original-hidden-v084');
  };

  cutout.addEventListener('load',()=>{
    cutout.hidden=false;
    original.classList.add('home-original-hidden-v084');
  });
  cutout.addEventListener('error',fallbackToOriginal);

  const getMode=()=>{
    const m=document.documentElement.dataset.shioMode || localStorage.getItem(MODE_KEY) || 'normal';
    return VALID.includes(m)?m:'normal';
  };
  const normalizeHomeArt=(value)=>{
    if(value==='latest'||value==='current'||value==='legacy') return value;
    if(value==='old') return 'legacy';
    if(value==='new') return 'current';
    return 'current';
  };
  const getHomeArt=()=>normalizeHomeArt(localStorage.getItem(HOME_ART_KEY));
  const getArtSrc=(mode)=>ART_SETS[getHomeArt()][mode] || ART_SETS.current[mode];

  const applyMode=(mode)=>{
    const m=VALID.includes(mode)?mode:'normal';
    document.documentElement.dataset.shioMode=m;
    cutout.dataset.artSet=getHomeArt();
    cutout.dataset.mode=m;
    const src=getArtSrc(m);
    if(!src){fallbackToOriginal();return;}
    if(cutout.src!==new URL(src,location.href).href){
      cutout.hidden=true;
      cutout.src=src;
    }
  };

  function installHomeArtSelector(){
    const screen=document.getElementById('characterScreen');
    const panel=screen?.querySelector('.screen-panel');
    if(!panel||document.getElementById('homeArtSelector'))return;

    const style=document.createElement('style');
    style.id='homeArtSelectorStyle';
    style.textContent=`
      /* The full-height new normal has no top padding: lower only this art. */
      @media (orientation:landscape){.home-screen .home-character-cutout-v084[data-art-set="latest"][data-mode="normal"]{bottom:-101px!important}}
      @media (orientation:landscape) and (max-height:620px){.home-screen .home-character-cutout-v084[data-art-set="latest"][data-mode="normal"]{bottom:-105px!important}}
      .home-art-selector{margin:0 0 16px;padding:14px;border:1px solid #374151;border-radius:14px;background:#111827}
      .home-art-selector h2{margin:0 0 5px;font-size:17px}
      .home-art-selector p{margin:0 0 12px;color:#94a3b8;font-size:12px;line-height:1.5}
      .home-art-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:760px}
      .home-art-option{appearance:none;border:2px solid #374151;border-radius:14px;background:#0b1220;padding:8px;color:#f8fafc;cursor:pointer;text-align:left;transition:border-color .12s,box-shadow .12s,transform .12s}
      .home-art-option:active{transform:scale(.985)}
      .home-art-option.is-selected{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.18)}
      .home-art-option img{display:block;width:100%;height:140px;object-fit:contain;border-radius:10px;background:linear-gradient(180deg,#101d34,#0a1324)}
      .home-art-option strong{display:block;margin-top:7px;font-size:13px;text-align:center}
      .home-art-current{margin-top:9px;color:#7dd3fc;font-size:12px;font-weight:700}
      @media (orientation:landscape) and (pointer:coarse){.home-art-selector{padding:9px;margin-bottom:10px}.home-art-selector h2{font-size:14px}.home-art-selector p{margin-bottom:7px;font-size:10px}.home-art-options{max-width:520px;gap:8px}.home-art-option{padding:5px}.home-art-option img{height:78px}.home-art-option strong{font-size:11px;margin-top:4px}.home-art-current{margin-top:5px;font-size:10px}}
    `;
    document.head.appendChild(style);

    const wrap=document.createElement('section');
    wrap.id='homeArtSelector';
    wrap.className='home-art-selector';
    wrap.innerHTML=`<h2>ホーム立ち絵</h2><p>新セット・現在のセット・Ver.0.8.14の立ち絵を残して選べます。今回は新セットの通常立ち絵のみ先行実装しています。</p><div class="home-art-options"></div><div class="home-art-current"></div>`;
    const options=wrap.querySelector('.home-art-options');
    const status=wrap.querySelector('.home-art-current');
    const defs=[
      {id:'latest',label:'新立ち絵セット（通常確認用）',src:ART_SETS.latest.normal},
      {id:'current',label:'現在の立ち絵セット',src:ART_SETS.current.normal},
      {id:'legacy',label:'以前の立ち絵（Ver.0.8.14）',src:ART_SETS.legacy.normal}
    ];
    const labelFor=(id)=>defs.find(def=>def.id===id)?.label||'現在の立ち絵';
    const refresh=()=>{
      const selected=getHomeArt();
      wrap.querySelectorAll('.home-art-option').forEach(btn=>{
        btn.classList.toggle('is-selected',btn.dataset.art===selected);
        btn.setAttribute('aria-pressed',String(btn.dataset.art===selected));
      });
      status.textContent=`現在：${labelFor(selected)}`;
    };
    defs.forEach(def=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='home-art-option';
      btn.dataset.art=def.id;
      btn.setAttribute('aria-label',`${def.label}をホーム立ち絵に設定`);
      const img=document.createElement('img');
      img.src=def.src;
      img.alt=def.label;
      img.decoding='async';
      const label=document.createElement('strong');
      label.textContent=def.label;
      btn.append(img,label);
      btn.addEventListener('click',()=>{
        localStorage.setItem(HOME_ART_KEY,def.id);
        refresh();
        window.dispatchEvent(new CustomEvent('rhythmGameShiorikoHomeArtChanged',{detail:{art:def.id}}));
      });
      options.appendChild(btn);
    });
    panel.prepend(wrap);
    refresh();
    window.addEventListener('rhythmGameShiorikoHomeArtChanged',refresh);
    window.addEventListener('storage',(e)=>{if(e.key===HOME_ART_KEY||e.key===null)refresh();});
  }

  applyMode(getMode());
  installHomeArtSelector();

  window.addEventListener('rhythmGameShiorikoModeChanged',(e)=>applyMode(e.detail?.mode||getMode()));
  window.addEventListener('rhythmGameShiorikoDialogueExpression',(e)=>applyMode(e.detail?.mode||getMode()));
  window.addEventListener('rhythmGameShiorikoHomeArtChanged',()=>applyMode(getMode()));
  window.addEventListener('storage',(e)=>{
    if(e.key===MODE_KEY) applyMode(e.newValue||'normal');
    if(e.key===HOME_ART_KEY) applyMode(getMode());
    if(e.key===null) applyMode('normal');
  });
  const restoreHomeArt=()=>applyMode(localStorage.getItem(MODE_KEY)||'normal');
  const home=document.getElementById('homeScreen');
  if(home) new MutationObserver(()=>{if(!home.hidden)restoreHomeArt();})
    .observe(home,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('pageshow',restoreHomeArt);

  Object.entries(MENU).forEach(([id,src])=>{
    const el=document.getElementById(id);
    if(el && el.tagName==='IMG') el.src=src;
  });
})();
