// Final version guard for Ver.0.8.114. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.114';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='勧誘結果の重複表示を整理し、LR・UR獲得数は出現時だけ表示。連続勧誘ボタンと結果の重なりも修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
