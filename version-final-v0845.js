// Final version guard for Ver.0.8.87. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.87';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='最高レアリティLRを追加しました。三船栞子【煌めくミントローズ】はLR 0.01%で登場し、獲得後は専用ホーム立ち絵と会話が解放されます。LR専用演出とテストモードも追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
