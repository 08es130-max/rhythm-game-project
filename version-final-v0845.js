// Final version guard for Ver.0.8.223. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.223';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Boooooom Boooooom Bee!!・Dazzling Game・眩耀夜行の譜面を長押し対応で再構築しました。HAPPY PARTY TRAINとスピカテリブルは変更していません。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
