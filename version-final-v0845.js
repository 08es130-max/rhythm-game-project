// Final version guard for Ver.0.8.84. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.84';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ライブ準備画面に「ホーム」を追加し、選択中の楽曲をライブ準備より上へ移動しました。音源の保存状態に応じて案内文とボタン名が「音源ファイルを選択／音源を変更」に切り替わります。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
