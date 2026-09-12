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

  const timing=document.getElementById('homeTimingBtn');
  timing?.remove();

  function decorateButton(id,icon,title,sub){
    const btn=document.getElementById(id);
    if(!btn) return null;
    btn.innerHTML=`<span class="home-menu-icon" aria-hidden="true">${icon}</span><span class="home-menu-copy"><strong>${title}</strong><small>${sub}</small></span>`;
    return btn;
  }

  decorateButton('homeLiveBtn','🎤','ライブ','曲を選んでプレイ');
  decorateButton('homeSettingsBtn','⚙️','設定','速度・判定・タイミング調整');
  decorateButton('homeCharactersBtn','🏠','部室','キャラクター設定');

  let gacha=document.getElementById('homeGachaBtn');
  if(!gacha){
    gacha=document.createElement('button');
    gacha.id='homeGachaBtn';
    gacha.className='home-menu-btn home-menu-gacha';
    gacha.type='button';
    menu.appendChild(gacha);
  }
  decorateButton('homeGachaBtn','✨','勧誘','ガチャ・今後実装予定');
  gacha.addEventListener('click',()=>alert('勧誘は今後実装予定です。'));
})();
