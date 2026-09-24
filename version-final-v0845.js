// Final version guard for Ver.0.8.205. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.205';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブル2番以降を全区間再監査し、420ms超の空白を拍位置で安全に補完する処理へ更新しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
