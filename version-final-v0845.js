// Final version guard for Ver.0.8.61. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.61';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム画面の6ボタンを「ライブ・ストーリー・設定／部室・ラウンジ・勧誘」の2段配置へ変更しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
