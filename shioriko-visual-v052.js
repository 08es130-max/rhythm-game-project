// Ver.0.5.2: subtle portrait atmosphere/reaction effects for Shioriko secret modes.
(function(){
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const card=document.querySelector('.home-character-card');
  const image=card?.querySelector('.home-character-img');
  if(!card||!image) return;

  let reactTimer=0;
  let modeTimer=0;

  function currentMode(){
    const value=localStorage.getItem(MODE_KEY)||'normal';
    return VALID.includes(value)?value:'normal';
  }

  function isShioriko(){
    const id=String(card.dataset.characterId||localStorage.getItem('rhythmGame.homeCharacter')||'default');
    if(id==='default'||id.includes('shioriko')) return true;
    const unit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===id);
    return String(unit?.name||'').replace(/【[^】]+】$/u,'')==='三船栞子';
  }

  function applyMode(animate=false){
    const mode=isShioriko()?currentMode():'normal';
    card.dataset.shioMode=mode;
    if(animate){
      clearTimeout(modeTimer);
      card.classList.remove('shio-mode-change');
      void card.offsetWidth;
      card.classList.add('shio-mode-change');
      modeTimer=setTimeout(()=>card.classList.remove('shio-mode-change'),720);
    }
  }

  function react(){
    if(!isShioriko()) return;
    clearTimeout(reactTimer);
    card.classList.remove('shio-react');
    void card.offsetWidth;
    card.classList.add('shio-react');
    reactTimer=setTimeout(()=>card.classList.remove('shio-react'),950);
  }

  card.addEventListener('pointerdown',()=>{
    applyMode(false);
    react();
  },{passive:true});

  window.addEventListener('rhythmGameShiorikoModeChanged',()=>applyMode(true));
  const originalSet=window.setShiorikoSecretMode;
  if(typeof originalSet==='function'){
    window.setShiorikoSecretMode=function(mode){
      const result=originalSet(mode);
      setTimeout(()=>applyMode(true),0);
      return result;
    };
  }

  const observer=new MutationObserver(()=>applyMode(false));
  observer.observe(card,{attributes:true,attributeFilter:['data-character-id']});

  applyMode(false);
})();