// Final version guard for Ver.0.8.98. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.98';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LRホーム背景画像の破損を修正し、検証済みの軽量WebPへ差し替えました。ホームスタイル一覧とホーム画面の両方で正常表示されます。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
