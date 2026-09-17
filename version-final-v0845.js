// Final version guard for Ver.0.8.52. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.52';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」に高精細GLBモデル用の本番パイプラインを導入。制作中は既存3Dへ自動フォールバックします。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
