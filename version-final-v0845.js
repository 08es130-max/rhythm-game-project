// Final version guard for Ver.0.8.81. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.81';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し立ち絵がホーム会話ボックスより前面に出て文字を隠していたため、通常立ち絵より上・会話ボックスより下になるよう表示順を調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
