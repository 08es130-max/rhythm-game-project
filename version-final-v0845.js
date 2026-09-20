// Final version guard for Ver.0.8.90. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.90';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子のガチャ排出演出で専用カード画像を確実に使用するよう修正しました。LR結果カードも専用アートの大きな正方形表示を維持します。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
