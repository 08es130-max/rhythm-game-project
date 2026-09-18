// Final version guard for Ver.0.8.59. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.59';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャのピックアップバナーをマンスリーUR12人全員の集合ビジュアルへ更新。注目URは排出画像を見切れず表示するよう改善しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
