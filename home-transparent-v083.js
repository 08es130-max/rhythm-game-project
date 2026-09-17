// Ver.0.8.3: final home transparency/version sync.
(function(){
  const VERSION=window.APP_VERSION;
  function sync(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head) head.textContent=`Ver.${VERSION} アップデート`;
  }
  sync();
  requestAnimationFrame(sync);
  setTimeout(sync,0);

  // Ver.0.8.38: loaded after the HPT chart override so the final full-song density
  // matches the reference EXPERT feel without touching the live engine.
  if(VERSION==='0.8.38'&&!document.querySelector('script[data-hpt-density-v0838]')){
    const s=document.createElement('script');
    s.src='hpt-density-v0838.js?v=0.8.38-density1';
    s.dataset.hptDensityV0838='1';
    document.head.appendChild(s);
  }
})();
