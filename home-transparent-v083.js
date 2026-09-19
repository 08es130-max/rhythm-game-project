// Ver.0.8.83 patch loader: version sync, safe areas, interaction room, refined Shioriko 3D, and late-loaded chart fixes.
(function(){
  const VERSION='0.8.83';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text) text.textContent='LIVE START後の準備画面に「楽曲選択へ戻る」を追加し、現在選択中の曲名を大きく表示して分かりやすくしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,120);

  if(!document.getElementById('coreScreenSafeAreaV0843')){
    document.getElementById('coreScreenSafeAreaV0840')?.remove();
    const style=document.createElement('style');
    style.id='coreScreenSafeAreaV0843';
    style.textContent=`
      #settingsScreen,#characterScreen{
        --core-safe-left:max(16px,env(safe-area-inset-left));--core-safe-right:max(16px,env(safe-area-inset-right));--core-safe-top:max(10px,env(safe-area-inset-top));--core-safe-bottom:max(10px,env(safe-area-inset-bottom));
        box-sizing:border-box!important;padding-left:var(--core-safe-left)!important;padding-right:var(--core-safe-right)!important;padding-bottom:var(--core-safe-bottom)!important;
      }
      #settingsScreen>.screen-header,#characterScreen>.screen-header{box-sizing:border-box!important;padding-top:var(--core-safe-top)!important;}
      #settingsScreen .screen-panel,#characterScreen .screen-panel{max-width:100%!important;box-sizing:border-box!important;}
      #liveScreen{--live-select-safe-left:max(16px,env(safe-area-inset-left));--live-select-safe-right:max(16px,env(safe-area-inset-right));--live-select-safe-top:max(10px,env(safe-area-inset-top));padding-left:0!important;padding-right:0!important;padding-bottom:0!important;}
      #liveScreen>.screen-header{box-sizing:border-box!important;padding-top:var(--live-select-safe-top)!important;padding-left:var(--live-select-safe-left)!important;padding-right:var(--live-select-safe-right)!important;}
      #liveScreen>#controlsPanel{box-sizing:border-box!important;margin-left:var(--live-select-safe-left)!important;margin-right:var(--live-select-safe-right)!important;max-width:calc(100% - var(--live-select-safe-left) - var(--live-select-safe-right))!important;}
      #liveScreen .game-wrap{margin-left:0!important;margin-right:0!important;max-width:none!important;width:100%!important;box-sizing:border-box!important;}
      @media (orientation:landscape) and (pointer:coarse){
        #settingsScreen,#characterScreen{--core-safe-left:max(30px,env(safe-area-inset-left));--core-safe-right:max(30px,env(safe-area-inset-right));--core-safe-top:max(8px,env(safe-area-inset-top));--core-safe-bottom:max(8px,env(safe-area-inset-bottom));}
        #liveScreen{--live-select-safe-left:max(30px,env(safe-area-inset-left));--live-select-safe-right:max(30px,env(safe-area-inset-right));--live-select-safe-top:max(8px,env(safe-area-inset-top));}
      }
      @media (max-width:720px) and (orientation:portrait){
        #settingsScreen,#characterScreen{--core-safe-left:max(14px,env(safe-area-inset-left));--core-safe-right:max(14px,env(safe-area-inset-right));}
        #liveScreen{--live-select-safe-left:max(14px,env(safe-area-inset-left));--live-select-safe-right:max(14px,env(safe-area-inset-right));}
      }
    `;
    document.head.appendChild(style);
    requestAnimationFrame(()=>{try{if(typeof layoutPlayfield==='function')layoutPlayfield();}catch(_){}});
  }

  function loadScript(src,dataKey,onload){
    if(document.querySelector(`script[data-${dataKey}]`)){onload?.();return;}
    const s=document.createElement('script');s.src=src;s.dataset[dataKey.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]='1';
    if(onload)s.addEventListener('load',onload,{once:true});document.head.appendChild(s);
  }

  if(!document.querySelector('script[data-hpt-density-v0838]')) loadScript('hpt-density-v0838.js?v=0.8.38-density1','hpt-density-v0838');
  loadScript('chart-audio-boundary-v0840.js?v=0.8.43-boundary4','chart-boundary-v0840',()=>{loadScript('genyo-yako-chart-v0840.js?v=0.8.43-genyo4','genyo-chart-v0840');});
  loadScript('dazzling-game-v0841.js?v=0.8.43-dazzling4','dazzling-game-v0841');
  loadScript('interaction-room-v0844.js?v=0.8.61-head-review1','interaction-room-v0844',()=>{loadScript('shioriko-model-loader-v0852.js?v=0.8.72-ios-recovery1','shioriko-model-loader-v0852');});

  function keepHasunosoraTab(){
    const tabs=document.getElementById('songCategoryTabs');const page=document.getElementById('hasunosoraSongScreen');
    if(!tabs||!page||document.getElementById('hasunosoraPageBtn'))return;
    const btn=document.createElement('button');btn.id='hasunosoraPageBtn';btn.type='button';btn.textContent='蓮ノ空';btn.className='hasunosora-page-tab';
    btn.addEventListener('click',()=>{document.querySelectorAll('.app-screen').forEach(el=>el.hidden=true);page.hidden=false;});
    const custom=tabs.querySelector('button[data-category="custom"]');
    if(custom) tabs.insertBefore(btn,custom); else tabs.appendChild(btn);
  }
  const tabWatch=new MutationObserver(()=>requestAnimationFrame(keepHasunosoraTab));
  const beginTabWatch=()=>{const tabs=document.getElementById('songCategoryTabs');if(tabs){tabWatch.observe(tabs,{childList:true});keepHasunosoraTab();}else setTimeout(beginTabWatch,80);};
  beginTabWatch();setTimeout(keepHasunosoraTab,250);
})();
