// Ver.0.8.216: split story/lounge art so only the embedded label moves upward.
(function(){
  'use strict';

  const IDS=[
    ['homeLiveBtn','ライブ','live'],
    ['homeStoryBtn','ストーリー','story'],
    ['homeSettingsBtn','設定','settings'],
    ['homeCharactersBtn','部室','room'],
    ['homeInteractionBtn','ラウンジ','lounge'],
    ['homeGachaBtn','勧誘','gacha']
  ];
  const ASSET_BASE='assets/ui/home-v0855/';

  function ensureStyle(){
    if(document.getElementById('homeMenuUnifiedV0854Style')) return;
    const style=document.createElement('style');
    style.id='homeMenuUnifiedV0854Style';
    style.textContent=`
      #homeScreen .home-menu{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        grid-template-rows:repeat(2,minmax(0,1fr))!important;
        gap:10px!important;
        align-content:stretch!important;
        align-items:center!important;
        justify-items:center!important;
        min-height:0!important;
      }
      #homeScreen .home-menu>.home-menu-btn{
        grid-column:auto!important;
        grid-row:auto!important;
        box-sizing:border-box!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        min-width:0!important;
        min-height:0!important;
        aspect-ratio:1/1!important;
        padding:0!important;
        margin:0!important;
        border:0!important;
        border-radius:16px!important;
        background:transparent!important;
        box-shadow:none!important;
        overflow:visible!important;
        line-height:0!important;
        text-align:center!important;
        position:relative!important;
      }
      #homeScreen .home-menu>.home-menu-btn>.home-menu-art{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
        object-position:center!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        filter:drop-shadow(0 7px 13px rgba(0,0,0,.23))!important;
        image-rendering:auto!important;
        pointer-events:none!important;
      }
      /* Ver.0.8.216: story/lounge PNGs include their labels.
         Split each image into an upper-art layer and a lower-label layer so the label itself,
         not the whole icon, can be tucked upward toward the illustration. */
      #homeScreen #homeStoryBtn>.home-menu-art-base,
      #homeScreen #homeInteractionBtn>.home-menu-art-base{
        position:absolute!important;
        inset:0!important;
        filter:drop-shadow(0 7px 13px rgba(0,0,0,.23))!important;
      }
      #homeScreen #homeStoryBtn>.home-menu-art-base{
        clip-path:inset(0 0 34% 0)!important;
      }
      #homeScreen #homeInteractionBtn>.home-menu-art-base{
        clip-path:inset(0 0 35% 0)!important;
      }
      #homeScreen #homeStoryBtn>.home-menu-art-label,
      #homeScreen #homeInteractionBtn>.home-menu-art-label{
        position:absolute!important;
        inset:0!important;
        z-index:2!important;
        transform-origin:center center!important;
        filter:drop-shadow(0 4px 8px rgba(0,0,0,.17))!important;
      }
      #homeScreen #homeStoryBtn>.home-menu-art-label{
        clip-path:inset(62% 2% 2% 2%)!important;
        transform:translateY(-8%) scale(1.015)!important;
      }
      #homeScreen #homeInteractionBtn>.home-menu-art-label{
        clip-path:inset(63% 2% 2% 2%)!important;
        transform:translateY(-9%) scale(1.02)!important;
      }
      #homeScreen .home-menu-interaction{
        padding:0!important;
        min-height:0!important;
        text-align:center!important;
      }
      #homeScreen .home-menu-interaction .lounge-home-label{display:none!important}
      #homeScreen .home-menu-interaction .lounge-home-icon{display:none!important}
      @media (orientation:landscape) and (pointer:coarse){
        #homeScreen .home-menu{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          grid-template-rows:repeat(2,minmax(0,1fr))!important;
          gap:7px!important;
        }
        #homeScreen .home-menu>.home-menu-btn{border-radius:13px!important}
      }
      @media (max-width:800px) and (orientation:portrait){
        #homeScreen .home-menu{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          grid-template-rows:repeat(3,minmax(0,1fr))!important;
          gap:9px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function convertLoungeToFullArt(){
    const btn=document.getElementById('homeInteractionBtn');
    if(!btn) return false;
    if(btn.querySelector('.home-menu-art')) return true;

    const source=btn.querySelector('.lounge-home-icon');
    const src=source?.currentSrc || source?.src;
    if(!src) return false;

    const img=document.createElement('img');
    img.className='home-menu-art lounge-home-art';
    img.alt='ラウンジ';
    img.decoding='async';
    img.draggable=false;
    img.src=src;
    btn.replaceChildren(img);
    btn.title='ラウンジ';
    btn.setAttribute('aria-label','ラウンジ');
    return true;
  }

  function installSplitLabel(btn,key,img){
    if(key!=='story' && key!=='lounge') return;
    img.classList.add('home-menu-art-base');
    let label=btn.querySelector('.home-menu-art-label');
    if(!label){
      label=img.cloneNode(false);
      label.className='home-menu-art home-menu-art-label';
      label.removeAttribute('id');
      label.alt='';
      label.setAttribute('aria-hidden','true');
      label.dataset.v0855Source='1';
      btn.appendChild(label);
    }
    if(label.src!==img.src) label.src=img.src;
  }

  function normalize(){
    const menu=document.querySelector('#homeScreen .home-menu');
    if(!menu) return false;

    convertLoungeToFullArt();

    // Keep only the six actual buttons as grid children. Legacy literal text nodes
    // (for example a written "\\n") otherwise consume a CSS-grid cell on iPhone.
    [...menu.childNodes].forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.remove();});

    const buttons=[];
    for(const [id,label,key] of IDS){
      const btn=document.getElementById(id);
      if(!btn) return false;
      btn.title=label;
      btn.setAttribute('aria-label',label);
      let img=btn.querySelector('.home-menu-art');
      if(!img){
        img=document.createElement('img');
        img.className='home-menu-art';
        btn.replaceChildren(img);
      }
      if(img){
        img.alt=label;
        img.decoding='async';
        img.draggable=false;
        const oldSrc=img.currentSrc||img.src;
        if(!img.dataset.v0855Source){
          img.dataset.v0855Source='1';
          img.onerror=()=>{
            if(img.dataset.v0855Fallback==='1') return;
            img.dataset.v0855Fallback='1';
            if(oldSrc) img.src=oldSrc;
          };
        }
        const primary=`${ASSET_BASE}${key}.png?v=${window.APP_VERSION||'0.8.128'}-icons2`;
        if(img.dataset.v0855Fallback!=='1' && !img.src.includes(`/home-v0855/${key}.png`)){
          img.src=primary;
        }
        installSplitLabel(btn,key,img);
      }
      buttons.push(btn);
    }

    // DOM order defines the 3x2 grid: Live / Story / Settings / Club Room / Lounge / Scout.
    buttons.forEach(btn=>menu.appendChild(btn));
    menu.dataset.unifiedV0854='1';
    return true;
  }

  ensureStyle();
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(normalize() || tries>80) clearInterval(timer);
  },50);
  requestAnimationFrame(normalize);
  setTimeout(normalize,250);
  setTimeout(normalize,900);
})();