// Ver.0.8.36: story icon + automatic next-chapter transition without overriding app version.
(function(){
  'use strict';
  const VERSION=window.APP_VERSION||'0.8.36';

  const btn=document.getElementById('homeStoryBtn');
  if(btn){
    const primary=`assets/ui/story-icon-v0833.png?v=${VERSION}`;
    const fallback=`assets/home-ui/story-user-v0830.svg?v=${VERSION}-story-icon-fallback5`;
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
    img.onload=()=>{img.classList.add('is-loaded');};
    img.src=primary;
    img.alt='ストーリー';
    img.decoding='async';
    img.draggable=false;
    btn.title='ストーリー';
    btn.setAttribute('aria-label','ストーリー');
  }

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
        const next=cards[current];
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
