// Ver.0.8.40 patch loader: final version/announcement sync and late-loaded chart fixes.
(function(){
  const VERSION=window.APP_VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text) text.textContent='全楽曲で開始直後と曲終了後のノーツを整理し、「眩耀夜行」の序盤・サビを階段や三角配置中心に再構成しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,120);

  function loadScript(src,dataKey,onload){
    if(document.querySelector(`script[data-${dataKey}]`)){onload?.();return;}
    const s=document.createElement('script');s.src=src;s.dataset[dataKey.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]='1';
    if(onload)s.addEventListener('load',onload,{once:true});document.head.appendChild(s);
  }

  if(!document.querySelector('script[data-hpt-density-v0838]')){
    loadScript('hpt-density-v0838.js?v=0.8.38-density1','hpt-density-v0838');
  }
  loadScript('chart-audio-boundary-v0840.js?v=0.8.40-boundary2','chart-boundary-v0840',()=>{
    loadScript('genyo-yako-chart-v0840.js?v=0.8.40-genyo2','genyo-chart-v0840');
  });

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
