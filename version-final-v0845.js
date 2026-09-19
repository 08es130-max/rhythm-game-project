// Final version guard for Ver.0.8.73. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.73';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='隠し部屋に栞子の立ち絵変更を追加しました。メイド・水着・剣士を選択でき、通常立ち絵より優先表示し、それぞれ専用セリフに切り替わります。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
