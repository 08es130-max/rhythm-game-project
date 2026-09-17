// Ver.0.8.29: user-approved home story icon.
(function(){
  'use strict';
  const VERSION='0.8.29';
  window.APP_VERSION=VERSION;

  document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent=`Ver. ${VERSION}`;});
  const updateHead=document.querySelector('#updateBanner .update-head');
  const updateText=document.querySelector('#updateBanner .update-text');
  if(updateHead) updateHead.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span>Ver.${VERSION} アップデート</span>`;
  if(updateText) updateText.textContent='ホームのストーリーアイコンを、指定いただいた本・星・羽ペンの新デザインへ差し替えました。';

  const btn=document.getElementById('homeStoryBtn');
  if(!btn)return;
  const src=`assets/home-ui/story-user-v0829.webp?v=${VERSION}-story-icon-user1`;
  let img=btn.querySelector('.home-menu-art');
  if(!img){
    img=document.createElement('img');
    img.className='home-menu-art';
    btn.replaceChildren(img);
  }
  img.src=src;
  img.alt='ストーリー';
  img.decoding='async';
  img.draggable=false;
  btn.title='ストーリー';
  btn.setAttribute('aria-label','ストーリー');
})();