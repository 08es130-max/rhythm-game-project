// Ver.0.7.0: second-stage mobile performance tuning + reliable pause button.
(function(){
  const VERSION='0.7.0';
  const notePool=[];
  const pooled=new WeakSet();

  // Reuse note DOM nodes instead of allocating/removing hundreds of elements per song.
  // This avoids periodic garbage-collection spikes that are especially visible in iOS PWA.
  window.createNoteEl=function(){
    let el=notePool.pop();
    if(!el){
      el=document.createElement('div');
      el.className='note';
    }
    pooled.delete?.(el);
    el.className='note';
    el.style.display='block';
    el.style.opacity='';
    el.style.filter='';
    el.style.left='0px';
    el.style.top='0px';
    el.style.transform='translate3d(-9999px,-9999px,0)';
    el.style.willChange='transform';
    el.style.backfaceVisibility='hidden';
    if(el.parentNode!==notesLayer)notesLayer.appendChild(el);
    return el;
  };
  try{createNoteEl=window.createNoteEl;}catch(_){}

  window.removeNoteEl=function(note){
    const el=note?.el;
    if(!el)return;
    note.el=null;
    el.style.display='none';
    el.classList.remove('missed');
    if(!pooled.has(el)){
      pooled.add(el);
      if(notePool.length<64)notePool.push(el);
      else el.remove();
    }
  };
  try{removeNoteEl=window.removeNoteEl;}catch(_){}

  // Keep the pause control away from the bottom-right lane and force it above the playfield.
  const style=document.createElement('style');
  style.id='performance-style-v070';
  style.textContent=`
    body.playing-mode:not(.finished-mode) .pause-btn{
      display:block!important;
      position:fixed!important;
      z-index:2147483647!important;
      top:max(8px,env(safe-area-inset-top))!important;
      right:max(10px,env(safe-area-inset-right))!important;
      bottom:auto!important;
      left:auto!important;
      pointer-events:auto!important;
      touch-action:manipulation!important;
    }
    .pause-menu{z-index:2147483646!important;pointer-events:auto!important}
    body.playing-mode .game::before,
    body.playing-mode .game::after,
    body.playing-mode .live-backdrop{display:none!important}
    body.playing-mode .game{background:#07101e!important;contain:layout paint style}
    body.playing-mode .note{
      will-change:transform!important;
      backface-visibility:hidden!important;
      box-shadow:0 0 8px rgba(96,165,250,.55)!important;
      filter:none!important;
    }
    body.playing-mode .target-avatar{box-shadow:inset 0 0 0 1px rgba(255,255,255,.28)!important}
    body.playing-mode .target-ring{box-shadow:0 0 0 2px rgba(96,165,250,.18)!important}
    body.playing-mode .lane{opacity:.34!important}
  `;
  document.head.appendChild(style);

  // Some iOS/PWA combinations can route the touch to the playfield underneath a fixed button.
  // Capture the gesture before the lane handlers and open pause directly.
  const pauseCapture=(e)=>{
    const btn=e.target?.closest?.('#pauseBtn');
    if(!btn||!playing)return;
    e.preventDefault();
    e.stopPropagation();
    try{openPauseMenu();}catch(_){}
  };
  document.addEventListener('pointerdown',pauseCapture,true);
  document.addEventListener('touchstart',pauseCapture,{capture:true,passive:false});

  // Prewarm a small number of note nodes before play starts.
  function warmPool(){
    if(notePool.length)return;
    for(let i=0;i<24;i++){
      const el=document.createElement('div');
      el.className='note';
      el.style.display='none';
      el.style.willChange='transform';
      el.style.backfaceVisibility='hidden';
      notesLayer.appendChild(el);
      pooled.add(el);
      notePool.push(el);
    }
  }
  document.getElementById('startBtn')?.addEventListener('pointerdown',warmPool,{once:false,passive:true});

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='ライブ描画をさらに軽量化し、ノーツのカクつきとライブ中断ボタンの操作不良を修正しました。';
  }
  syncVersion();
})();
