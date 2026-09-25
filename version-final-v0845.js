// Final version guard for Ver.0.8.216. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.216';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリー／ラウンジの画像をアイコン部と文字部に分け、文字だけを上へ寄せて一体感を強めました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
