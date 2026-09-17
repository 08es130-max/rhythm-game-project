// Final version guard for Ver.0.8.54. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.54';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホームメニュー6項目のサイズと表示品質をストーリーボタン基準へ統一。ラウンジを専用画像ボタン化し、配置と見え方を最適化しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
