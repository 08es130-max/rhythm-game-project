// Ver.0.8.39: final home transparency/version and announcement sync.
(function(){
  const VERSION=window.APP_VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
    if(VERSION==='0.8.39'){
      const text=document.querySelector('#updateBanner .update-text');
      if(text) text.textContent='蓮ノ空専用ページと「眩耀夜行」の高難度1500ノーツ譜面を追加しました。';
    }
  }
  sync();requestAnimationFrame(sync);setTimeout(sync,0);setTimeout(sync,120);

  if((VERSION==='0.8.38'||VERSION==='0.8.39')&&!document.querySelector('script[data-hpt-density-v0838]')){
    const s=document.createElement('script');s.src='hpt-density-v0838.js?v=0.8.38-density1';s.dataset.hptDensityV0838='1';document.head.appendChild(s);
  }
})();
