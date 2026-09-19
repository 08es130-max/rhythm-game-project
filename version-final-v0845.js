// Final version guard for Ver.0.8.78. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.78';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し部屋のメイド・水着・剣士立ち絵が既存の表情差分処理に上書きされる競合を修正し、隠し立ち絵選択中はその画像を最優先で表示するようにしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
