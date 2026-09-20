// Final version guard for Ver.0.8.94. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.94';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR排出演出をUR演出から完全分離し、LR入りガチャ開始時の専用予兆と、画面切替を伴うLEGEND RARE専用シネマティック演出を新規実装しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
