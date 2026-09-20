// Final version guard for Ver.0.8.93. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.93';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子のカード画像を軽量WebPのBase64埋め込みへ切り替え、ガチャ結果と排出演出で確実に表示されるよう修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
