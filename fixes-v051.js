// Ver.0.5.9: final compatibility fixes + single-art character display architecture.
(function(){
  const VERSION=window.APP_VERSION||'0.5.9';

  function cleanGachaButton(){
    const current=document.getElementById('homeGachaBtn');
    if(!current||current.dataset.gachaClean051==='1') return;
    const clean=current.cloneNode(true);
    clean.dataset.gachaClean051='1';
    clean.onclick=null;
    current.replaceWith(clean);
    clean.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      if(typeof window.openGachaScreen==='function') window.openGachaScreen();
    });
  }

  // One master artwork per character. For now `art` falls back to the currently installed
  // Monthly Song image. When the new full-body originals are uploaded, only `art` needs replacing.
  const MONTHLY_META={
    ayumu:{focus:'50% 22%'},
    kasumi:{focus:'50% 21%'},
    shizuku:{focus:'50% 21%'},
    karin:{focus:'50% 20%'},
    ai:{focus:'50% 20%'},
    kanata:{focus:'50% 22%'},
    setsuna:{focus:'50% 20%'},
    emma:{focus:'50% 22%'},
    rina:{focus:'50% 20%'},
    shioriko:{focus:'50% 21%'},
    mia:{focus:'50% 20%'},
    lanzhu:{focus:'50% 20%'}
  };
  window.MONTHLY_ART_META=MONTHLY_META;

  function fixMonthlySong(){
    // Keep the Setsuna/Emma correction that predates the new master-art system.
    const fixes={
      setsuna:{name:'優木せつ菜【マンスリーソング】',icon:`assets/monthly-song/emma.webp?v=${VERSION}`},
      emma:{name:'エマ・ヴェルデ【マンスリーソング】',icon:`assets/monthly-song/setsuna.webp?v=${VERSION}`}
    };

    (window.GACHA_UR_POOL||[]).forEach(unit=>{
      const f=fixes[unit?.baseId];
      if(f){unit.name=f.name;unit.icon=f.icon;unit.home=f.icon;}
      const meta=MONTHLY_META[unit?.baseId]||{};
      unit.art=unit.art||unit.home||unit.icon;
      unit.iconFocus=meta.focus||'50% 22%';
      unit.home=unit.art;
      unit.icon=unit.art;
      const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
      if(libUnit){
        libUnit.name=unit.name;
        libUnit.art=unit.art;
        libUnit.icon=unit.art;
        libUnit.home=unit.art;
        libUnit.iconFocus=unit.iconFocus;
        libUnit.rarity=unit.rarity;
        libUnit.series=unit.series;
        libUnit.baseId=unit.baseId;
      }
    });
  }

  function getRoomList(){
    if(typeof window.getRoomCharacters==='function'){
      const result=window.getRoomCharacters();
      if(Array.isArray(result)&&result.length) return result;
    }
    return window.CHARACTER_LIBRARY||[];
  }

  function characterById(id,list){
    return list.find(c=>c?.id===id)||list.find(c=>c?.id==='default')||list[0];
  }

  function installRoomRenderer(){
    const replacement=function(){
      const grid=document.getElementById('characterGrid');
      const available=getRoomList();
      if(!grid||!Array.isArray(available)||!available.length) return;
      let saved;
      try{saved=JSON.parse(localStorage.getItem('rhythmGame.laneCharacters')||'null');}catch(_){saved=null;}
      if(!Array.isArray(saved)||saved.length!==9) saved=Array.from({length:9},()=> 'default');
      const ids=new Set(available.map(c=>c.id));
      saved=saved.map(id=>ids.has(id)?id:'default');
      grid.innerHTML='';
      saved.forEach((id,i)=>{
        const c=characterById(id,available);
        const card=document.createElement('div');
        card.className='lane-character-card';
        const title=document.createElement('div');
        title.className='lane-character-title';
        title.textContent=`レーン ${i+1}`;
        const img=document.createElement('img');
        img.className='lane-character-preview is-master-art';
        img.alt=`レーン ${i+1} キャラ`;
        img.src=c?.art||c?.icon||'icon-192.png';
        img.onerror=()=>{img.src=c?.icon||'icon-192.png';};
        const select=document.createElement('select');
        select.className='lane-character-select';
        select.dataset.lane=String(i);
        available.forEach(item=>{
          const option=document.createElement('option');
          option.value=item.id;
          option.textContent=item.name;
          option.selected=item.id===id;
          select.appendChild(option);
        });
        select.addEventListener('change',()=>{
          const selected=characterById(select.value,available);
          img.src=selected?.art||selected?.icon||'icon-192.png';
        });
        card.append(title,img,select);
        grid.appendChild(card);
      });
      const status=document.getElementById('characterSaveStatus');
      if(status){
        const urOwned=available.filter(c=>c?.rarity==='UR').length;
        status.textContent=`音符ロリータは初期加入。マンスリーソングURは勧誘で獲得すると追加されます。（UR獲得 ${urOwned}/12）`;
      }
    };
    window.renderCharacterSelectors=replacement;
    try{renderCharacterSelectors=replacement;}catch(_){}
  }

  // Live circles use the very same master artwork, but crop around face/hair.
  function installLiveCrop(){
    const original=window.setTargetArtwork||(()=>{});
    const replacement=function(avatar,path){
      if(!path) return;
      const normalized=String(path).split('?')[0];
      const unit=(window.CHARACTER_LIBRARY||[]).find(c=>{
        const candidates=[c?.art,c?.icon,c?.home].filter(Boolean).map(v=>String(v).split('?')[0]);
        return candidates.includes(normalized);
      });
      const focus=unit?.iconFocus||'50% 22%';
      const img=new Image();
      img.onload=()=>{
        avatar.style.setProperty('--target-art',`url("${path}")`);
        avatar.style.setProperty('--target-focus',focus);
        avatar.style.backgroundPosition=focus;
        avatar.style.backgroundSize='cover';
        avatar.classList.add('has-art','master-art-crop');
      };
      img.onerror=()=>avatar.classList.remove('has-art');
      img.src=path;
    };
    window.setTargetArtwork=replacement;
    try{setTargetArtwork=replacement;}catch(_){}
  }

  function injectStyles(){
    if(document.getElementById('master-art-style-v059')) return;
    const style=document.createElement('style');
    style.id='master-art-style-v059';
    style.textContent=`
      .target-avatar.master-art-crop{background-size:cover!important;background-position:var(--target-focus,50% 22%)!important;background-repeat:no-repeat!important}
      .lane-character-preview.is-master-art{object-fit:contain!important;object-position:center center!important;background:rgba(15,23,42,.35)}
      .gacha-pull-card.rarity-ur img{width:min(78px,58%)!important;height:auto!important;aspect-ratio:3/4!important;object-fit:contain!important;object-position:center!important;border-radius:10px!important;background:rgba(255,255,255,.76)!important}
      .gacha-ur-spotlight-image{object-fit:contain!important;object-position:center!important;background:rgba(255,255,255,.94)!important}
    `;
    document.head.appendChild(style);
  }

  function refreshGachaArt(root=document){
    const pool=window.GACHA_UR_POOL||[];
    root.querySelectorAll?.('.gacha-pull-card.rarity-ur img,.gacha-ur-spotlight-image').forEach(img=>{
      const name=String(img.alt||'').replace(/【[^】]+】$/u,'');
      const unit=pool.find(u=>String(u?.name||'').replace(/【[^】]+】$/u,'')===name);
      if(unit?.art&&img.src!==new URL(unit.art,location.href).href) img.src=unit.art;
    });
  }

  fixMonthlySong();
  cleanGachaButton();
  installRoomRenderer();
  installLiveCrop();
  injectStyles();
  refreshGachaArt();

  const observer=new MutationObserver(records=>{
    cleanGachaButton();
    refreshGachaArt(document);
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.refreshMonthlyMasterArt=function(){
    fixMonthlySong();
    installRoomRenderer();
    installLiveCrop();
    refreshGachaArt();
    try{if(typeof layoutPlayfield==='function') layoutPlayfield();}catch(_){}
  };
  setTimeout(window.refreshMonthlyMasterArt,0);
})();