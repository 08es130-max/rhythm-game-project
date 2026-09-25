// Final version guard for Ver.0.8.232. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.232';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='MASTER譜面の密度を調整し、Dazzling Game・眩耀夜行・Snow halationを約1400ノーツへ。Boooooom Beeは1415ノーツのため据え置きました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
