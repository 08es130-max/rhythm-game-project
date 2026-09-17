// Ver.0.8.26: story UI polish + in-app refresh control + default note speed 2.4 + iPhone safe areas + refreshed story icon.
(function(){
  'use strict';
  const VERSION='0.8.26';
  window.APP_VERSION=VERSION;

  const NOTE_SPEED_KEY='rhythmGame.noteSpeed';
  if(localStorage.getItem(NOTE_SPEED_KEY)===null){
    localStorage.setItem(NOTE_SPEED_KEY,'2.4');
    const speedInput=document.getElementById('speed');
    const speedValueEl=document.getElementById('speedValue');
    const speedSummaryEl=document.getElementById('speedSummary');
    if(speedInput) speedInput.value='2.4';
    if(speedValueEl) speedValueEl.textContent='2.4x';
    if(speedSummaryEl) speedSummaryEl.textContent='2.4x';
  }

  const overlay=document.getElementById('storyOverlay');
  const reader=document.getElementById('storyReader');
  const message=document.getElementById('storyMessage');
  const storyBtn=document.getElementById('homeStoryBtn');
  if(!overlay||!reader||!message||!storyBtn)return;

  document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
  const updateHead=document.querySelector('#updateBanner .update-head');
  const updateText=document.querySelector('#updateBanner .update-text');
  if(updateHead) updateHead.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span>Ver.${VERSION} アップデート</span>`;
  if(updateText) updateText.textContent='ホームのストーリーアイコンを専用の新デザインへ更新し、画像キャッシュを避けるため参照ファイルも切り替えました。';

  if(!document.getElementById('storyPolishV087Style')){
    const style=document.createElement('style');
    style.id='storyPolishV087Style';
    style.textContent=`
      .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;justify-items:center!important;align-items:center!important}
      .home-menu-story{grid-column:2!important;grid-row:2!important;width:106%!important;height:106%!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;aspect-ratio:1/1!important;padding:0!important;border:0!important;border-radius:14px!important;overflow:hidden!important;line-height:0!important;background:transparent!important;box-shadow:none!important;display:block!important;letter-spacing:normal!important;font-size:inherit!important;z-index:2!important}
      .home-menu-story::before{display:none!important;content:none!important}
      .home-menu-story .home-menu-art{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;border:0!important;margin:0!important;padding:0!important;pointer-events:none!important}
      .story-overlay{--story-safe-left:max(16px,env(safe-area-inset-left));--story-safe-right:max(16px,env(safe-area-inset-right));--story-safe-top:max(10px,env(safe-area-inset-top));--story-safe-bottom:max(10px,env(safe-area-inset-bottom))}
      .story-top{left:0!important;right:0!important;padding-top:var(--story-safe-top)!important;padding-left:calc(var(--story-safe-left) + 8px)!important;padding-right:calc(var(--story-safe-right) + 8px)!important}
      .story-chapters{padding-top:66px!important;padding-left:calc(var(--story-safe-left) + 8px)!important;padding-right:calc(var(--story-safe-right) + 8px)!important;padding-bottom:calc(var(--story-safe-bottom) + 14px)!important;box-sizing:border-box!important}
      .story-chapter-head,.story-chapter-grid{box-sizing:border-box!important}
      .story-reader{left:0!important;right:0!important}
      .story-message-wrap{left:calc(var(--story-safe-left) + 8px)!important;right:calc(var(--story-safe-right) + 8px)!important;bottom:max(4%,var(--story-safe-bottom))!important}
      .story-backdrop-title{max-width:calc(100vw - var(--story-safe-left) - var(--story-safe-right) - 40px)!important}
      .story-menu-overlay,.story-backlog{padding-top:calc(var(--story-safe-top) + 8px)!important;padding-right:calc(var(--story-safe-right) + 8px)!important;padding-bottom:calc(var(--story-safe-bottom) + 8px)!important;padding-left:calc(var(--story-safe-left) + 8px)!important;box-sizing:border-box!important}
      .story-menu-panel,.story-backlog-panel{max-width:calc(100vw - var(--story-safe-left) - var(--story-safe-right) - 24px)!important}
      .story-message{font-size:clamp(17px,2.55vw,25px)!important;line-height:1.65!important;padding:34px 30px 25px!important}
      .story-nameplate{left:18px!important;right:auto!important;top:-22px!important;min-width:116px!important;max-width:48%!important;text-align:left!important;padding:7px 16px!important;font-size:14px!important}
      .story-progress{font-size:9px!important}
      .story-menu-btn{min-width:82px!important;min-height:40px!important;padding:10px 18px!important;font-size:13px!important;border-radius:999px!important}
      .update-refresh-card{grid-column:1/-1!important;border-color:rgba(56,189,248,.38)!important;background:linear-gradient(135deg,rgba(14,116,144,.18),rgba(30,41,59,.9))!important}
      .update-refresh-title{font-weight:900;margin-bottom:5px}.update-refresh-note{font-size:11px;line-height:1.5;color:#cbd5e1;margin-bottom:10px}.update-refresh-btn{width:100%;border:0;border-radius:12px;padding:11px 14px;background:linear-gradient(100deg,#0891b2,#2563eb);color:#fff;font-weight:900;cursor:pointer}.update-refresh-btn:disabled{opacity:.65;cursor:default}
      @media (orientation:landscape) and (pointer:coarse){
        .story-overlay{--story-safe-left:max(30px,env(safe-area-inset-left));--story-safe-right:max(30px,env(safe-area-inset-right))}
        .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        .home-menu-story{grid-column:2!important;grid-row:2!important;width:108%!important;height:108%!important;border-radius:14px!important}
        .story-chapters{padding-top:62px!important;padding-left:calc(var(--story-safe-left) + 10px)!important;padding-right:calc(var(--story-safe-right) + 10px)!important}
        .story-message-wrap{left:calc(var(--story-safe-left) + 10px)!important;right:calc(var(--story-safe-right) + 10px)!important;min-height:35%!important}
        .story-message{font-size:16px!important;line-height:1.6!important;padding:27px 22px 18px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-17px!important;min-width:92px!important;padding:5px 11px!important;font-size:11px!important}
        .story-progress{font-size:7px!important}
        .story-menu-btn{min-width:88px!important;min-height:42px!important;padding:10px 18px!important;font-size:11px!important}
        .update-refresh-note{font-size:9px}.update-refresh-btn{padding:9px 12px;font-size:11px}
      }
      @media(max-width:720px) and (orientation:portrait){
        .story-overlay{--story-safe-left:max(14px,env(safe-area-inset-left));--story-safe-right:max(14px,env(safe-area-inset-right))}
        .home-menu{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto!important}
        .home-menu-story{grid-column:1/-1!important;grid-row:auto!important;width:min(54vw,210px)!important;height:auto!important;aspect-ratio:1/1!important;justify-self:center!important}
        .story-message{font-size:18px!important;line-height:1.65!important;padding:31px 19px 23px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-19px!important;font-size:12px!important}
        .story-menu-btn{min-width:84px!important;min-height:42px!important;padding:10px 16px!important;font-size:12px!important}
      }
    `;
    document.head.appendChild(style);
  }

  if(!reader.dataset.fullscreenAdvance){
    reader.dataset.fullscreenAdvance='1';
    reader.addEventListener('click',(event)=>{
      if(event.target.closest('#storyMessage'))return;
      if(event.target.closest('button,a,input,select,textarea,label'))return;
      message.click();
    });
  }

  storyBtn.innerHTML=`<img class="home-menu-art" src="assets/home-ui/story-v0826.svg?v=${VERSION}" alt="ストーリー">`;
  storyBtn.title='ストーリー';
  storyBtn.setAttribute('aria-label','ストーリー');

  const settingsGrid=document.querySelector('#settingsScreen .settings-grid');
  if(settingsGrid&&!document.getElementById('forceRefreshBtn')){
    const card=document.createElement('div');
    card.className='setting-card update-refresh-card';
    card.innerHTML=`<div class="update-refresh-title">アプリ更新</div><div class="update-refresh-note">GitHub Pagesの最新版を確認し、PWA内のキャッシュを整理してそのまま再読み込みします。ライブ設定・部室設定・ストーリーのセーブなどの端末データは消しません。</div><button id="forceRefreshBtn" class="update-refresh-btn" type="button">最新版に更新</button>`;
    settingsGrid.appendChild(card);
    const btn=card.querySelector('#forceRefreshBtn');
    btn.addEventListener('click',async()=>{
      btn.disabled=true;
      btn.textContent='最新版を確認中…';
      let remoteVersion=VERSION;
      try{
        const response=await fetch(`version.json?refresh=${Date.now()}`,{cache:'no-store'});
        if(response.ok){const data=await response.json();if(data?.version)remoteVersion=String(data.version);}
      }catch(_){ }
      try{
        if('caches' in window){const names=await caches.keys();await Promise.all(names.map(name=>caches.delete(name)));}
      }catch(_){ }
      try{
        if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()));}
      }catch(_){ }
      btn.textContent='再読み込みします…';
      const url=new URL(window.location.href);
      url.searchParams.set('v',remoteVersion);
      url.searchParams.set('refresh',String(Date.now()));
      window.location.replace(url.toString());
    });
  }
})();