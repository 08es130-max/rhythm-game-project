// Final version guard for Ver.0.8.237. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.237';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='スクスタ本編53章をさらに複数シーン化。通常章は20〜30会話前後、重要章は30〜50会話級を目安に、放課後・練習・移動・本番前後の場面を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
