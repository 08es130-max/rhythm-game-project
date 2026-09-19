// Final version guard for Ver.0.8.77. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.77';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブルの開発用ショートカット経路を完全に削除し、通常の楽曲一覧から直接起動する一本化に変更しました。テスト譜面の内部デバッグ機能は残しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
