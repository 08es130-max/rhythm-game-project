// Final version guard for Ver.0.8.63. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.63';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」ピックアップバナーを12人集合の完成ビジュアルへ差し替え、動的な12枚合成を廃止して固定バナー表示へ軽量化しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
