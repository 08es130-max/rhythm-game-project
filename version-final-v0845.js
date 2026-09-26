// Final version guard for Ver.0.8.240. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.240';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリーに背景・左右キャラ立ち絵・表情差分・中央イベントCGを1行単位で指定できる共通ビジュアルシステムを追加しました。画像未設定の既存ストーリーは従来どおり表示されます。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
