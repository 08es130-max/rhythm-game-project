// Ver.0.8.20: story UI polish only. Keeps story data/gameplay logic untouched.
(function(){
  'use strict';
  const VERSION=window.APP_VERSION||'0.8.20';
  const overlay=document.getElementById('storyOverlay');
  const reader=document.getElementById('storyReader');
  const message=document.getElementById('storyMessage');
  const storyBtn=document.getElementById('homeStoryBtn');
  if(!overlay||!reader||!message||!storyBtn)return;

  if(!document.getElementById('storyPolishV087Style')){
    const style=document.createElement('style');
    style.id='storyPolishV087Style';
    style.textContent=`
      /* Home: five image buttons, with STORY slightly larger and centered on the lower row. */
      .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;justify-items:center!important;align-items:center!important}
      .home-menu-story{grid-column:2!important;grid-row:2!important;width:106%!important;height:106%!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;aspect-ratio:1/1!important;padding:0!important;border:0!important;border-radius:14px!important;overflow:hidden!important;line-height:0!important;background:transparent!important;box-shadow:0 14px 30px rgba(0,0,0,.26)!important;display:block!important;letter-spacing:normal!important;font-size:inherit!important;z-index:2!important}
      .home-menu-story::before{display:none!important;content:none!important}
      .home-menu-story .home-menu-art{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;border:0!important;margin:0!important;padding:0!important;pointer-events:none!important}

      /* Reader: larger type and speaker name at the upper-left edge of the box. */
      .story-message{font-size:clamp(17px,2.55vw,25px)!important;line-height:1.65!important;padding:34px 30px 25px!important}
      .story-nameplate{left:18px!important;right:auto!important;top:-22px!important;min-width:116px!important;max-width:48%!important;text-align:left!important;padding:7px 16px!important;font-size:14px!important}
      .story-progress{font-size:9px!important}

      /* Story MENU: pull it inward from the screen edge and enlarge its touch target. */
      .story-top{padding-left:clamp(18px,4vw,42px)!important;padding-right:clamp(24px,7vw,74px)!important}
      .story-menu-btn{min-width:82px!important;min-height:40px!important;padding:10px 18px!important;font-size:13px!important;border-radius:999px!important}

      @media (orientation:landscape) and (pointer:coarse){
        .home-menu{grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;gap:7px!important}
        .home-menu-story{grid-column:2!important;grid-row:2!important;width:108%!important;height:108%!important;border-radius:14px!important}
        .story-message-wrap{min-height:35%!important}
        .story-message{font-size:16px!important;line-height:1.6!important;padding:27px 22px 18px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-17px!important;min-width:92px!important;padding:5px 11px!important;font-size:11px!important}
        .story-progress{font-size:7px!important}
        .story-top{padding-left:22px!important;padding-right:56px!important}
        .story-menu-btn{min-width:88px!important;min-height:42px!important;padding:10px 18px!important;font-size:11px!important}
      }
      @media(max-width:720px) and (orientation:portrait){
        .home-menu{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto!important}
        .home-menu-story{grid-column:1/-1!important;grid-row:auto!important;width:min(54vw,210px)!important;height:auto!important;aspect-ratio:1/1!important;justify-self:center!important}
        .story-message{font-size:18px!important;line-height:1.65!important;padding:31px 19px 23px!important}
        .story-nameplate{left:12px!important;right:auto!important;top:-19px!important;font-size:12px!important}
        .story-top{padding-left:18px!important;padding-right:26px!important}
        .story-menu-btn{min-width:84px!important;min-height:42px!important;padding:10px 16px!important;font-size:12px!important}
      }
    `;
    document.head.appendChild(style);
  }

  // Whole reader surface advances text. Interactive top/menu overlays are outside #storyReader.
  if(!reader.dataset.fullscreenAdvance){
    reader.dataset.fullscreenAdvance='1';
    reader.addEventListener('click',(event)=>{
      if(event.target.closest('#storyMessage'))return;
      if(event.target.closest('button,a,input,select,textarea,label'))return;
      message.click();
    });
  }

  // Use a dedicated image asset just like the other home menu buttons.
  storyBtn.innerHTML=`<img class="home-menu-art" src="assets/home-ui/story.svg?v=${VERSION}-story3" alt="ストーリー">`;
  storyBtn.title='ストーリー';
  storyBtn.setAttribute('aria-label','ストーリー');
})();