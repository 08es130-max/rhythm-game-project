// Final version guard for Ver.0.8.172. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.172';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Dazzling Gameの密度調整で消えていた長押し描画テストを保護し、必ず譜面に残るよう修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
