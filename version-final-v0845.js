// Final version guard for Ver.0.8.113. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.113';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャ結果上部の提供割合表示を削除し、結果全体を上へ詰めて連続勧誘ボタンを押しやすくしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
