// Ver.0.8.20: use clean official PNG for all Shioriko home art; keep layout unchanged.
(function(){
  const VERSION=window.APP_VERSION || '0.8.20';
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const ART=Object.fromEntries(VALID.map(mode=>[
    mode,
    `assets/home-characters/shioriko/${mode}.png?v=${VERSION}-pngset1`
  ]));
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

  const applyMode=(mode)=>{
    const m=VALID.includes(mode)?mode:'normal';
    document.documentElement.dataset.shioMode=m;
    const src=ART[m];
    if(cutout.src!==new URL(src,location.href).href){
      cutout.hidden=true;
      cutout.src=src;
    }
  };

  applyMode(getMode());

  window.addEventListener('rhythmGameShiorikoModeChanged',(e)=>applyMode(e.detail?.mode||getMode()));
  window.addEventListener('rhythmGameShiorikoDialogueExpression',(e)=>applyMode(e.detail?.mode||getMode()));
  window.addEventListener('storage',(e)=>{ if(e.key===MODE_KEY) applyMode(e.newValue||'normal'); });

  Object.entries(MENU).forEach(([id,src])=>{
    const el=document.getElementById(id);
    if(el && el.tagName==='IMG') el.src=src;
  });
})();
