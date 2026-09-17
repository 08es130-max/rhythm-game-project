// Final version guard for Ver.0.8.49. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.49';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」の正面カメラを再調整し、頭上と足元に余白を持たせた全身構図へ修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
