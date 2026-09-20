// Final version guard for Ver.0.8.104. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.104';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LRホーム背景を高画質版へ復元しました。LRホーム時のセリフ位置も通常ホームと同じ所定位置へ戻しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
