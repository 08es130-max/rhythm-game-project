// Final version guard for Ver.0.8.207. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.207';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スピカテリブルの長押し中ルールを最終安全チェック化し、長押し中は逆側1本のみ・重複長押し禁止を必ず守るよう修正しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
