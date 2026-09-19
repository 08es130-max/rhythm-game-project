// Final version guard for Ver.0.8.80. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.80';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し立ち絵表示中に背面へ残っていた通常の栞子立ち絵を非表示にし、メイド・水着・剣士だけが表示されるよう修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
