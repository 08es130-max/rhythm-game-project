// Final version guard for Ver.0.8.167. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.167';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='タップ音診断に、元のシャンを保ったまま瞬間的な高域アタックを重ねる「瞬発シャン」を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
