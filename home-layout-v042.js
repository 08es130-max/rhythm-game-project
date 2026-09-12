// Ver.0.4.2 home layout/navigation polish.
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

  const version=window.APP_VERSION||'0.4.2';
  function decorateButton(id,src,title,sub){
    const btn=document.getElementById(id);
    if(!btn) return null;
    btn.innerHTML=`<img class="home-menu-art" src="${src}?v=${version}" alt="" aria-hidden="true"><span class="home-menu-label">${title}</span><span class="home-menu-sub">${sub}</span>`;
    return btn;
  }

  decorateButton('homeLiveBtn','assets/home-live-v042.webp','ライブ','曲を選んでプレイ');
  decorateButton('homeSettingsBtn','assets/home-settings-v042.webp','設定','速度・判定・タイミング調整');
  decorateButton('homeCharactersBtn','assets/home-room-v042.webp','部室','キャラクター設定');

  let gacha=document.getElementById('homeGachaBtn');
  if(!gacha){
    gacha=document.createElement('button');
    gacha.id='homeGachaBtn';
    gacha.className='home-menu-btn home-menu-gacha';
    gacha.type='button';
    menu.appendChild(gacha);
  }
  decorateButton('homeGachaBtn','assets/home-gacha-v042.webp','勧誘','ガチャ・今後実装予定');
  gacha.addEventListener('click',()=>alert('勧誘は今後実装予定です。'));
})();
