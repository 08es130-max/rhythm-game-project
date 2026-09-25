// Final version guard for Ver.0.8.231. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.231';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='4曲をスイングなしのMASTER基準へ更新。EXPERT風の素直なリズムを土台に密度を上げ、曲選択から最新版譜面へ直接起動するよう統一しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
