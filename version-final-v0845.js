// Final version guard for Ver.0.8.82. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.82';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ライブ準備画面から開発用の「音源モード」「譜面JSON」表示を隠し、一般ユーザー向けにSTART・STOP・音源変更だけのシンプルな操作へ整理しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
