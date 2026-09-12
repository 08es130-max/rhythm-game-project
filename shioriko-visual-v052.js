// Ver.0.5.5: tap-position heart origin for Shioriko secret modes.
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

  function spawnTapHearts(e){
    if(!isShioriko()||currentMode()!=='dere') return;
    const rect=card.getBoundingClientRect();
    const x=Math.max(8,Math.min(rect.width-8,e.clientX-rect.left));
    const y=Math.max(8,Math.min(rect.height-8,e.clientY-rect.top));
    for(let i=0;i<4;i++){
      const heart=document.createElement('span');
      heart.className='shio-tap-heart';
      heart.textContent='♥';
      heart.style.left=`${x}px`;
      heart.style.top=`${y}px`;
      heart.style.setProperty('--dx',`${(i-1.5)*18}px`);
      heart.style.setProperty('--dy',`${-36-(i%2)*18}px`);
      heart.style.setProperty('--delay',`${i*55}ms`);
      card.appendChild(heart);
      heart.addEventListener('animationend',()=>heart.remove(),{once:true});
    }
  }

  card.addEventListener('pointerdown',(e)=>{
    applyMode(false);
    spawnTapHearts(e);
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
