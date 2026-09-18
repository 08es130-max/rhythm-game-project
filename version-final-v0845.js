// Final version guard for Ver.0.8.65. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.65';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャの「星の約束」バナー表示がiPhoneで乱れる問題に対し、元画像をSafari互換性の高いJPEGへ変換して差し替えました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
