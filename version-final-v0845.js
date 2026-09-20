// Final version guard for Ver.0.8.91. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.91';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子の排出演出で一瞬UR画像が見える問題を修正し、LRカードの表示位置を調整して頭部が見切れにくいよう改善しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
