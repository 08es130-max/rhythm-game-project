// Final version guard for Ver.0.8.221. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.221';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='判定強化を拡張し、PERFECT範囲拡大・コンボ受付拡大・GOODなしを追加しました。近接ノーツでは受付範囲を自動調整します。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
