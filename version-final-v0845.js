// Final version guard for Ver.0.8.266. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.266';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリー画面のキャラクター立ち絵表示を削除しました。背景・イベントCGとストーリー本文はそのまま利用できます。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
