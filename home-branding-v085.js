// Ver.0.8.5: inject the approved LoveFes logo at the top-left and register the new standing-art candidate.
(function(){
  const VERSION='0.8.8';
  const titleHost=document.querySelector('.home-topbar > div:first-child');
  if(titleHost && !titleHost.querySelector('.home-lovefes-logo-v085')){
    const img=document.createElement('img');
    img.className='home-lovefes-logo-v085';
    img.src=`assets/branding/lovefes-logo-v085.webp?v=${VERSION}`;
    img.alt='ラブフェス！';
    img.decoding='async';
    img.draggable=false;
    titleHost.appendChild(img);
  }

  window.HOME_CHARACTER_CANDIDATES=window.HOME_CHARACTER_CANDIDATES||{};
  window.HOME_CHARACTER_CANDIDATES.shioriko=window.HOME_CHARACTER_CANDIDATES.shioriko||[];
  if(!window.HOME_CHARACTER_CANDIDATES.shioriko.some(x=>x&&x.id==='stage-v085')){
    window.HOME_CHARACTER_CANDIDATES.shioriko.push({
      id:'stage-v085',
      label:'星空ステージ Ver.0.8.5',
      src:`assets/home-characters/shioriko/candidates/stage-v085.webp?v=${VERSION}`
    });
  }
})();
