// Final version guard for Ver.0.8.57. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.57';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='眩耀夜行のジャケットを月夜と水面の新ビジュアルへ更新。iPhone横向きでは詳細ページをスクロールなしの1画面構成に最適化しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
