// Final version guard for Ver.0.8.238. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.238';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='重要17章をさらに長編ADV化。栞子加入、スクールアイドル部、ミア、ランジュ、栞子と薫子、お台場祭りを中心に感情変化の途中まで細かく描く追加シーンを実装しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
