// Final version guard for Ver.0.8.241. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.241';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='設定画面にセーブデータのバックアップ作成・復元機能を追加しました。機種変更やPWA再追加の前に端末内セーブをファイルへ保存できます。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
