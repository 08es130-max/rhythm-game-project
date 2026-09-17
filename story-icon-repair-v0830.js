// Ver.0.8.30: repair the user-approved story icon with a verified asset path.
(function(){
  'use strict';
  const VERSION='0.8.30';
  window.APP_VERSION=VERSION;

  document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
  const updateHead=document.querySelector('#updateBanner .update-head');
  const updateText=document.querySelector('#updateBanner .update-text');
  if(updateHead) updateHead.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span>Ver.${VERSION} アップデート</span>`;
  if(updateText) updateText.textContent='ストーリーアイコン画像の破損を修正し、指定いただいた本・星・羽ペンのデザインを正しく表示するようにしました。';

  const btn=document.getElementById('homeStoryBtn');
  if(!btn)return;
  let img=btn.querySelector('.home-menu-art');
  if(!img){
    img=document.createElement('img');
    img.className='home-menu-art';
    btn.replaceChildren(img);
  }
  const preferred=`assets/home-ui/story-user-v0830.webp?v=${VERSION}-story-icon-user2`;
  const fallback=`assets/home-ui/story-v0827.svg?v=${VERSION}-fallback1`;
  img.onerror=()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src=fallback;}};
  img.src=preferred;
  img.alt='ストーリー';
  img.decoding='async';
  img.draggable=false;
  btn.title='ストーリー';
  btn.setAttribute('aria-label','ストーリー');
})();
