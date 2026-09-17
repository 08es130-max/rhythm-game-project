// Final version guard for Ver.0.8.47. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.47';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」の真上・真下視点を修正。キャラを倒さず、カメラが周囲を回る方式に変更しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
