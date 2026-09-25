// Final version guard for Ver.0.8.230. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.230';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Snow halationの起動経路を最新版譜面へ直結し、古いカードやイベントハンドラ経由で旧譜面が起動する余地をなくしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
