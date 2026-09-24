// Final version guard for Ver.0.8.206. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.206';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブルの115〜190ms級のほぼ同時ノーツを要所だけ調整し、同じ側へ偏る連打を左右へ分散しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
