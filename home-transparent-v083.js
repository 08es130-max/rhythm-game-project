// Ver.0.8.42 patch loader: version sync, safe areas, and late-loaded chart fixes.
(function(){
  const VERSION='0.8.42';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text) text.textContent='「Dazzling Game」を追加。音源解析に合わせたBPM184.57・1500ノーツの高難度譜面です。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,120);

  if(!document.getElementById('coreScreenSafeAreaV0840')){
    const style=document.createElement('style');
    style.id='coreScreenSafeAreaV0840';
    style.textContent=`
      #liveScreen,#settingsScreen,#characterScreen{
        --core-safe-left:max(16px,env(safe-area-inset-left));
        --core-safe-right:max(16px,env(safe-area-inset-right));
        --core-safe-top:max(10px,env(safe-area-inset-top));
        --core-safe-bottom:max(10px,env(safe-area-inset-bottom));
        box-sizing:border-box!important;
        padding-left:var(--core-safe-left)!important;
        padding-right:var(--core-safe-right)!important;
        padding-bottom:var(--core-safe-bottom)!important;
      }
      #liveScreen>.screen-header,#settingsScreen>.screen-header,#characterScreen>.screen-header{
        box-sizing:border-box!important;
        padding-top:var(--core-safe-top)!important;
      }
      #liveScreen .panel,#liveScreen .game-wrap,#settingsScreen .screen-panel,#characterScreen .screen-panel{
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      @media (orientation:landscape) and (pointer:coarse){
        #liveScreen,#settingsScreen,#characterScreen{
          --core-safe-left:max(30px,env(safe-area-inset-left));
          --core-safe-right:max(30px,env(safe-area-inset-right));
          --core-safe-top:max(8px,env(safe-area-inset-top));
          --core-safe-bottom:max(8px,env(safe-area-inset-bottom));
        }
      }
      @media (max-width:720px) and (orientation:portrait){
        #liveScreen,#settingsScreen,#characterScreen{
          --core-safe-left:max(14px,env(safe-area-inset-left));
          --core-safe-right:max(14px,env(safe-area-inset-right));
        }
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

  if(!document.querySelector('script[data-hpt-density-v0838]')){
    loadScript('hpt-density-v0838.js?v=0.8.38-density1','hpt-density-v0838');
  }
  loadScript('chart-audio-boundary-v0840.js?v=0.8.42-boundary3','chart-boundary-v0840',()=>{
    loadScript('genyo-yako-chart-v0840.js?v=0.8.42-genyo3','genyo-chart-v0840');
  });
  loadScript('dazzling-game-v0841.js?v=0.8.42-dazzling3','dazzling-game-v0841');

  function keepHasunosoraTab(){
    const tabs=document.getElementById('songCategoryTabs');
    const page=document.getElementById('hasunosoraSongScreen');
    if(!tabs||!page||document.getElementById('hasunosoraPageBtn'))return;
    const btn=document.createElement('button');btn.id='hasunosoraPageBtn';btn.type='button';btn.textContent='蓮ノ空';btn.className='hasunosora-page-tab';
    btn.addEventListener('click',()=>{document.querySelectorAll('.app-screen').forEach(el=>el.hidden=true);page.hidden=false;});
    tabs.appendChild(btn);
  }
  const tabWatch=new MutationObserver(()=>requestAnimationFrame(keepHasunosoraTab));
  const beginTabWatch=()=>{const tabs=document.getElementById('songCategoryTabs');if(tabs){tabWatch.observe(tabs,{childList:true});keepHasunosoraTab();}else setTimeout(beginTabWatch,80);};
  beginTabWatch();setTimeout(keepHasunosoraTab,250);
})();
