// Final version guard for Ver.0.8.72. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.72';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='iPhoneで高精細3Dモデル読み込み時にページが停止する問題へ対応するため、重い全身GLBの自動読み込みを一時停止し、ラウンジ表示を安定版へ戻しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
