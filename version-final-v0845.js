// Final version guard for Ver.0.8.58. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.58';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャ画面をステージ型のSCOUTロビーへ刷新。ピックアップバナー、注目UR3枚、1回/10回勧誘、提供割合・詳細を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
