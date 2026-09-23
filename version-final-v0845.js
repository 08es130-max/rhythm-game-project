// Final version guard for Ver.0.8.152. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.152';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='虹ヶ咲メンバーごとにホーム会話の口調・内容・ライブ結果リアクションを個別化しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
