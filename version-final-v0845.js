// Final version guard for Ver.0.8.227. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.227';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='HAPPY PARTY TRAINの同時押しルールを全件確認。Boooooom Bee・Dazzling Game・眩耀夜行・Snow halationの長押し密度をHPT基準へ引き上げました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
