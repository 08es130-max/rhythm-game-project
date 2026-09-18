// Final version guard for Ver.0.8.70. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.70';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」バナーは現在の横長サイズを維持したまま、表示位置を上寄りに調整して上段キャラの見切れを改善しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
