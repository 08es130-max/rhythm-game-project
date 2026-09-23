// Final version guard for Ver.0.8.162. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.162';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='タップ効果音だけの開始位置をさらに前詰めし、判定処理を変えずに体感遅延を短縮しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
