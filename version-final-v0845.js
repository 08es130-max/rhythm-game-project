// Final version guard for Ver.0.8.56. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.56'
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ライブ選択画面のカテゴリ順を調整し、「蓮ノ空」の右に「追加曲」が来る並びへ変更しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
