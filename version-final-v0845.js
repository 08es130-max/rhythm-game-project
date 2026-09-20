// Final version guard for Ver.0.8.92. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.92';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子のガチャカード画像を今回指定の専用アートへ差し替え、排出演出と結果表示の両方で同じLRカード画像を使用するよう統一しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
