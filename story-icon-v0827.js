// Ver.0.8.30: reliable user-approved home story icon with fallback.
(function(){
  'use strict';
  const VERSION='0.8.30';
  window.APP_VERSION=VERSION;

  document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
  const updateHead=document.querySelector('#updateBanner .update-head');
  const updateText=document.querySelector('#updateBanner .update-text');
  if(updateHead) updateHead.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span>Ver.${VERSION} アップデート</span>`;
  if(updateText) updateText.textContent='ストーリーアイコンの画像読み込み失敗を修正し、iPhone/PWAでも確実に表示されるフォールバックを追加しました。';

  const btn=document.getElementById('homeStoryBtn');
  if(!btn)return;

  const primary=`assets/home-ui/story-user-v0829.webp?v=${VERSION}-story-icon-user2`;
  const fallback=`assets/home-ui/story-user-v0830.svg?v=${VERSION}-story-icon-fallback1`;

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
})();