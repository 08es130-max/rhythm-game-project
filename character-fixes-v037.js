// Ver.0.3.7 character label and image fixes
(function(){
  if (!Array.isArray(window.CHARACTER_LIBRARY)) return;

  const stripSeries = (name) => String(name || '').replace(/【[^】]+】$/u, '');

  for (const c of window.CHARACTER_LIBRARY) {
    if (!c) continue;
    const base = stripSeries(c.name);
    if (c.id === 'default' || base === '三船栞子' && /【アイコン】$/u.test(c.name || '')) {
      c.name = '三船栞子【アイコン】';
      continue;
    }
    c.name = `${base}【音符ロリータ】`;
  }

  const emma = window.CHARACTER_LIBRARY.find(c => stripSeries(c.name) === 'エマ・ヴェルデ');
  if (emma) {
    emma.icon = 'emma-music-lolita-256.jpg?v=0.3.7';
    emma.home = emma.icon;
  }

  const setsuna = window.CHARACTER_LIBRARY.find(c => stripSeries(c.name) === '優木せつ菜');
  if (setsuna) {
    setsuna.icon = 'setsuna-music-lolita-256.jpg?v=0.3.7';
    setsuna.home = setsuna.icon;
  }

  const shiorikoLolita = window.CHARACTER_LIBRARY.find(c => c.id !== 'default' && stripSeries(c.name) === '三船栞子');
  if (shiorikoLolita) {
    shiorikoLolita.name = '三船栞子【音符ロリータ】';
    shiorikoLolita.icon = 'shioriko-music-lolita-256.jpg?v=0.3.7';
    shiorikoLolita.home = shiorikoLolita.icon;
  }
})();

// Home layout/navigation polish.
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
