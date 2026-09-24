// Final version guard for Ver.0.8.208. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.208';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブル2番以降の低密度区間を2.5秒単位で補完し、全曲の同時押しを最終チェックで左右分散へ統一しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
