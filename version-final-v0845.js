// Final version guard for Ver.0.8.154. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.154';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='虹ヶ咲メンバーのホーム会話を、親しくなった後の距離感と各キャラ固有の話し方に合わせて全面調整しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
