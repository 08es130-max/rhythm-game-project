// Final version guard for Ver.0.8.236. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.236';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スクスタ本編53章をさらに長編化。各章の会話・心情・場面のつながりを増やし、原作の出来事と関係変化をより重厚に追える構成へ拡張しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
