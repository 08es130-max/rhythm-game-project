// Final version guard for Ver.0.8.75. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.75';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='楽曲選択のLIVE STARTが古いボタン参照を保持して別譜面を起動する問題を修正し、選択中の曲IDから現在の最新カードを引き直して起動するよう変更しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
