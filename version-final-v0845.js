// Final version guard for Ver.0.8.62. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.62';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='UR演出のキャラ表示位置を中央固定へ修正し、画質低下の原因になっていたズーム演出を削除しました。虹色の光・衝撃波・粒子演出は維持しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
