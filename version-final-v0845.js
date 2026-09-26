// Final version guard for Ver.0.8.239. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.239';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリーを要所重視でさらに長編化。同好会再始動、せつ菜、栞子との対立、PV編、あなた自身の夢など本筋の転換点を細かく描写しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
