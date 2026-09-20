// Final version guard for Ver.0.8.95. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.95';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LR栞子の名称を「三船栞子【蒼海に舞う翠玉姫】」へ変更し、ホームスタイル・部室・ライブ側の表示名も同じ名称へ統一しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
