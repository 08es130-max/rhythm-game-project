// Final version guard for Ver.0.8.219. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.219';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム6ボタンを元の見た目サイズに戻し、透明キャンバスを広げた新アセットで外周装飾の見切れを解消しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
