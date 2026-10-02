// Final version guard for Ver.0.8.255. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.255';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='HAPPY PARTY TRAINの2番・ラスサビを1番の歌詞フレーズ対応譜面から再構築しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
