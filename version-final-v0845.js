// Final version guard for Ver.0.8.79. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.79';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し部屋のメイド・水着・剣士立ち絵を、通常立ち絵とは別の専用最前面レイヤーで表示する方式へ変更しました。後から生成される通常立ち絵に隠される問題を修正しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
