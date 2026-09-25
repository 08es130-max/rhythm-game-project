// Final version guard for Ver.0.8.217. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.217';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム6ボタンを統一デザインへ刷新し、サイズ・文字位置・縁取り・配色を共通ルールで揃えました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
