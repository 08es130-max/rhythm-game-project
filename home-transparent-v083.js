// Ver.0.8.3: final home transparency/version sync.
(function(){
  const VERSION=window.APP_VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text) text.textContent='ホームの栞子と4つのメニューボタンを、画像そのものから背景を除去した透過素材へ変更しました。';
  }
  sync();
  requestAnimationFrame(sync);
  setTimeout(sync,0);
})();
