// Final version guard for Ver.0.8.76. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.76';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ライブ画面に残っていた開発用の「スピカテリブル」「テスト譜面を使う」ショートカットを非表示にしました。内部のデバッグ処理は残しているため、通常プレイ機能には影響しません。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
