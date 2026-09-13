// Ver.0.7.1: restore stable touch input and return pause button to bottom-right.
(function(){
  const VERSION='0.7.1';

  // Keep gameplay input on the original, proven pointer handlers.
  // Do not pool/recycle note DOM nodes here: the v0.7.0 pooling experiment
  // could leave iOS/PWA input unresponsive after several seconds of play.

  const style=document.createElement('style');
  style.id='stability-style-v071';
  style.textContent=`
    body.playing-mode:not(.finished-mode) .pause-btn{
      display:block!important;
      position:fixed!important;
      z-index:1000!important;
      top:auto!important;
      left:auto!important;
      right:max(28px,calc(env(safe-area-inset-right) + 18px))!important;
      bottom:max(24px,calc(env(safe-area-inset-bottom) + 18px))!important;
      pointer-events:auto!important;
      touch-action:manipulation!important;
    }
    .pause-menu{z-index:1100!important;pointer-events:auto!important}
    body.playing-mode .game::before,
    body.playing-mode .game::after,
    body.playing-mode .live-backdrop{display:none!important}
    body.playing-mode .game{background:#07101e!important}
    body.playing-mode .note{
      will-change:transform!important;
      backface-visibility:hidden!important;
      box-shadow:0 0 7px rgba(96,165,250,.5)!important;
      filter:none!important;
    }
    body.playing-mode .target-avatar{box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)!important}
    body.playing-mode .target-ring{box-shadow:0 0 0 2px rgba(96,165,250,.16)!important}
  `;
  document.head.appendChild(style);

  // Pause button: bind one direct pointer handler only. Avoid the extra
  // document-level capture/touchstart hooks used in v0.7.0.
  const pauseBtn=document.getElementById('pauseBtn');
  if(pauseBtn && pauseBtn.dataset.stable071!=='1'){
    pauseBtn.dataset.stable071='1';
    pauseBtn.addEventListener('pointerdown',(e)=>{
      if(!playing)return;
      e.preventDefault();
      e.stopPropagation();
      try{openPauseMenu();}catch(_){}
    },{passive:false});
  }

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{
      const t=`Ver. ${VERSION}`;
      if(el.textContent!==t)el.textContent=t;
    });
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ中にタップ操作が効かなくなる問題を修正し、中断ボタンを右下へ戻しました。';
  }
  syncVersion();
})();
