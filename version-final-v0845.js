// Final version guard for Ver.0.8.210. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.210';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブルの最終安全処理後に再度密度補完を行い、300ms超の空白除去と1.5秒窓の低密度補正を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
