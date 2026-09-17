// Ver.0.8.20: story UI polish only. Keeps story data/gameplay logic untouched.
(function(){
  'use strict';
  const overlay=document.getElementById('storyOverlay');
  const reader=document.getElementById('storyReader');
  const message=document.getElementById('storyMessage');
  const storyBtn=document.getElementById('homeStoryBtn');
  if(!overlay||!reader||!message||!storyBtn)return;

  if(!document.getElementById('storyPolishV087Style')){
    const style=document.createElement('style');
    style.id='storyPolishV087Style';
    style.textContent=`
      /* Home: make STORY the same square-menu class/scale as the other four buttons. */
      .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important}
      .home-menu-story{grid-column:auto!important;width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;aspect-ratio:1/1!important;padding:0!important;border:0!important;border-radius:14px!important;overflow:hidden!important;line-height:0!important;background:transparent!important;box-shadow:0 12px 28px rgba(0,0,0,.22)!important;display:block!important;letter-spacing:normal!important;font-size:inherit!important}
      .home-menu-story::before{display:none!important;content:none!important}
      .home-menu-story .story-home-copy{position:absolute!important;inset:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;line-height:1.05!important;border-radius:inherit!important;color:#fff!important;background:radial-gradient(circle at 76% 20%,rgba(255,255,255,.26),transparent 24%),radial-gradient(circle at 20% 76%,rgba(255,255,255,.16),transparent 28%),linear-gradient(145deg,#7c3aed 0%,#2563eb 48%,#0891b2 100%)!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.20)!important;text-shadow:0 2px 8px rgba(15,23,42,.55)!important}
      .home-menu-story .story-home-copy::before{content:'▤';display:block;font-size:clamp(30px,5.2vw,54px);line-height:1;color:#fff;filter:drop-shadow(0 5px 7px rgba(15,23,42,.38));transform:perspective(80px) rotateX(5deg)}
      .home-menu-story .story-home-copy::after{content:'STORY';display:block;font-size:clamp(10px,1.7vw,17px);font-weight:1000;letter-spacing:.16em;line-height:1;color:#fff}
      .home-menu-story .story-home-copy>span,.home-menu-story .story-home-copy>small{display:none!important}

      /* Reader: larger type and speaker name at the upper-left edge of the box. */
      .story-message{font-size:clamp(17px,2.55vw,25px)!important;line-height:1.65!important;padding:34px 30px 25px!important}
      .story-nameplate{left:18px!important;right:auto!important;top:-22px!important;min-width:116px!important;max-width:48%!important;text-align:left!important;padding:7px 16px!important;font-size:14px!important}
      .story-progress{font-size:9px!important}

      @media (orientation:landscape) and (pointer:coarse){
        .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        .home-menu-story{height:100%!important;min-height:0!important;border-radius:14px!important}
        .home-menu-story .story-home-copy::before{font-size:34px}
        .home-menu-story .story-home-copy::after{font-size:10px}
        .story-message-wrap{min-height:35%!important}
        .story-message{font-size:16px!important;line-height:1.6!important;padding:27px 22px 18px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-17px!important;min-width:92px!important;padding:5px 11px!important;font-size:11px!important}
        .story-progress{font-size:7px!important}
      }
      @media(max-width:720px) and (orientation:portrait){
        .home-menu{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto!important}
        .home-menu-story{width:100%!important;height:auto!important;aspect-ratio:1/1!important}
        .story-message{font-size:18px!important;line-height:1.65!important;padding:31px 19px 23px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-19px!important;font-size:12px!important}
      }
    `;
    document.head.appendChild(style);
  }

  // Whole reader surface advances text. Interactive top/menu overlays are outside #storyReader.
  if(!reader.dataset.fullscreenAdvance){
    reader.dataset.fullscreenAdvance='1';
    reader.addEventListener('click',(event)=>{
      // The message itself already owns the original advance listener.
      if(event.target.closest('#storyMessage'))return;
      // Ignore any future interactive control that might be added inside the reader.
      if(event.target.closest('button,a,input,select,textarea,label'))return;
      message.click();
    });
  }

  // Replace the temporary text treatment while keeping the original button and click binding.
  storyBtn.innerHTML='<span class="story-home-copy"><small>MAIN STORY</small><span>ストーリー</span></span>';
  storyBtn.title='ストーリー';
  storyBtn.setAttribute('aria-label','ストーリー');
})();
