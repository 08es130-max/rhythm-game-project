// Final version guard for Ver.0.8.224. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.224';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Boooooom Boooooom Bee!!・Dazzling Game・眩耀夜行を、HAPPY PARTY TRAINとスピカテリブルの譜面設計を基準に全面再構築しました。長押し・左右振り・同時押し・密度変化も見直しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
