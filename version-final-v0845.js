// Final version guard for Ver.0.8.86. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.86';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='ガチャ開封テンポを改善し、Nは高速開封・URだけ特別演出で止まるよう変更しました。「URまでスキップ」「全スキップ」と100連勧誘を追加し、100連結果はコンパクト表示に対応しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
