// Ver.0.6.2: upper-focused Monthly Song UR framing + tighter face-centered live icon crops.
(function(){
  const VERSION=window.APP_VERSION||'0.6.2';
  const MONTHLY_META={
    ayumu:{file:'ayumu.png',focus:'50% 12%',zoom:3.00,spotFocus:'50% 9%',spotZoom:1.08},
    kasumi:{file:'kasumi.png',focus:'50% 12%',zoom:3.05,spotFocus:'50% 9%',spotZoom:1.08},
    shizuku:{file:'shizuku.png',focus:'50% 12%',zoom:3.00,spotFocus:'50% 9%',spotZoom:1.08},
    karin:{file:'karin.png',focus:'50% 12%',zoom:3.00,spotFocus:'50% 9%',spotZoom:1.08},
    ai:{file:'ai.png',focus:'50% 12%',zoom:3.00,spotFocus:'50% 9%',spotZoom:1.08},
    kanata:{file:'kanata.png',focus:'50% 12%',zoom:2.95,spotFocus:'50% 9%',spotZoom:1.08},
    setsuna:{file:'setsuna.png',focus:'50% 14%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    emma:{file:'ema.png',focus:'50% 14%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    rina:{file:'rina.png',focus:'50% 14%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    shioriko:{file:'shioriko.png',focus:'50% 14%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    mia:{file:'mia.png',focus:'50% 14%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    lanzhu:{file:'lanzhu.png',focus:'50% 14%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08}
  };
  window.MONTHLY_ART_META=MONTHLY_META;

  function applyMonthlyMasterArt(){
    (window.GACHA_UR_POOL||[]).forEach(unit=>{
      const meta=MONTHLY_META[unit?.baseId]; if(!meta) return;
      const art=`assets/monthly-song-full/${meta.file}?v=${VERSION}`;
      Object.assign(unit,{art,icon:art,home:art,iconFocus:meta.focus,iconZoom:meta.zoom,spotlightFocus:meta.spotFocus,spotlightZoom:meta.spotZoom});
      const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
      if(libUnit){Object.assign(libUnit,{name:unit.name,art,icon:art,home:art,iconFocus:meta.focus,iconZoom:meta.zoom,spotlightFocus:meta.spotFocus,spotlightZoom:meta.spotZoom,rarity:unit.rarity,series:unit.series,baseId:unit.baseId});}
    });
  }

  function cleanGachaButton(){
    const current=document.getElementById('homeGachaBtn'); if(!current||current.dataset.gachaClean051==='1') return;
    const clean=current.cloneNode(true); clean.dataset.gachaClean051='1'; clean.onclick=null; current.replaceWith(clean);
    clean.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openGachaScreen==='function')window.openGachaScreen();});
  }
  function getRoomList(){if(typeof window.getRoomCharacters==='function'){const r=window.getRoomCharacters();if(Array.isArray(r)&&r.length)return r;}return window.CHARACTER_LIBRARY||[];}
  function characterById(id,list){return list.find(c=>c?.id===id)||list.find(c=>c?.id==='default')||list[0];}

  function installRoomRenderer(){
    const replacement=function(){
      const grid=document.getElementById('characterGrid'),available=getRoomList(); if(!grid||!available.length)return;
      let saved; try{saved=JSON.parse(localStorage.getItem('rhythmGame.laneCharacters')||'null');}catch(_){saved=null;}
      if(!Array.isArray(saved)||saved.length!==9)saved=Array.from({length:9},()=> 'default');
      const ids=new Set(available.map(c=>c.id)); saved=saved.map(id=>ids.has(id)?id:'default'); grid.innerHTML='';
      saved.forEach((id,i)=>{
        const c=characterById(id,available),card=document.createElement('div'); card.className='lane-character-card';
        const title=document.createElement('div'); title.className='lane-character-title'; title.textContent=`レーン ${i+1}`;
        const img=document.createElement('img'); img.className='lane-character-preview is-master-art'; img.alt=`レーン ${i+1} キャラ`; img.src=c?.art||c?.icon||'icon-192.png'; img.onerror=()=>{img.src=c?.icon||'icon-192.png';};
        const select=document.createElement('select'); select.className='lane-character-select'; select.dataset.lane=String(i);
        available.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;option.selected=item.id===id;select.appendChild(option);});
        select.addEventListener('change',()=>{const s=characterById(select.value,available);img.src=s?.art||s?.icon||'icon-192.png';});
        card.append(title,img,select);grid.appendChild(card);
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
      const focus=unit?.iconFocus||'50% 13%';
      const zoom=unit?.iconZoom||2.75;
      const img=new Image();
      img.onload=()=>{
        avatar.style.setProperty('--target-art',`url("${path}")`);
        avatar.style.setProperty('--target-focus',focus);
        avatar.style.setProperty('--target-zoom-size',`${Math.round(zoom*100)}%`);
        avatar.style.backgroundPosition=focus;
        avatar.style.backgroundSize=`${Math.round(zoom*100)}%`;
        avatar.style.backgroundRepeat='no-repeat';
        avatar.classList.add('has-art','master-art-crop');
      };
      img.onerror=()=>avatar.classList.remove('has-art');
      img.src=path;
    };
    window.setTargetArtwork=replacement; try{setTargetArtwork=replacement;}catch(_){}
  }

  function injectStyles(){
    document.getElementById('master-art-style-v059')?.remove();
    document.getElementById('master-art-style-v060')?.remove();
    document.getElementById('master-art-style-v061')?.remove();
    document.getElementById('master-art-style-v062')?.remove();
    const style=document.createElement('style'); style.id='master-art-style-v062';
    style.textContent=`
      .target-avatar.master-art-crop{background-size:var(--target-zoom-size,275%)!important;background-position:var(--target-focus,50% 13%)!important;background-repeat:no-repeat!important}
      .lane-character-preview.is-master-art{object-fit:contain!important;object-position:center!important;background:rgba(15,23,42,.35)}
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

  applyMonthlyMasterArt();cleanGachaButton();installRoomRenderer();installLiveCrop();injectStyles();refreshGachaArt();
  const observer=new MutationObserver(()=>{cleanGachaButton();refreshGachaArt(document);}); observer.observe(document.body,{childList:true,subtree:true});
  window.refreshMonthlyMasterArt=function(){applyMonthlyMasterArt();installRoomRenderer();installLiveCrop();refreshGachaArt();try{if(typeof layoutPlayfield==='function')layoutPlayfield();}catch(_){}};
  setTimeout(window.refreshMonthlyMasterArt,0);
})();