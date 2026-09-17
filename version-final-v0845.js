// Final version guard for Ver.0.8.50. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.50';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='「ふれあい」の3D栞子を詳細化。スクフェス風の上品なライブ衣装、髪型、顔、表情を作り込みました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
