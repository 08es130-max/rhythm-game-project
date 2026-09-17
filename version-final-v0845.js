// Final version guard for Ver.0.8.51. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.51';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」の3D栞子の顔と髪を再造形。切れ長の目元、細めの輪郭、分けた前髪、長い毛束でより栞子らしい印象に調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
