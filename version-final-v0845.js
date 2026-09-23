// Final version guard for Ver.0.8.155. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.155';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ホーム会話を一から再構成し、親しい相手への自然で柔らかな話し方に全面変更しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
