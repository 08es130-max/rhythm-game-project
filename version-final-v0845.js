// Final version guard for Ver.0.8.218. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.218';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム6ボタンの新デザインに共通の安全余白を追加し、外周の星やリボンが見切れないよう表示サイズを調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
