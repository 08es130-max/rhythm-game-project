// Final version guard for Ver.0.8.234. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.234';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='部室左下に表示されていた不要な\\n文字列を削除し、設定画面下部の重複したアプリ更新カードを削除しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
