// Final version guard for Ver.0.8.85. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.85';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリー画面右上にHOMEボタンを常設し、章選択中でもストーリー再生中でもワンタップでホームへ戻れるようにしました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
