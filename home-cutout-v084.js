// Ver.0.8.20: Shioriko home art, secret expressions, and room-selectable art sets.
(function(){
  const VERSION=window.APP_VERSION || '0.8.20';
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const HOME_ART_KEY='rhythmGame.shiorikoHomeArt.v1';
  const LR_HOME_CHARACTER_KEY='rhythmGame.lrHomeCharacter.v1';
  const LR_ID='lr-shioriko-eternal-rose';
  const LR_AYUMU_ID='lr-ayumu-flower-garden';
  const LR_AYUMU_HOME=`assets/lr/lr-ayumu-home.webp?v=${VERSION}-lrhome1`;
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const PREVIOUS_ART={
    normal:`assets/home-characters/shioriko/normal.png?v=${VERSION}-homeart4`,
    dere:`assets/home-characters/shioriko/dere.png?v=${VERSION}-pngset1`,
    yandere:`assets/home-characters/shioriko/yandere.png?v=${VERSION}-pngset1`,
    scold:`assets/home-characters/shioriko/scold.png?v=${VERSION}-pngset1`,
    drunk:`assets/home-characters/shioriko/drunk.png?v=${VERSION}-pngset1`,
    clumsy:`assets/home-characters/shioriko/clumsy.png?v=${VERSION}-pngset1`,
    casual:`assets/home-characters/shioriko/casual.png?v=${VERSION}-pngset1`
  };
  // Classic keeps the historical normal and its existing expression fallback.
  const LR_HOME=`assets/lr/shioriko-lr-home.webp?v=${VERSION}-lrhome1`;
  const LR_HOME_SCENE=window.LR_HOME_SCENE_ASSET||`assets/lr/shioriko-lr-home-scene.webp?v=${VERSION}-lrhomebg5`;
  const ART_SETS={
    stage:Object.fromEntries(VALID.map(mode=>[
      mode,`assets/home-characters/shioriko/new/${mode}.png?v=${VERSION}-${mode==='normal'?'homeart9':'homeart10'}`
    ])),
    classic:{...PREVIOUS_ART,normal:`assets/home-characters/shioriko/normal-v0814.png?v=${VERSION}-homeart4`},
    lr:Object.fromEntries(VALID.map(mode=>[mode,LR_HOME]))
  };
  const MENU={
    homeLiveBtn:`assets/home-ui/live.png?v=${VERSION}`,
    homeSettingsBtn:`assets/home-ui/settings.png?v=${VERSION}`,
    homeCharactersBtn:`assets/home-ui/room.png?v=${VERSION}`,
    homeGachaBtn:`assets/home-ui/gacha.png?v=${VERSION}`
  };

  const home=document.getElementById('homeScreen');
  const card=document.querySelector('.home-character-card');
  const original=card?.querySelector('.home-character-img');
  if(!home||!card||!original) return;

  let lrScene=home.querySelector('.home-lr-scene-v096');
  if(!lrScene){
    lrScene=document.createElement('img');
    lrScene.className='home-lr-scene-v096';
    lrScene.alt='';
    lrScene.decoding='async';
    lrScene.draggable=false;
    lrScene.hidden=true;
    home.prepend(lrScene);
  }

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
    if(home.classList.contains('is-lr-home-scene-v096')){
      cutout.hidden=true;
      original.classList.add('home-original-hidden-v084');
      return;
    }
    cutout.hidden=true;
    original.classList.remove('home-original-hidden-v084');
  };

  cutout.addEventListener('load',()=>{
    if(home.classList.contains('is-lr-home-scene-v096')){
      cutout.hidden=true;
      original.classList.add('home-original-hidden-v084');
      return;
    }
    cutout.hidden=false;
    original.classList.add('home-original-hidden-v084');
  });
  cutout.addEventListener('error',fallbackToOriginal);

  const getMode=()=>{
    const m=document.documentElement.dataset.shioMode || localStorage.getItem(MODE_KEY) || 'normal';
    return VALID.includes(m)?m:'normal';
  };
  const isOwned=(id)=>{
    try{
      if(typeof window.loadGachaOwned==='function') return window.loadGachaOwned().has(id);
      const parsed=JSON.parse(localStorage.getItem('rhythmGame.unlockedCharacters.v1')||'[]');
      return Array.isArray(parsed)&&parsed.includes(id);
    }catch(_){return false;}
  };
  const isLrOwned=()=>isOwned(LR_ID)||isOwned(LR_AYUMU_ID);
  const normalizeHomeArt=(value)=>{
    const aliases={stage:'stage',latest:'stage',current:'stage',new:'stage',classic:'classic',old:'classic',legacy:'classic',lr:'lr',legend:'lr'};
    const normalized=Object.prototype.hasOwnProperty.call(aliases,value)?aliases[value]:'stage';
    return normalized==='lr'&&!isLrOwned()?'stage':normalized;
  };
  const getHomeArt=()=>{
    const saved=localStorage.getItem(HOME_ART_KEY);
    const style=normalizeHomeArt(saved);
    if(saved!==null&&saved!==style)localStorage.setItem(HOME_ART_KEY,style);
    return style;
  };
  const getArtSrc=(mode)=>ART_SETS[getHomeArt()][mode];

  const applyMode=(mode)=>{
    const m=VALID.includes(mode)?mode:'normal';
    const art=getHomeArt();
    const useLrScene=art==='lr';
    const lrCharacter=localStorage.getItem(LR_HOME_CHARACTER_KEY)||'shioriko';
    const lrSceneSrc=lrCharacter==='ayumu'&&isOwned(LR_AYUMU_ID)?LR_AYUMU_HOME:LR_HOME_SCENE;
    document.documentElement.dataset.shioMode=m;
    home.classList.toggle('is-lr-home-scene-v096',useLrScene);
    if(useLrScene){
      const sceneUrl=new URL(lrSceneSrc,location.href).href;
      lrScene.onload=()=>{lrScene.hidden=false;};
      lrScene.onerror=()=>{
        lrScene.hidden=true;
        home.classList.remove('is-lr-home-scene-v096');
        original.classList.remove('home-original-hidden-v084');
      };
      if(lrScene.src!==sceneUrl){
        lrScene.hidden=true;
        lrScene.src=lrSceneSrc;
      }else{
        lrScene.hidden=false;
      }
      cutout.hidden=true;
      original.classList.add('home-original-hidden-v084');
      cutout.dataset.artSet=art;
      cutout.dataset.mode=m;
      return;
    }
    lrScene.hidden=true;
    cutout.dataset.artSet=art;
    cutout.dataset.mode=m;
    const src=getArtSrc(m);
    if(!src){fallbackToOriginal();return;}
    if(cutout.src!==new URL(src,location.href).href){
      cutout.hidden=true;
      cutout.src=src;
    }else{
      cutout.hidden=false;
      original.classList.add('home-original-hidden-v084');
    }
  };

  function installHomeArtSelector(){
    const screen=document.getElementById('characterScreen');
    const panel=screen?.querySelector('.screen-panel');
    if(!panel||document.getElementById('homeArtSelector'))return;

    const style=document.createElement('style');
    style.id='homeArtSelectorStyle';
    style.textContent=`
      /* Use the approved normal framing for the entire official set. */
      @media (orientation:landscape){.home-screen .home-character-cutout-v084[data-art-set="stage"]{bottom:-101px!important}}
      @media (orientation:landscape) and (max-height:620px){.home-screen .home-character-cutout-v084[data-art-set="stage"]{bottom:-105px!important}}
      /* LR reward standing uses its own approved full-body framing. */
      @media (orientation:landscape){.home-screen .home-character-cutout-v084[data-art-set="lr"]{width:112%!important;height:126%!important;bottom:-42px!important}}
      @media (orientation:landscape) and (max-height:620px){.home-screen .home-character-cutout-v084[data-art-set="lr"]{width:114%!important;height:128%!important;bottom:-46px!important}}
      /* The final yandere source has more empty space above the head. */
      @media (orientation:landscape){.home-screen .home-character-cutout-v084[data-art-set="stage"][data-mode="yandere"]{bottom:-71px!important}}
      @media (orientation:landscape) and (max-height:620px){.home-screen .home-character-cutout-v084[data-art-set="stage"][data-mode="yandere"]{bottom:-75px!important}}
      .home-art-selector{margin:0 0 16px;padding:14px;border:1px solid #374151;border-radius:14px;background:#111827}
      .home-art-selector h2{margin:0 0 5px;font-size:17px}
      .home-art-selector p{margin:0 0 12px;color:#94a3b8;font-size:12px;line-height:1.5}
      .home-art-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:900px}
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
    wrap.innerHTML=`<h2>ホームスタイル</h2><p>ホームでの衣装スタイルを選べます。</p><div class="home-art-options"></div><div class="home-art-current"></div>`;
    const options=wrap.querySelector('.home-art-options');
    const status=wrap.querySelector('.home-art-current');
    const defs=[
      {id:'stage',label:'ステージスタイル',src:ART_SETS.stage.normal},
      {id:'classic',label:'クラシックスタイル',src:ART_SETS.classic.normal},
      {id:'lr',label:'LEGEND RARE',src:LR_HOME_SCENE,requiresLr:true}
    ];
    const labelFor=(id)=>defs.find(def=>def.id===id)?.label||'ステージスタイル';
    const refresh=()=>{
      const selected=getHomeArt();
      wrap.querySelectorAll('.home-art-option').forEach(btn=>{
        const def=defs.find(x=>x.id===btn.dataset.art);
        const locked=!!def?.requiresLr&&!isLrOwned();
        btn.hidden=locked;
        btn.disabled=locked;
        btn.classList.toggle('is-selected',!locked&&btn.dataset.art===selected);
        btn.setAttribute('aria-pressed',String(!locked&&btn.dataset.art===selected));
      });
      status.textContent=`選択中：${labelFor(selected)}`;
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
        if(def.requiresLr&&!isLrOwned()) return;
        localStorage.setItem(HOME_ART_KEY,def.id);
        refresh();
        window.dispatchEvent(new CustomEvent('rhythmGameShiorikoHomeArtChanged',{detail:{art:def.id}}));
      });
      options.appendChild(btn);
    });
    const lrDef=defs.find(def=>def.id==='lr');
    if(lrDef){
      const lrBtn=[...options.querySelectorAll('.home-art-option')].find(btn=>btn.dataset.art==='lr');
      if(lrBtn){
        lrBtn.querySelector('strong').textContent='LEGEND RARE';
        lrBtn.addEventListener('click',()=>{
          const choices=[];
          if(isOwned(LR_ID))choices.push('shioriko');
          if(isOwned(LR_AYUMU_ID))choices.push('ayumu');
          if(choices.length>1){
            const current=localStorage.getItem(LR_HOME_CHARACTER_KEY)||'shioriko';
            localStorage.setItem(LR_HOME_CHARACTER_KEY,current==='shioriko'?'ayumu':'shioriko');
          }else if(choices.length===1)localStorage.setItem(LR_HOME_CHARACTER_KEY,choices[0]);
          applyMode(getMode());
        });
      }
    }
    panel.prepend(wrap);
    refresh();
    window.addEventListener('rhythmGameShiorikoHomeArtChanged',refresh);
    window.addEventListener('storage',(e)=>{if(e.key===HOME_ART_KEY||e.key==='rhythmGame.unlockedCharacters.v1'||e.key===null)refresh();});
    window.addEventListener('rhythmGameGachaOwnedChanged',()=>{refresh();applyMode(getMode());});
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
  new MutationObserver(()=>{if(!home.hidden)restoreHomeArt();})
    .observe(home,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('pageshow',restoreHomeArt);

  Object.entries(MENU).forEach(([id,src])=>{
    const el=document.getElementById(id);
    const img=el?.tagName==='IMG'?el:el?.querySelector('.home-menu-art');
    if(img) img.src=src;
  });
})();
