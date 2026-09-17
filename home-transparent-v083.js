// Ver.0.8.39: final home transparency/version and announcement sync.
(function(){
  const VERSION=window.APP_VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(VERSION==='0.8.39'){
      const text=document.querySelector('#updateBanner .update-text');
      if(text) text.textContent='蓮ノ空専用ページと「眩耀夜行」の高難度1500ノーツ譜面を追加しました。';
    }
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,120);

  if((VERSION==='0.8.38'||VERSION==='0.8.39')&&!document.querySelector('script[data-hpt-density-v0838]')){
    const s=document.createElement('script');s.src='hpt-density-v0838.js?v=0.8.38-density1';s.dataset.hptDensityV0838='1';document.head.appendChild(s);
  }

  function keepHasunosoraTab(){
    if(VERSION!=='0.8.39')return;
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
