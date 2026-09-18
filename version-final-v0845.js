// Final version guard for Ver.0.8.67. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.67';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」バナーをiPhone向けに4分割JPEGで継ぎ目なく表示する方式へ変更し、大きな1枚画像の描画崩れを回避しました。ガチャBGMのマナーモード対応は維持しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
