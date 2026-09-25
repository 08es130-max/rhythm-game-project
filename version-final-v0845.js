// Final version guard for Ver.0.8.235. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.235';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ストーリーをスクスタ本編の全53章構成へ再構築しました。原作の章構成・出来事・時系列を重視し、会話はラブフェス用のオリジナル文章で長編化しています。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
