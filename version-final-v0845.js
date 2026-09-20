// Final version guard for Ver.0.8.96. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.96';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='LRホームスタイル「蒼海に舞う翠玉姫」選択時に専用の横長背景付きホームシーンを表示するよう変更しました。お知らせ・メニュー・セリフ・ロゴ・Ver表示は背景より前面に表示されます。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
