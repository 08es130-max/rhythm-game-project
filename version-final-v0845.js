// Final version guard for Ver.0.8.174. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.174';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='長押しノーツの帯をノーツ円と同程度の太さ・薄い白に変更し、中央の発生円から伸びる見え方へ調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
