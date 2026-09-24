// Final version guard for Ver.0.8.215. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.215';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホームの6ボタンの統一感を調整し、ストーリー／ラウンジの文字がアイコンから浮いて見えにくいよう表示バランスを整えました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
