// Ver.0.5.6: tap-position hearts + secret-mode and dialogue-linked expression switching for Shioriko.
(function(){
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const v=window.APP_VERSION||'0.5.6';
  const EXPR={
    dere:`assets/shioriko-expressions/dere.webp?v=${v}`,
    yandere:`assets/shioriko-expressions/yandere.webp?v=${v}`,
    scold:`assets/shioriko-expressions/scold.webp?v=${v}`,
    drunk:`assets/shioriko-expressions/drunk.webp?v=${v}`,
    clumsy:`assets/shioriko-expressions/clumsy.webp?v=${v}`,
    casual:`assets/shioriko-expressions/casual.webp?v=${v}`
  };
  const card=document.querySelector('.home-character-card');
  const image=card?.querySelector('.home-character-img');
  if(!card||!image) return;

  let reactTimer=0;
  let modeTimer=0;
  let normalSrc='';
  let internalSwap=false;
  let dialogueExpression='normal';

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
  function isExpressionSrc(src){
    const value=String(src||'');
    return value.includes('assets/shioriko-expressions/')||value.startsWith('data:image/webp;base64,');
  }
  function setImageSrc(src){
    if(!src||image.getAttribute('src')===src) return;
    internalSwap=true;
    image.setAttribute('src',src);
    requestAnimationFrame(()=>{internalSwap=false;});
  }
  function applyExpression(mode){
    const current=image.getAttribute('src')||'';
    if(isShioriko()&&mode!=='normal'&&EXPR[mode]){
      if(current&&!isExpressionSrc(current)) normalSrc=current;
      setImageSrc(EXPR[mode]);
    }else if(isExpressionSrc(current)&&normalSrc){
      setImageSrc(normalSrc);
    }else if(current&&!isExpressionSrc(current)) normalSrc=current;
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

  async function loadSupervisedScold(){
    try{
      const urls=Array.from({length:6},(_,i)=>`assets/shioriko-expressions/scold-b64/${String(i).padStart(2,'0')}.txt?v=${v}`);
      const parts=await Promise.all(urls.map(async url=>{
        const response=await fetch(url,{cache:'force-cache'});
        if(!response.ok) throw new Error('scold expression chunk load failed');
        return response.text();
      }));
      const base64=parts.join('').replace(/\s+/g,'');
      if(!base64.startsWith('UklG')) throw new Error('invalid supervised scold image');
      EXPR.scold=`data:image/webp;base64,${base64}`;
      const preload=new Image();
      preload.src=EXPR.scold;
      if(effectiveMode()==='scold') applyMode(false);
    }catch(_){
      // Keep the repository WebP as a safe fallback if any text chunk cannot be loaded.
    }
  }

  const initial=image.getAttribute('src')||'';
  if(initial&&!isExpressionSrc(initial)) normalSrc=initial;

  card.addEventListener('pointerdown',(e)=>{applyMode(false);spawnTapHearts(e);react();},{passive:true});

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

  const observer=new MutationObserver((records)=>{
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

  Object.values(EXPR).forEach(src=>{const p=new Image();p.src=src;});
  loadSupervisedScold();
  applyMode(false);
})();