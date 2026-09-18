// Final version guard for Ver.0.8.64. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.64';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャ画面にオリジナルBGM「Starry Scout Loop」を追加しました。勧誘画面を開くとフェードイン再生し、ホームへ戻るとフェードアウトして停止します。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
