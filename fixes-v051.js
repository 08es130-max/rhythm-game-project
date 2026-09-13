// Ver.0.6.5: restore default icon rendering; keep Monthly Song zoom and tune crop positions.
(function(){
  const VERSION='0.6.5';
  const MONTHLY_META={
    ayumu:{file:'ayumu.png',focus:'50% 7%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    kasumi:{file:'kasumi.png',focus:'50% 11%',zoom:3.85,spotFocus:'50% 9%',spotZoom:1.08},
    shizuku:{file:'shizuku.png',focus:'50% 7%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    karin:{file:'karin.png',focus:'50% 7%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    ai:{file:'ai.png',focus:'50% 9%',zoom:3.00,spotFocus:'50% 0%',spotZoom:1.00},
    kanata:{file:'kanata.png',focus:'50% 7%',zoom:3.75,spotFocus:'50% 0%',spotZoom:1.00},
    setsuna:{file:'setsuna.png',focus:'50% 14%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    emma:{file:'ema.png',focus:'55% 10%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    rina:{file:'rina.png',focus:'55% 10%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    shioriko:{file:'shioriko.png',focus:'50% 10%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    mia:{file:'mia.png',focus:'50% 10%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    lanzhu:{file:'lanzhu.png',focus:'55% 10%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08}
  };
  window.MONTHLY_ART_META=MONTHLY_META;

  function updateVersionDisplay(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const v=`Ver. ${VERSION}`;if(el.textContent!==v)el.textContent=v;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head){const v=`Ver.${VERSION} アップデート`;if(head.textContent!==v)head.textContent=v;}
    const text=document.querySelector('#updateBanner .update-text');
    const msg='通常アイコンを元の表示に戻し、マンスリーソングURの丸アイコン位置を個別調整しました。';
    if(text&&text.textContent!==msg)text.textContent=msg;
  }

  function isMonthlyUnit(c){return c?.series==='マンスリーソング'&&c?.rarity==='UR';}

  function applyMonthlyMasterArt(){
    (window.GACHA_UR_POOL||[]).forEach(unit=>{
      const meta=MONTHLY_META[unit?.baseId]; if(!meta)return;
      const art=`assets/monthly-song-full/${meta.file}?v=${VERSION}`;
      Object.assign(unit,{art,icon:art,home:art,iconFocus:meta.focus,iconZoom:meta.zoom,spotlightFocus:meta.spotFocus,spotlightZoom:meta.spotZoom});
      const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
      if(libUnit){Object.assign(libUnit,{name:unit.name,art,icon:art,home:art,iconFocus:meta.focus,iconZoom:meta.zoom,spotlightFocus:meta.spotFocus,spotlightZoom:meta.spotZoom,rarity:unit.rarity,series:unit.series,baseId:unit.baseId});}
    });
  }

  function cleanGachaButton(){
    const current=document.getElementById('homeGachaBtn'); if(!current||current.dataset.gachaClean051==='1')return;
    const clean=current.cloneNode(true); clean.dataset.gachaClean051='1'; clean.onclick=null; current.replaceWith(clean);
    clean.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openGachaScreen==='function')window.openGachaScreen();});
  }
  function getRoomList(){if(typeof window.getRoomCharacters==='function'){const r=window.getRoomCharacters();if(Array.isArray(r)&&r.length)return r;}return window.CHARACTER_LIBRARY||[];}
  function characterById(id,list){return list.find(c=>c?.id===id)||list.find(c=>c?.id==='default')||list[0];}

  function makeRoomPreview(c,lane){
    if(isMonthlyUnit(c)){
      const preview=document.createElement('div');
      preview.className='lane-character-preview is-master-art';
      preview.setAttribute('role','img');
      preview.setAttribute('aria-label',`レーン ${lane+1} キャラ`);
      const art=c?.art||c?.icon||'icon-192.png';
      preview.style.backgroundImage=`url("${art}")`;
      preview.style.backgroundPosition=c?.iconFocus||'50% 14%';
      preview.style.backgroundSize=`${Math.round((c?.iconZoom||2.55)*100)}%`;
      preview.style.backgroundRepeat='no-repeat';
      return preview;
    }
    const img=document.createElement('img');
    img.className='lane-character-preview';
    img.alt=`レーン ${lane+1} キャラ`;
    img.src=c?.icon||'icon-192.png';
    img.onerror=()=>{img.src='icon-192.png';};
    return img;
  }

  function installRoomRenderer(){
    const replacement=function(){
      const grid=document.getElementById('characterGrid'),available=getRoomList(); if(!grid||!available.length)return;
      let saved; try{saved=JSON.parse(localStorage.getItem('rhythmGame.laneCharacters')||'null');}catch(_){saved=null;}
      if(!Array.isArray(saved)||saved.length!==9)saved=Array.from({length:9},()=> 'default');
      const ids=new Set(available.map(c=>c.id)); saved=saved.map(id=>ids.has(id)?id:'default'); grid.innerHTML='';
      saved.forEach((id,i)=>{
        const c=characterById(id,available),card=document.createElement('div'); card.className='lane-character-card';
        const title=document.createElement('div'); title.className='lane-character-title'; title.textContent=`レーン ${i+1}`;
        let preview=makeRoomPreview(c,i);
        const select=document.createElement('select'); select.className='lane-character-select'; select.dataset.lane=String(i);
        available.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;option.selected=item.id===id;select.appendChild(option);});
        select.addEventListener('change',()=>{const s=characterById(select.value,available),next=makeRoomPreview(s,i);preview.replaceWith(next);preview=next;});
        card.append(title,preview,select);grid.appendChild(card);
      });
      const status=document.getElementById('characterSaveStatus'); if(status){const urOwned=available.filter(c=>c?.rarity==='UR').length;status.textContent=`音符ロリータは初期加入。マンスリーソングURは勧誘で獲得すると追加されます。（UR獲得 ${urOwned}/12）`;}
    };
    window.renderCharacterSelectors=replacement; try{renderCharacterSelectors=replacement;}catch(_){}
  }

  function installLiveCrop(){
    const replacement=function(avatar,path){
      if(!path)return;
      const normalized=String(path).split('?')[0];
      const unit=(window.CHARACTER_LIBRARY||[]).find(c=>[c?.art,c?.icon,c?.home].filter(Boolean).map(v=>String(v).split('?')[0]).includes(normalized));
      const img=new Image();
      img.onload=()=>{
        avatar.style.setProperty('--target-art',`url("${path}")`);
        if(isMonthlyUnit(unit)){
          const focus=unit?.iconFocus||'50% 14%',zoom=unit?.iconZoom||2.55;
          avatar.style.setProperty('--target-focus',focus);
          avatar.style.setProperty('--target-zoom-size',`${Math.round(zoom*100)}%`);
          avatar.style.backgroundPosition=focus;
          avatar.style.backgroundSize=`${Math.round(zoom*100)}%`;
          avatar.style.backgroundRepeat='no-repeat';
          avatar.classList.add('master-art-crop');
        }else{
          avatar.style.removeProperty('--target-focus');
          avatar.style.removeProperty('--target-zoom-size');
          avatar.style.removeProperty('background-position');
          avatar.style.removeProperty('background-size');
          avatar.style.removeProperty('background-repeat');
          avatar.classList.remove('master-art-crop');
        }
        avatar.classList.add('has-art');
      };
      img.onerror=()=>avatar.classList.remove('has-art');
      img.src=path;
    };
    window.setTargetArtwork=replacement; try{setTargetArtwork=replacement;}catch(_){}
  }

  function injectStyles(){
    ['master-art-style-v059','master-art-style-v060','master-art-style-v061','master-art-style-v062','master-art-style-v063','master-art-style-v064','master-art-style-v065'].forEach(id=>document.getElementById(id)?.remove());
    const style=document.createElement('style'); style.id='master-art-style-v065';
    style.textContent=`
      .target-avatar.master-art-crop{background-size:var(--target-zoom-size,255%)!important;background-position:var(--target-focus,50% 14%)!important;background-repeat:no-repeat!important}
      .lane-character-preview.is-master-art{display:block!important;overflow:hidden!important;background-repeat:no-repeat!important;background-color:rgba(15,23,42,.35)}
      .gacha-pull-card.rarity-ur{overflow:hidden!important}
      .gacha-pull-card.rarity-ur img{width:100%!important;height:100%!important;max-width:none!important;position:absolute!important;inset:0!important;aspect-ratio:auto!important;object-fit:cover!important;object-position:var(--spot-focus,50% 9%)!important;border:0!important;border-radius:0!important;background:transparent!important;transform:scale(var(--spot-zoom,1.08))!important;transform-origin:center top!important}
      .gacha-pull-card.rarity-ur .gacha-rarity,.gacha-pull-card.rarity-ur .gacha-card-series,.gacha-pull-card.rarity-ur .gacha-card-name,.gacha-pull-card.rarity-ur .gacha-new{z-index:3!important}
      .gacha-ur-spotlight-image-wrap{overflow:hidden!important;padding:0!important}
      .gacha-ur-spotlight-image{width:100%!important;height:100%!important;object-fit:cover!important;object-position:var(--spot-focus,50% 9%)!important;background:transparent!important;transform:scale(var(--spot-zoom,1.08))!important;transform-origin:center top!important}
    `;
    document.head.appendChild(style);
  }

  function refreshGachaArt(root=document){
    const pool=window.GACHA_UR_POOL||[];
    root.querySelectorAll?.('.gacha-pull-card.rarity-ur img,.gacha-ur-spotlight-image').forEach(img=>{
      const name=String(img.alt||'').replace(/【[^】]+】$/u,'');
      const unit=pool.find(u=>String(u?.name||'').replace(/【[^】]+】$/u,'')===name);
      if(!unit?.art)return;
      const absolute=new URL(unit.art,location.href).href; if(img.src!==absolute)img.src=unit.art;
      img.style.setProperty('--spot-focus',unit.spotlightFocus||'50% 9%');
      img.style.setProperty('--spot-zoom',String(unit.spotlightZoom||1.08));
    });
  }

  updateVersionDisplay();applyMonthlyMasterArt();cleanGachaButton();installRoomRenderer();installLiveCrop();injectStyles();refreshGachaArt();
  const observer=new MutationObserver(()=>{cleanGachaButton();refreshGachaArt(document);}); observer.observe(document.body,{childList:true,subtree:true});
  window.refreshMonthlyMasterArt=function(){updateVersionDisplay();applyMonthlyMasterArt();installRoomRenderer();installLiveCrop();refreshGachaArt();try{if(typeof layoutPlayfield==='function')layoutPlayfield();}catch(_){}};
  setTimeout(window.refreshMonthlyMasterArt,0);
})();