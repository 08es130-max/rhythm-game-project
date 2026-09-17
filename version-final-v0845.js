// Final version guard for Ver.0.8.45. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.45';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」に操作できる3D栞子プロトタイプを追加。ドラッグ回転、タップ反応、視線、手振り、簡易ダンスに対応しました。';
  }
  sync();
  requestAnimationFrame(sync);
  setTimeout(sync,0);
  setTimeout(sync,150);
})();
