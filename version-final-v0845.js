// Final version guard for Ver.0.8.157. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.157';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='虹ヶ咲LRメンバー全員に、エピソード・水着・応援・甘え・愛情表現を含む特別会話を20種類ずつ追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
