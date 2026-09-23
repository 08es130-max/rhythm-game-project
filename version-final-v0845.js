// Final version guard for Ver.0.8.200. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.200';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='長押し中の空き指判定を修正し、iOSでpointerdownが欠落した場合のタッチ補完と長押し間隔の安全化を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
