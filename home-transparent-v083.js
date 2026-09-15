// Ver.0.8.3: final home transparency/version sync.
(function(){
  const VERSION='0.8.3';
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text) text.textContent='ホームの立ち絵とメニューボタン周囲を透過し、星空背景が自然につながる表示に調整しました。';
  }
  sync();
  requestAnimationFrame(sync);
  setTimeout(sync,0);
})();
