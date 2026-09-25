// Final version guard for Ver.0.8.220. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.220';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム6ボタンを余白付きの新規アセットへ差し替え、見た目サイズを維持したまま外周装飾が切れないよう調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
