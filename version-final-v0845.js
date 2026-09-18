// Final version guard for Ver.0.8.60. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.60';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='UR排出演出を豪華に刷新。虹色UR GET!、白フラッシュ、虹色光柱、放射レイ、衝撃波、粒子バースト、キャラ登場ズームを追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
