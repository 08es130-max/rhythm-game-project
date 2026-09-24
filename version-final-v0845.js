// Final version guard for Ver.0.8.213. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.213';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='HAPPY PARTY TRAINの1番を本家スクフェスEXPERT動画ベースの譜面へ置き換えました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
