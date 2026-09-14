// Ver.0.7.6: keep HUD coalescing only; restore the proven tap-sound implementation from tap-sound-fix-v068.
(function(){
  const VERSION='0.7.6';
  let hudRaf=0;

  // Do not override playTapSound here.
  // tap-sound-fix-v068.js is loaded earlier and is the last known-good shaan sound on iPhone/PWA.

  const originalUpdateHud=updateHud;
  const lightUpdateHud=function(){
    if(hudRaf)return;
    hudRaf=requestAnimationFrame(()=>{
      hudRaf=0;
      originalUpdateHud();
    });
  };
  try{updateHud=lightUpdateHud;}catch(_){window.updateHud=lightUpdateHud;}

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{
      const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;
    });
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
  }
  syncVersion();
})();
