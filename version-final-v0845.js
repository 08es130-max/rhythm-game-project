// Final version guard for Ver.0.8.89. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.89';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子の画像実体を正常なWebPとして復元し、ガチャ演出・結果画面で顔が見切れないよう表示位置を調整しました。LR結果カードはUR同様の大きな全面アート表示になります。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
