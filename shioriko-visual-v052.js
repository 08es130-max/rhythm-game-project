// Ver.0.5.8: full-image expression switching with original standing art restoration.
(function(){
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const v=window.APP_VERSION||'0.5.8';
  const EXPR={
    dere:`assets/shioriko-expressions/dere-v058.png?v=${v}`,
    yandere:`assets/shioriko-expressions/yandere-v058.png?v=${v}`,
    scold:`assets/shioriko-expressions/scold-v058.png?v=${v}`,
    drunk:`assets/shioriko-expressions/drunk-v058.png?v=${v}`,
    clumsy:`assets/shioriko-expressions/clumsy-v058.png?v=${v}`,
    casual:`assets/shioriko-expressions/casual-v058.png?v=${v}`
  };

  const card=document.querySelector('.home-character-card');
  const image=card?.querySelector('.home-character-img');
  if(!card||!image) return;

  // Inject the latest clumsy reaction style here as well, so iPhone/PWA CSS cache
  // cannot keep the old circular "!" marker alive.
  if(!document.getElementById('shio-clumsy-marker-v058')){
    const style=document.createElement('style');
    style.id='shio-clumsy-marker-v058';
    style.textContent=`
      .home-character-card[data-shio-mode="clumsy"].shio-react::before{
        content:'…!?' !important;
        position:absolute !important;
        z-index:6 !important;
        left:20% !important;
        top:10% !important;
        min-width:54px !important;
        width:auto !important;
        height:32px !important;
        padding:0 10px !important;
        border-radius:16px 16px 16px 6px !important;
        display:grid !important;
        place-items:center !important;
        background:rgba(255,255,255,.96) !important;
        color:#0f6ea8 !important;
        border:2px solid #7dd3fc !important;
        font-weight:900 !important;
        font-size:15px !important;
        letter-spacing:-.5px !important;
        box-shadow:0 6px 16px rgba(14,165,233,.28),0 0 0 2px rgba(255,255,255,.45) !important;
        pointer-events:none !important;
        animation:shioClumsyBubbleV058 .9s ease-out both !important;
      }
      @keyframes shioClumsyBubbleV058{
        0%{opacity:0;transform:translateY(5px) scale(.82)}
        28%{opacity:1;transform:translateY(0) scale(1.04)}
        72%{opacity:1;transform:translateY(-3px) scale(1)}
        100%{opacity:0;transform:translateY(-12px) scale(.96)}
      }
    `;
    document.head.appendChild(style);
  }

  let normalSrc='';
  let dialogueExpression='normal';
  let internalSwap=false;
  let reactTimer=0;
  let modeTimer=0;

  // Remove every remnant of the old overlay system.
  card.querySelectorAll('.shio-expression-overlay').forEach(el=>el.remove());

  function isExpressionSrc(src){
    return String(src||'').includes('assets/shioriko-expressions/');
  }

  function rememberNormalSrc(){
    const src=image.getAttribute('src')||'';
    if(src&&!isExpressionSrc(src)) normalSrc=src;
  }

  rememberNormalSrc();

  function currentMode(){
    const value=localStorage.getItem(MODE_KEY)||'normal';
    return VALID.includes(value)?value:'normal';
  }

  function effectiveMode(){
    const mode=currentMode();
    return mode==='normal'?dialogueExpression:mode;
  }

  function isShioriko(){
    const id=String(card.dataset.characterId||localStorage.getItem('rhythmGame.homeCharacter')||'default');
    if(id==='default'||id.includes('shioriko')) return true;
    const unit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===id);
    return String(unit?.name||'').replace(/【[^】]+】$/u,'')==='三船栞子';
  }

  function setSrc(src){
    if(!src||image.getAttribute('src')===src) return;
    internalSwap=true;
    image.setAttribute('src',src);
    requestAnimationFrame(()=>{internalSwap=false;});
  }

  function applyExpression(mode){
    if(!isShioriko()){
      dialogueExpression='normal';
      return;
    }

    const current=image.getAttribute('src')||'';
    if(!isExpressionSrc(current)) normalSrc=current||normalSrc;

    if(mode!=='normal'&&EXPR[mode]){
      setSrc(EXPR[mode]);
    }else if(normalSrc){
      setSrc(normalSrc);
    }
  }

  function applyMode(animate=false){
    const mode=isShioriko()?effectiveMode():'normal';
    card.dataset.shioMode=mode;
    applyExpression(mode);
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
    if(!isShioriko()||effectiveMode()!=='dere') return;
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

  card.addEventListener('pointerdown',e=>{
    applyMode(false);
    spawnTapHearts(e);
    react();
  },{passive:true});

  // Secret-mode dialogue code already decides when normal mode should borrow dere/clumsy.
  window.addEventListener('rhythmGameShiorikoDialogueExpression',e=>{
    const requested=String(e?.detail?.mode||'normal');
    dialogueExpression=VALID.includes(requested)?requested:'normal';
    if(currentMode()!=='normal') dialogueExpression='normal';
    applyMode(true);
  });

  window.addEventListener('rhythmGameShiorikoModeChanged',()=>{
    dialogueExpression='normal';
    applyMode(true);
  });

  const originalSet=window.setShiorikoSecretMode;
  if(typeof originalSet==='function'){
    window.setShiorikoSecretMode=function(mode){
      dialogueExpression='normal';
      const result=originalSet(mode);
      setTimeout(()=>applyMode(true),0);
      return result;
    };
  }

  // Home-character code can replace the base standing art. Remember that new base art,
  // then reapply the selected expression if a secret mode is active.
  const observer=new MutationObserver(records=>{
    if(internalSwap) return;
    const srcChanged=records.some(r=>r.target===image&&r.attributeName==='src');
    if(srcChanged){
      const src=image.getAttribute('src')||'';
      if(src&&!isExpressionSrc(src)) normalSrc=src;
    }
    setTimeout(()=>applyMode(false),0);
  });
  observer.observe(card,{attributes:true,attributeFilter:['data-character-id']});
  observer.observe(image,{attributes:true,attributeFilter:['src']});

  Object.values(EXPR).forEach(src=>{const preload=new Image();preload.src=src;});
  applyMode(false);
})();
