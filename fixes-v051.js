// Ver.0.6.0: single master artwork per Monthly Song character.
(function(){
  const VERSION=window.APP_VERSION||'0.6.0';
  const MONTHLY_META={
    ayumu:{file:'ayumu.png',focus:'50% 22%'},kasumi:{file:'kasumi.png',focus:'50% 21%'},shizuku:{file:'shizuku.png',focus:'50% 21%'},karin:{file:'karin.png',focus:'50% 20%'},ai:{file:'ai.png',focus:'50% 20%'},kanata:{file:'kanata.png',focus:'50% 22%'},setsuna:{file:'setsuna.png',focus:'50% 20%'},emma:{file:'ema.png',focus:'50% 22%'},rina:{file:'rina.png',focus:'50% 20%'},shioriko:{file:'shioriko.png',focus:'50% 21%'},mia:{file:'mia.png',focus:'50% 20%'},lanzhu:{file:'lanzhu.png',focus:'50% 20%'}
  };
  window.MONTHLY_ART_META=MONTHLY_META;
  function applyMonthlyMasterArt(){
    (window.GACHA_UR_POOL||[]).forEach(unit=>{
      const meta=MONTHLY_META[unit?.baseId];if(!meta)return;
      const art=`assets/monthly-song-full/${meta.file}?v=${VERSION}`;
      unit.art=art;unit.icon=art;unit.home=art;unit.iconFocus=meta.focus;
      const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
      if(libUnit){Object.assign(libUnit,{name:unit.name,art,icon:art,home:art,iconFocus:meta.focus,rarity:unit.rarity,series:unit.series,baseId:unit.baseId});}
    });
  }
  function cleanGachaButton(){
    const current=document.getElementById('homeGachaBtn');if(!current||current.dataset.gachaClean051==='1')return;
    const clean=current.cloneNode(true);clean.dataset.gachaClean051='1';clean.onclick=null;current.replaceWith(clean);
    clean.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openGachaScreen==='function')window.openGachaScreen();});
  }
  function getRoomList(){if(typeof window.getRoomCharacters==='function'){const r=window.getRoomCharacters();if(Array.isArray(r)&&r.length)return r;}return window.CHARACTER_LIBRARY||[];}
  function characterById(id,list){return list.find(c=>c?.id===id)||list.find(c=>c?.id==='default')||list[0];}
  function installRoomRenderer(){
    const replacement=function(){
      const grid=document.getElementById('characterGrid'),available=getRoomList();if(!grid||!available.length)return;
      let saved;try{saved=JSON.parse(localStorage.getItem('rhythmGame.laneCharacters')||'null');}catch(_){saved=null;}
      if(!Array.isArray(saved)||saved.length!==9)saved=Array.from({length:9},()=> 'default');
      const ids=new Set(available.map(c=>c.id));saved=saved.map(id=>ids.has(id)?id:'default');grid.innerHTML='';
      saved.forEach((id,i)=>{const c=characterById(id,available),card=document.createElement('div');card.className='lane-character-card';
        const title=document.createElement('div');title.className='lane-character-title';title.textContent=`レーン ${i+1}`;
        const img=document.createElement('img');img.className='lane-character-preview is-master-art';img.alt=`レーン ${i+1} キャラ`;img.src=c?.art||c?.icon||'icon-192.png';img.onerror=()=>{img.src=c?.icon||'icon-192.png';};
        const select=document.createElement('select');select.className='lane-character-select';select.dataset.lane=String(i);
        available.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.name;option.selected=item.id===id;select.appendChild(option);});
        select.addEventListener('change',()=>{const s=characterById(select.value,available);img.src=s?.art||s?.icon||'icon-192.png';});card.append(title,img,select);grid.appendChild(card);});
      const status=document.getElementById('characterSaveStatus');if(status){const urOwned=available.filter(c=>c?.rarity==='UR').length;status.textContent=`音符ロリータは初期加入。マンスリーソングURは勧誘で獲得すると追加されます。（UR獲得 ${urOwned}/12）`;}
    };
    window.renderCharacterSelectors=replacement;try{renderCharacterSelectors=replacement;}catch(_){}
  }
  function installLiveCrop(){
    const replacement=function(avatar,path){if(!path)return;const normalized=String(path).split('?')[0];
      const unit=(window.CHARACTER_LIBRARY||[]).find(c=>[c?.art,c?.icon,c?.home].filter(Boolean).map(v=>String(v).split('?')[0]).includes(normalized));
      const focus=unit?.iconFocus||'50% 22%',img=new Image();img.onload=()=>{avatar.style.setProperty('--target-art',`url("${path}")`);avatar.style.setProperty('--target-focus',focus);avatar.style.backgroundPosition=focus;avatar.style.backgroundSize='cover';avatar.classList.add('has-art','master-art-crop');};img.onerror=()=>avatar.classList.remove('has-art');img.src=path;};
    window.setTargetArtwork=replacement;try{setTargetArtwork=replacement;}catch(_){}
  }
  function injectStyles(){if(document.getElementById('master-art-style-v060'))return;document.getElementById('master-art-style-v059')?.remove();const style=document.createElement('style');style.id='master-art-style-v060';style.textContent=`.target-avatar.master-art-crop{background-size:cover!important;background-position:var(--target-focus,50% 22%)!important;background-repeat:no-repeat!important}.lane-character-preview.is-master-art{object-fit:contain!important;object-position:center!important;background:rgba(15,23,42,.35)}.gacha-pull-card.rarity-ur img{width:min(86px,62%)!important;height:78%!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important;border-radius:10px!important;background:rgba(255,255,255,.76)!important}.gacha-ur-spotlight-image{object-fit:contain!important;object-position:center!important;background:rgba(255,255,255,.94)!important}`;document.head.appendChild(style);}
  function refreshGachaArt(root=document){const pool=window.GACHA_UR_POOL||[];root.querySelectorAll?.('.gacha-pull-card.rarity-ur img,.gacha-ur-spotlight-image').forEach(img=>{const name=String(img.alt||'').replace(/【[^】]+】$/u,''),unit=pool.find(u=>String(u?.name||'').replace(/【[^】]+】$/u,'')===name);if(unit?.art&&img.src!==new URL(unit.art,location.href).href)img.src=unit.art;});}
  applyMonthlyMasterArt();cleanGachaButton();installRoomRenderer();installLiveCrop();injectStyles();refreshGachaArt();
  const observer=new MutationObserver(()=>{cleanGachaButton();refreshGachaArt(document);});observer.observe(document.body,{childList:true,subtree:true});
  window.refreshMonthlyMasterArt=function(){applyMonthlyMasterArt();installRoomRenderer();installLiveCrop();refreshGachaArt();try{if(typeof layoutPlayfield==='function')layoutPlayfield();}catch(_){}};setTimeout(window.refreshMonthlyMasterArt,0);
})();