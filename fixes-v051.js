// Ver.0.6.7: song library + Snow halation + local custom song registration.
(function(){
  const VERSION=window.APP_VERSION || '0.8.15';
  const MONTHLY_META={
    ayumu:{file:'ayumu.png',focus:'50% 4%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    kasumi:{file:'kasumi.png',focus:'50% 11%',zoom:3.85,spotFocus:'50% 9%',spotZoom:1.08},
    shizuku:{file:'shizuku.png',focus:'50% 4%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    karin:{file:'karin.png',focus:'50% 4%',zoom:3.85,spotFocus:'50% 0%',spotZoom:1.00},
    ai:{file:'ai.png',focus:'50% 6%',zoom:3.00,spotFocus:'50% 0%',spotZoom:1.00},
    kanata:{file:'kanata.png',focus:'47% 5%',zoom:3.75,spotFocus:'50% 0%',spotZoom:1.00},
    setsuna:{file:'setsuna.png',focus:'50% 14%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    emma:{file:'ema.png',focus:'58% 8%',zoom:2.50,spotFocus:'50% 10%',spotZoom:1.08},
    rina:{file:'rina.png',focus:'55% 10%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    shioriko:{file:'shioriko.png',focus:'50% 7%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    mia:{file:'mia.png',focus:'53% 8%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08},
    lanzhu:{file:'lanzhu.png',focus:'58% 8%',zoom:2.55,spotFocus:'50% 10%',spotZoom:1.08}
  };
  window.MONTHLY_ART_META=MONTHLY_META;

  function updateVersionDisplay(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const v=`Ver. ${VERSION}`;if(el.textContent!==v)el.textContent=v;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head){const v=`Ver.${VERSION} アップデート`;if(head.textContent!==v)head.textContent=v;}
    const text=document.querySelector('#updateBanner .update-text');
    const msg='楽曲一覧・楽曲追加ページを追加し、Snow halationを新しいプレイ楽曲として追加しました。';
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
    ['master-art-style-v059','master-art-style-v060','master-art-style-v061','master-art-style-v062','master-art-style-v063','master-art-style-v064','master-art-style-v065','master-art-style-v066','master-art-style-v067'].forEach(id=>document.getElementById(id)?.remove());
    const style=document.createElement('style'); style.id='master-art-style-v067';
    style.textContent=`
      .target-avatar.master-art-crop{background-size:var(--target-zoom-size,255%)!important;background-position:var(--target-focus,50% 14%)!important;background-repeat:no-repeat!important}
      .lane-character-preview.is-master-art{display:block!important;overflow:hidden!important;background-repeat:no-repeat!important;background-color:rgba(15,23,42,.35)}
      .gacha-pull-card.rarity-ur{overflow:hidden!important}
      .gacha-pull-card.rarity-ur img{width:100%!important;height:100%!important;max-width:none!important;position:absolute!important;inset:0!important;aspect-ratio:auto!important;object-fit:cover!important;object-position:var(--spot-focus,50% 9%)!important;border:0!important;border-radius:0!important;background:transparent!important;transform:scale(var(--spot-zoom,1.08))!important;transform-origin:center top!important}
      .gacha-pull-card.rarity-ur .gacha-rarity,.gacha-pull-card.rarity-ur .gacha-card-series,.gacha-pull-card.rarity-ur .gacha-card-name,.gacha-pull-card.rarity-ur .gacha-new{z-index:3!important}
      .gacha-ur-spotlight-image-wrap{overflow:hidden!important;padding:0!important}
      .gacha-ur-spotlight-image{width:100%!important;height:100%!important;object-fit:cover!important;object-position:var(--spot-focus,50% 9%)!important;background:transparent!important;transform:scale(var(--spot-zoom,1.08))!important;transform-origin:center top!important}
      .song-library-panel{max-width:900px;margin:0 auto;padding:18px}.song-library-actions{display:flex;justify-content:flex-end;margin-bottom:14px}.song-library-add{padding:12px 18px;border-radius:12px;font-weight:700}.song-library-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.song-library-card{border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px;background:rgba(17,24,39,.78);box-shadow:0 8px 22px rgba(0,0,0,.2)}.song-library-card h3{margin:0 0 5px;font-size:1.08rem}.song-library-card p{margin:4px 0;color:#cbd5e1;font-size:.9rem}.song-library-card button{width:100%;margin-top:12px;padding:11px;border-radius:10px;font-weight:700}.song-library-badge{display:inline-block;margin-top:6px;padding:3px 8px;border-radius:999px;background:rgba(59,130,246,.22);font-size:.78rem}.song-add-form{display:grid;gap:14px;max-width:700px;margin:0 auto}.song-add-form label{display:grid;gap:6px;font-weight:700}.song-add-form input{padding:10px;border-radius:10px}.song-add-help{color:#cbd5e1;font-size:.9rem}.song-add-status{min-height:1.4em;font-weight:700}.song-add-submit{padding:13px;border-radius:12px;font-weight:700}
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

  const CUSTOM_SONGS_KEY='rhythmGame.customSongs.v1';
  const SNOW_AUDIO_KEY='snow-halation';

  function readCustomSongs(){
    try{const v=JSON.parse(localStorage.getItem(CUSTOM_SONGS_KEY)||'[]');return Array.isArray(v)?v:[];}catch(_){return [];}
  }
  function saveCustomSongs(list){localStorage.setItem(CUSTOM_SONGS_KEY,JSON.stringify(list));}
  function showLibraryScreen(id){
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!==id;});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
  }
  function makeSnowHalationChart(){
    const bpm=173,beat=60000/bpm,half=beat/2,start=815,end=247751;
    const gridCount=Math.floor((end-start)/half)+1;
    const eventCount=900;
    const eventTimes=[];
    for(let i=0;i<eventCount;i++){
      const gi=Math.min(gridCount-1,Math.floor(i*gridCount/eventCount));
      eventTimes.push(Math.round(start+gi*half));
    }
    const notes=[];
    const lanePattern=[4,5,6,7,8,7,6,5,4,3,2,1,0,1,2,3];
    eventTimes.forEach((t,i)=>{
      const lane=lanePattern[i%lanePattern.length];
      notes.push({timeMs:t,lane});
      if(i%2===0){
        let other=8-lane;
        if(other===lane)other=(lane+3)%9;
        notes.push({timeMs:t,lane:other});
      }
    });
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    return {title:'Snow halation',artist:"μ's",difficulty:'EXPERT 二本指向け',bpm,offsetMs:0,noteCount:notes.length,notes};
  }
  async function prepareSnowHalation(){
    chart=makeSnowHalationChart();
    validateChart(chart);
    chartName.textContent=`Snow halation（${chart.notes.length} notes）`;
    offsetInput.value=String(getSavedTimingOffset());
    audioMode.value='file';
    showLibraryScreen('liveScreen');
    try{
      const cached=await getPresetAudio(SNOW_AUDIO_KEY);
      if(cached&&usePresetAudio(cached,'Snow halation')){canStart();return;}
    }catch(e){console.warn('Snow halationの保存済み音源を読み込めませんでした',e);}
    awaitingPresetAudioKey=SNOW_AUDIO_KEY;
    songName.textContent='Snow halation（初回のみ音源ファイルを選択してください）';
    audioFile.click();
    canStart();
  }
  async function prepareSpicaFromLibrary(){
    showLibraryScreen('liveScreen');
    document.getElementById('spicaPresetBtn')?.click();
  }
  async function prepareCustomSong(song){
    try{
      chart=JSON.parse(JSON.stringify(song.chart));
      validateChart(chart);
      chartName.textContent=`${song.title}（${chart.notes.length} notes）`;
      offsetInput.value=String(getSavedTimingOffset());
      audioMode.value='file';
      showLibraryScreen('liveScreen');
      const cached=await getPresetAudio(song.audioKey);
      if(!cached){alert('この楽曲の保存済み音源が見つかりません。楽曲をもう一度追加してください。');return;}
      usePresetAudio(cached,song.title);
      canStart();
    }catch(e){alert('楽曲を読み込めませんでした: '+e.message);}
  }

  function buildSongCard(song,custom=false){
    const card=document.createElement('article');card.className='song-library-card';
    const title=document.createElement('h3');title.textContent=song.title;
    const artist=document.createElement('p');artist.textContent=song.artist||'アーティスト未設定';
    const meta=document.createElement('p');meta.textContent=`${song.difficulty||'EXPERT'}${song.bpm?` / BPM ${song.bpm}`:''}`;
    const badge=document.createElement('span');badge.className='song-library-badge';badge.textContent=custom?'端末追加':'内蔵楽曲';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';
    if(song.id==='spica')btn.addEventListener('click',prepareSpicaFromLibrary);
    else if(song.id==='snow')btn.addEventListener('click',prepareSnowHalation);
    else btn.addEventListener('click',()=>prepareCustomSong(song));
    card.append(title,artist,meta,badge,btn);return card;
  }
  function renderSongLibrary(){
    const grid=document.getElementById('songLibraryGrid');if(!grid)return;grid.innerHTML='';
    grid.append(buildSongCard({id:'spica',title:'スピカテリブル',artist:'南ことり',difficulty:'EXPERT 二本指向け',bpm:161.499}));
    grid.append(buildSongCard({id:'snow',title:'Snow halation',artist:"μ's",difficulty:'EXPERT 二本指向け',bpm:173}));
    readCustomSongs().forEach(song=>grid.append(buildSongCard(song,true)));
  }

  function installSongLibrary(){
    if(document.getElementById('songLibraryScreen'))return;
    const shell=document.querySelector('.app-shell');if(!shell)return;
    const list=document.createElement('section');list.id='songLibraryScreen';list.className='app-screen';list.hidden=true;
    list.innerHTML=`<div class="screen-header"><button id="songLibraryHomeBtn" class="home-back-btn" type="button">ホーム</button><h1>楽曲一覧</h1></div><div class="song-library-panel"><div class="song-library-actions"><button id="openSongAddBtn" class="song-library-add" type="button">＋ 楽曲追加</button></div><div id="songLibraryGrid" class="song-library-grid"></div></div>`;
    const add=document.createElement('section');add.id='songAddScreen';add.className='app-screen';add.hidden=true;
    add.innerHTML=`<div class="screen-header"><button id="songAddBackBtn" class="home-back-btn" type="button">楽曲一覧</button><h1>楽曲追加</h1></div><div class="song-library-panel"><div class="song-add-form"><p class="song-add-help">音源ファイルと、このゲーム用の譜面JSONを端末に登録します。登録後は楽曲一覧から選べます。</p><label>楽曲名<input id="songAddTitle" type="text" placeholder="例：新しい楽曲" /></label><label>アーティスト<input id="songAddArtist" type="text" placeholder="例：μ's" /></label><label>音源ファイル<input id="songAddAudio" type="file" accept="audio/*,video/mp4,.mp4,.m4a,.mp3,.wav" /></label><label>譜面JSON<input id="songAddChart" type="file" accept="application/json,.json" /></label><button id="songAddSubmit" class="song-add-submit" type="button">この楽曲を追加</button><div id="songAddStatus" class="song-add-status"></div></div></div>`;
    shell.append(list,add);

    const homeLive=document.getElementById('homeLiveBtn');
    if(homeLive&&!homeLive.dataset.songLibraryNav){
      homeLive.dataset.songLibraryNav='1';
      homeLive.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();renderSongLibrary();showLibraryScreen('songLibraryScreen');},true);
    }
    document.getElementById('songLibraryHomeBtn')?.addEventListener('click',()=>showLibraryScreen('homeScreen'));
    document.getElementById('openSongAddBtn')?.addEventListener('click',()=>showLibraryScreen('songAddScreen'));
    document.getElementById('songAddBackBtn')?.addEventListener('click',()=>{renderSongLibrary();showLibraryScreen('songLibraryScreen');});
    document.getElementById('songAddChart')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{const parsed=JSON.parse(await file.text());if(!document.getElementById('songAddTitle').value&&parsed.title)document.getElementById('songAddTitle').value=parsed.title;if(!document.getElementById('songAddArtist').value&&parsed.artist)document.getElementById('songAddArtist').value=parsed.artist;}catch(_){}
    });
    document.getElementById('songAddSubmit')?.addEventListener('click',async()=>{
      const title=document.getElementById('songAddTitle').value.trim();
      const artist=document.getElementById('songAddArtist').value.trim();
      const audioFileLocal=document.getElementById('songAddAudio').files?.[0];
      const chartFileLocal=document.getElementById('songAddChart').files?.[0];
      const status=document.getElementById('songAddStatus');
      if(!title||!audioFileLocal||!chartFileLocal){status.textContent='楽曲名・音源・譜面JSONをすべて指定してください。';return;}
      try{
        const parsed=JSON.parse(await chartFileLocal.text());validateChart(parsed);
        const id=`custom-${Date.now()}`,audioKey=`custom-song:${id}`;
        await savePresetAudio(audioKey,audioFileLocal);
        const songs=readCustomSongs();songs.push({id,title,artist:artist||parsed.artist||'',difficulty:parsed.difficulty||'CUSTOM',bpm:parsed.bpm||null,audioKey,chart:parsed});saveCustomSongs(songs);
        status.textContent='追加しました。楽曲一覧からプレイできます。';
        document.getElementById('songAddTitle').value='';document.getElementById('songAddArtist').value='';document.getElementById('songAddAudio').value='';document.getElementById('songAddChart').value='';
        renderSongLibrary();setTimeout(()=>showLibraryScreen('songLibraryScreen'),500);
      }catch(e){status.textContent='追加できませんでした: '+e.message;}
    });
    renderSongLibrary();
  }

  updateVersionDisplay();applyMonthlyMasterArt();cleanGachaButton();installRoomRenderer();installLiveCrop();injectStyles();refreshGachaArt();installSongLibrary();
  const observer=new MutationObserver(()=>{cleanGachaButton();refreshGachaArt(document);}); observer.observe(document.body,{childList:true,subtree:true});
  window.refreshMonthlyMasterArt=function(){updateVersionDisplay();applyMonthlyMasterArt();installRoomRenderer();installLiveCrop();refreshGachaArt();try{if(typeof layoutPlayfield==='function')layoutPlayfield();}catch(_){}};
  setTimeout(window.refreshMonthlyMasterArt,0);
})();