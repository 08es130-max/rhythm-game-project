// Final version guard for Ver.0.8.163. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.163';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='タップ効果音の開始位置を前の状態へ戻し、シャン音のアタックが欠けないよう復元しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
