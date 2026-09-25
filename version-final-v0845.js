// Final version guard for Ver.0.8.233. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.233';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='楽曲選択の重複表示を解消し、BPM・NOTES・★を最新版譜面から自動取得するよう変更しました。★はノーツ数・長押し数・譜面密度の共通基準で算出します。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
