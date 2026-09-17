// Ver.0.8.33: single-source story icon + automatic next-chapter transition.
(function(){
  'use strict';
  const VERSION='0.8.33';
  window.APP_VERSION=VERSION;

  document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
  const updateHead=document.querySelector('#updateBanner .update-head');
  const updateText=document.querySelector('#updateBanner .update-text');
  if(updateHead) updateHead.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span>Ver.${VERSION} アップデート</span>`;
  if(updateText) updateText.textContent='ホームのストーリーアイコンの画像参照を修正しました。';

  const btn=document.getElementById('homeStoryBtn');
  if(btn){
    const primary=`assets/ui/story-icon-v0833.png?v=${VERSION}`;

    let img=btn.querySelector('.home-menu-art');
    if(!img){
      img=document.createElement('img');
      img.className='home-menu-art';
      btn.replaceChildren(img);
    }

    let fallbackUsed=false;
    img.onerror=()=>{
      if(fallbackUsed)return;
      fallbackUsed=true;
      img.src=fallback;
    };
    img.onload=()=>{ img.classList.add('is-loaded'); };
    img.src=primary;
    img.alt='ストーリー';
    img.decoding='async';
    img.draggable=false;
    btn.title='ストーリー';
    btn.setAttribute('aria-label','ストーリー');
  }

  // The core story reader intentionally returns to the chapter list after each
  // chapter. Detect that completion toast and immediately open the next card.
  // This keeps the story core untouched and works for both tapping and AUTO mode.
  const installAutoNext=()=>{
    const toast=document.getElementById('storyToast');
    const progress=document.getElementById('storyProgress');
    const grid=document.getElementById('storyChapterGrid');
    const story=window.LOVEFES_STORY?.data;
    if(!toast||!progress||!grid||!Array.isArray(story)||toast.dataset.autoNextInstalled)return false;

    toast.dataset.autoNextInstalled='1';
    let lastChapter=0;
    let pending=null;

    const handleCompletion=()=>{
      if(toast.textContent.trim()!=='章を読み終えました'||!toast.classList.contains('show'))return;
      const m=progress.textContent.match(/^(\d+)\/(\d+)/);
      if(!m)return;
      const current=Number(m[1]);
      const total=Number(m[2]);
      if(!current||current>=total||current===lastChapter)return;
      lastChapter=current;
      clearTimeout(pending);
      pending=setTimeout(()=>{
        const cards=grid.querySelectorAll('.story-chapter-card');
        const next=cards[current]; // current is 1-based, therefore this is the next 0-based card.
        if(next)next.click();
      },760);
    };

    const observer=new MutationObserver(handleCompletion);
    observer.observe(toast,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
    return true;
  };

  if(!installAutoNext()){
    let tries=0;
    const t=setInterval(()=>{
      tries++;
      if(installAutoNext()||tries>30)clearInterval(t);
    },100);
  }
})();