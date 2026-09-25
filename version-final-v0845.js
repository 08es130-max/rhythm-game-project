// Final version guard for Ver.0.8.229. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.229';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Snow halationを曲構成ベースで全面再構築。イントロから長押しを配置し、Aメロ・サビ・ブレイク・ラスサビでリズムと密度を大きく変化させました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
