// Ver.0.4.4: square image buttons + tappable announcement/version history.
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

  const version=window.APP_VERSION||'0.4.4';
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

  // お知らせ・更新履歴
  const HISTORY=[
    {version:'0.4.4',title:'ホーム画像ボタンの表示調整',items:[
      'ライブ・設定・部室・勧誘の4つの画像ボタンを正方形に揃えました。',
      '画像が見切れず全体表示されるように調整しました。'
    ]},
    {version:'0.4.3',title:'画像そのものをホームボタン化',items:[
      'ホームの4メニューを画像そのものがボタンになる表示へ変更しました。',
      '重複していた文字ラベルとボタン内の余白を削除しました。'
    ]},
    {version:'0.4.2',title:'横向きホーム画面を再構成',items:[
      '横向きスマホで左半分を立ち絵、右半分をお知らせとメニューに再構成しました。',
      'ホームから判定調整を外し、設定内から開く形に整理しました。',
      'キャラ変更を「部室」に変更し、「勧誘」を今後実装予定のメニューとして追加しました。',
      'ライブ・設定・部室・勧誘に専用イラストアイコンを追加しました。'
    ]},
    {version:'0.4.1',title:'リザルト・ホーム会話を強化',items:[
      'リザルトにランク、FULL COMBO、MAX COMBO、曲ごとのハイスコア、NEW RECORD表示を追加しました。',
      'ホームの栞子にランダム・時間帯・連続タップ・ライブ結果連動のセリフを追加しました。',
      'ホームの吹き出しを追加し、キャラクター連動できる構造にしました。'
    ]},
    {version:'0.4.0',title:'内蔵ボイス再生方式を変更',items:[
      '内蔵6音声を個別データとして扱う構成へ変更し、端末追加音声に近い再生経路へ整理しました。'
    ]}
  ];

  if(updateBanner){
    const latest=HISTORY[0];
    const head=updateBanner.querySelector('.update-head');
    const text=updateBanner.querySelector('.update-text');
    if(head){
      head.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span class="notice-title">お知らせ</span><span class="notice-version">Ver.${latest.version}</span>`;
    }
    if(text) text.textContent=latest.items.join(' ');
    updateBanner.setAttribute('aria-label','お知らせ・更新履歴を開く');

    let overlay=null;
    const closeHistory=()=>{
      if(!overlay) return;
      overlay.hidden=true;
      document.body.classList.remove('notice-history-open');
    };
    const openHistory=()=>{
      if(!overlay){
        overlay=document.createElement('div');
        overlay.className='notice-history-overlay';
        overlay.hidden=true;
        overlay.innerHTML=`<section class="notice-history-modal" role="dialog" aria-modal="true" aria-labelledby="noticeHistoryTitle"><div class="notice-history-head"><div><div class="notice-history-kicker">ANNOUNCEMENT</div><h2 id="noticeHistoryTitle">お知らせ・更新履歴</h2></div><button class="notice-history-close" type="button" aria-label="閉じる">×</button></div><div class="notice-history-list"></div></section>`;
        document.body.appendChild(overlay);
        const list=overlay.querySelector('.notice-history-list');
        HISTORY.forEach((entry,index)=>{
          const card=document.createElement('article');
          card.className='notice-history-card'+(index===0?' is-latest':'');
          card.innerHTML=`<div class="notice-history-version-row"><strong>Ver.${entry.version}</strong>${index===0?'<span>最新</span>':''}</div><h3>${entry.title}</h3><ul>${entry.items.map(item=>`<li>${item}</li>`).join('')}</ul>`;
          list.appendChild(card);
        });
        overlay.querySelector('.notice-history-close')?.addEventListener('click',closeHistory);
        overlay.addEventListener('click',e=>{if(e.target===overlay) closeHistory();});
        document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden) closeHistory();});
      }
      overlay.hidden=false;
      document.body.classList.add('notice-history-open');
    };
    updateBanner.addEventListener('click',openHistory);
    updateBanner.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openHistory();}
    });
  }
})();
