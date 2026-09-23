// Final version guard for Ver.0.8.204. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.204';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブル1番終盤の同時押し＋通常ノーツ重複を修正し、後半の空白区間を安全に補完しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
