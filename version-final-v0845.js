// Final version guard for Ver.0.8.201. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.201';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブルの2番以降を全曲譜面へ拡張し、2番は1番のMASTERパターンを再利用して2本指向けに統一しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
