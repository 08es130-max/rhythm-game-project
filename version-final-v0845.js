// Final version guard for Ver.0.8.74. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.74';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し部屋のメイド・水着・剣士立ち絵について、アップロード済み画像ファイル名に合わせて読み込み先を修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
