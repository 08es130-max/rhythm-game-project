// Final version guard for Ver.0.8.69. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.69';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」バナーをiPhone横画面で右側いっぱいに広がる横長表示へ調整しました。正常な原本画像はそのまま使用し、中央基準で上下のみトリミングしています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
