// Final version guard for Ver.0.8.83. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.83';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LIVE START後の準備画面に「楽曲選択へ戻る」を追加し、現在選択中の曲名を大きく表示して分かりやすくしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
