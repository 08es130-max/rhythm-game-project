// Ver.0.8.15: use complete transparent standing-art assets on the home screen.
(function(){
  const VERSION=window.APP_VERSION || '0.8.15';
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const ART=Object.fromEntries(VALID.map(mode=>[mode,`assets/home-characters/shioriko/${mode}.${mode==='normal'?'png':'webp'}?v=${VERSION}`]));
  const MENU={
    homeLiveBtn:`assets/home-ui/live.png?v=${VERSION}`,
    homeSettingsBtn:`assets/home-ui/settings.png?v=${VERSION}`,
    homeCharactersBtn:`assets/home-ui/room.png?v=${VERSION}`,
    homeGachaBtn:`assets/home-ui/gacha.png?v=${VERSION}`
  };

  const card=document.querySelector('.home-character-card');
  const original=card?.querySelector('.home-character-img');
  if(!card||!original)return;

  let cutout=card.querySelector('.home-character-cutout-v084');
  if(!cutout){
    cutout=document.createElement('img');
    cutout.className='home-character-cutout-v084';
    cutout.alt='ホームキャラクター';
    cutout.decoding='async';
    cutout.draggable=false;
    original.insertAdjacentElement('afterend',cutout);
  }

  function isShioriko(){
    const id=String(card.dataset.characterId||localStorage.getItem('rhythmGame.homeCharacter')||'default');
    if(id==='default'||id.includes('shioriko'))return true;
    const unit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===id);
    return String(unit?.name||'').replace(/【[^】]+】$/u,'')==='三船栞子';
  }

  function activeMode(){
    const dataMode=String(card.dataset.shioMode||'');
    if(VALID.includes(dataMode))return dataMode;
    const stored=String(localStorage.getItem(MODE_KEY)||'normal');
    return VALID.includes(stored)?stored:'normal';
  }

  function applyCharacter(){
    if(!isShioriko()){
      original.classList.remove('home-original-hidden-v084');
      cutout.hidden=true;
      return;
    }
    const mode=activeMode();
    const src=ART[mode]||ART.normal;
    original.classList.add('home-original-hidden-v084');
    cutout.hidden=false;
    if(cutout.getAttribute('src')!==src)cutout.setAttribute('src',src);
    cutout.dataset.mode=mode;
  }

  function applyMenu(){
    Object.entries(MENU).forEach(([id,src])=>{
      const img=document.getElementById(id)?.querySelector('.home-menu-art');
      if(!img)return;
      if(img.getAttribute('src')!==src)img.setAttribute('src',src);
    });
  }

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='栞子の通常立ち絵と隠しモード全7種を、新しい左右補完済み立ち絵へ差し替えました。';
  }

  new MutationObserver(()=>applyCharacter()).observe(card,{attributes:true,attributeFilter:['data-character-id','data-shio-mode']});
  new MutationObserver(()=>{applyMenu();}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('rhythmGameShiorikoModeChanged',()=>requestAnimationFrame(applyCharacter));
  window.addEventListener('rhythmGameShiorikoDialogueExpression',()=>requestAnimationFrame(applyCharacter));

  Object.values(ART).forEach(src=>{const img=new Image();img.src=src;});
  Object.values(MENU).forEach(src=>{const img=new Image();img.src=src;});

  applyCharacter();
  applyMenu();
  syncVersion();
  setTimeout(()=>{applyCharacter();applyMenu();syncVersion();},250);
})();
