// Ver.0.4.3: image-only home menu buttons.
(function(){
  const homeMain=document.querySelector('.home-main');
  const updateBanner=document.getElementById('updateBanner');
  const menu=document.querySelector('.home-menu');
  if(!homeMain||!menu) return;

  let right=document.querySelector('.home-right-panel');
  if(!right){
    right=document.createElement('div');
    right.className='home-right-panel';
    homeMain.appendChild(right);
  }
  if(updateBanner) right.appendChild(updateBanner);
  right.appendChild(menu);

  document.getElementById('homeTimingBtn')?.remove();

  const version=window.APP_VERSION||'0.4.3';
  function decorateButton(id,src,title){
    const btn=document.getElementById(id);
    if(!btn) return null;
    btn.setAttribute('aria-label',title);
    btn.title=title;
    btn.innerHTML=`<img class="home-menu-art" src="${src}?v=${version}" alt="${title}">`;
    return btn;
  }

  decorateButton('homeLiveBtn','assets/home-live-v042.webp','ライブ');
  decorateButton('homeSettingsBtn','assets/home-settings-v042.webp','設定');
  decorateButton('homeCharactersBtn','assets/home-room-v042.webp','部室');

  let gacha=document.getElementById('homeGachaBtn');
  if(!gacha){
    gacha=document.createElement('button');
    gacha.id='homeGachaBtn';
    gacha.className='home-menu-btn home-menu-gacha';
    gacha.type='button';
    menu.appendChild(gacha);
  }
  decorateButton('homeGachaBtn','assets/home-gacha-v042.webp','勧誘');
  gacha.addEventListener('click',()=>alert('勧誘は今後実装予定です。'));
})();
