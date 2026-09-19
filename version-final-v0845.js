// Final version guard for Ver.0.8.88. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.88';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子の専用画像が正しく表示されるよう修正し、ガチャ結果のLRカードを大きな正方形表示に変更しました。LR演出・結果・ライブアイコンで顔が見切れないよう画像も調整しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
