// Final version guard for Ver.0.8.68. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.68';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」バナーを正常な原本から作成し直しました。単一画像を元の比率で表示し、旧バナーCSSの重複を整理しました。ガチャBGMのマナーモード対応は維持しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
