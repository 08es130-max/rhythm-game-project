// Final version guard for Ver.0.8.53. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.53';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホームの3Dキャラ機能を「ラウンジ」へ刷新。専用アイコンを追加し、ラウンジUIを更新しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
