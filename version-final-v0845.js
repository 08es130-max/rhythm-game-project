// Final version guard for Ver.0.8.228. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.228';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Boooooom Beeで旧カードが新版譜面の起動先を上書きする可能性を修正し、常に最新版譜面を起動するようにしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
