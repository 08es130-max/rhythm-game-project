// Final version guard for Ver.0.8.254. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.254';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='HAPPY PARTY TRAINの2番・ラスサビ譜面を実音源の歌詞位置へ合わせました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
