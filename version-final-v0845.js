// Final version guard for Ver.0.8.71. Runs after legacy feature scripts.
(function(){
  'use strict';
  const VERSION='0.8.71';
  window.APP_VERSION=VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    const text=document.querySelector('#updateBanner .update-text');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(text) text.textContent='Android 13で眩耀夜行の譜面が切り替わらない・音源を再生できない問題に対し、譜面の明示セット、初回音源選択のユーザー操作内実行、音源load処理、楽曲カードの再生成抑止を追加しました。';
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,150);
})();
