// Ver.0.8.233: deduplicate songs and derive BPM/NOTES/★ from latest chart data.
(function(){
  const VERSION='0.8.233';
  const state={songs:[],filtered:[],index:0,category:'all',syncQueued:false};
  const CATEGORY_LABELS=[
    ['all','ALL'],['muse',"μ's"],['aqours','Aqours'],['nijigasaki','虹ヶ咲'],['liella','Liella!'],['custom','追加曲']
  ];
  const KNOWN={
    'スピカテリブル':{category:'muse',palette:['#5b67d8','#a55fcb','#71c9ee']},
    'Snow halation':{category:'muse',palette:['#73c9f4','#f7b6cf','#6078c8']},
    'HAPPY PARTY TRAIN':{category:'aqours',palette:['#eb9a3a','#2c9c9d','#214c78']},
    'Boooooom Boooooom Bee!!':{category:'nijigasaki',palette:['#ea5b98','#efb835','#6e4fc2']}
  };

  function categoryFor(title,artist,badge){
    if(String(badge).includes('端末'))return 'custom';
    if(KNOWN[title]?.category)return KNOWN[title].category;
    const a=String(artist||'');
    if(a.includes('Aqours'))return 'aqours';
    if(a.includes('虹ヶ咲'))return 'nijigasaki';
    if(a.includes('Liella'))return 'liella';
    if(a.includes("μ's")||title==='スピカテリブル')return 'muse';
    return 'custom';
  }
  function paletteFor(title){
    if(KNOWN[title]?.palette)return KNOWN[title].palette;
    let h=0;for(const ch of String(title))h=(h*31+ch.charCodeAt(0))%360;
    return [`hsl(${h} 68% 55%)`,`hsl(${(h+52)%360} 62% 46%)`,`hsl(${(h+210)%360} 58% 32%)`];
  }
  function parseMeta(text){
    const s=String(text||'');
    const bpm=(s.match(/BPM\s*([0-9.]+)/i)||[])[1]||'--';
    const difficulty=(s.split('/')[0]||'EXPERT').trim();
    return {bpm,difficulty};
  }
  function chartStats(chart){
    if(!chart||!Array.isArray(chart.notes)||!chart.notes.length)return null;
    const notes=chart.notes.length;
    const holds=chart.notes.filter(n=>Number.isFinite(n.holdEndMs)).length;
    const first=chart.notes[0]?.timeMs??0;
    const last=Math.max(...chart.notes.map(n=>Number.isFinite(n.holdEndMs)?n.holdEndMs:n.timeMs));
    const durationSec=Math.max(1,(last-first)/1000);
    const density=notes/durationSec;
    const effective=notes+holds*2+Math.round(density*20);
    let stars=5;
    if(effective>=1650)stars=13;
    else if(effective>=1500)stars=12;
    else if(effective>=1350)stars=11;
    else if(effective>=1200)stars=10;
    else if(effective>=1050)stars=9;
    else if(effective>=850)stars=8;
    else if(effective>=650)stars=7;
    else if(effective>=450)stars=6;
    return {notes,holds,bpm:Number(chart.bpm)||null,durationSec,density,level:`★${stars}`};
  }

  function latestChartFor(title){
    try{
      if(title==='Snow halation'&&typeof window.makeSnowHalationChartV0829==='function')return window.makeSnowHalationChartV0829();
      if(title==='Boooooom Boooooom Bee!!'&&typeof window.makeBoooooomBeeChartV077==='function')return window.makeBoooooomBeeChartV077();
      if(title==='Dazzling Game'&&typeof window.makeDazzlingGameChartV0841==='function')return window.makeDazzlingGameChartV0841();
      if(title==='眩耀夜行'&&typeof window.makeGenyoYakoChartV0839==='function')return window.makeGenyoYakoChartV0839();
      if(title==='HAPPY PARTY TRAIN'&&typeof window.makeHappyPartyTrainChartV0838==='function')return window.makeHappyPartyTrainChartV0838();
    }catch(e){console.warn('最新版譜面メタデータの取得に失敗:',title,e);}
    return null;
  }

  async function refreshSpicaMeta(){
    const song=state.songs.find(s=>s.title==='スピカテリブル');
    if(!song||typeof window.makeSpicaMasterReferenceChart!=='function')return;
    try{
      const res=await fetch(`charts/spica-terrible.json?v=${window.APP_VERSION||''}&t=${Date.now()}`,{cache:'no-store'});
      if(!res.ok)return;
      const raw=await res.json();
      const chart=window.makeSpicaMasterReferenceChart(raw);
      const stats=chartStats(chart);
      if(!stats)return;
      song.notes=String(stats.notes);song.level=stats.level;
      if(stats.bpm)song.bpm=String(stats.bpm);
      render();
    }catch(e){console.warn('スピカテリブルのメタデータ取得に失敗',e);}
  }

  function collectSongs(){
    const grid=document.getElementById('songLibraryGrid');
    if(!grid)return [];
    const mapped=[...grid.querySelectorAll('.song-library-card')].map((card,i)=>{
      const title=card.querySelector('h3')?.textContent?.trim()||`楽曲 ${i+1}`;
      const ps=card.querySelectorAll('p');
      const artist=ps[0]?.textContent?.trim()||'アーティスト未設定';
      const meta=parseMeta(ps[1]?.textContent);
      const badge=card.querySelector('.song-library-badge')?.textContent?.trim()||'';
      const button=card.querySelector('button');
      const known=KNOWN[title]||{};
      const jacket=card.dataset.jacket||known.jacket||'';
      const chart=latestChartFor(title);
      const stats=chartStats(chart);
      return {
        id:card.dataset.song075||card.dataset.songId||`${title}:${i}`,
        title,artist,
        bpm:stats?.bpm?String(stats.bpm):meta.bpm,
        difficulty:chart?.difficulty||meta.difficulty,
        badge,hasLaunchButton:!!button,
        category:categoryFor(title,artist,badge),
        notes:stats?String(stats.notes):'--',
        level:stats?.level||'★--',
        holds:stats?.holds??null,
        palette:paletteFor(title),jacket,
        _sourceIndex:i
      };
    }).filter(s=>s.hasLaunchButton);

    // One visible entry per song title. Prefer the newest source card.
    const unique=new Map();
    for(const song of mapped){
      const key=String(song.title).trim().toLowerCase();
      const prev=unique.get(key);
      if(!prev||song._sourceIndex>=prev._sourceIndex)unique.set(key,song);
    }
    return [...unique.values()].map(({_sourceIndex,...song})=>song);
  }

  function ensureUI(){
    const screen=document.getElementById('songLibraryScreen');
    const panel=screen?.querySelector('.song-library-panel');
    const grid=document.getElementById('songLibraryGrid');
    if(!screen||!panel||!grid)return null;
    screen.classList.add('song-select-screen');
    const oldActions=panel.querySelector('.song-library-actions');if(oldActions)oldActions.hidden=true;
    grid.classList.add('song-library-source');
    if(document.getElementById('songSelectUI'))return document.getElementById('songSelectUI');
    const ui=document.createElement('div');ui.id='songSelectUI';ui.className='song-select-ui';
    ui.innerHTML=`
      <div class="song-select-toprow">
        <div id="songCategoryTabs" class="song-category-tabs" aria-label="楽曲カテゴリ"></div>
        <button id="songSelectAdd" class="song-select-add" type="button">＋ 楽曲追加</button>
      </div>
      <div class="song-difficulty-tabs" aria-label="難易度">
        <button type="button" disabled>EASY</button><button type="button" disabled>NORMAL</button><button type="button" disabled>HARD</button><button type="button" class="active">EXPERT</button>
      </div>
      <div id="songSelectStage" class="song-select-stage">
        <div class="song-select-glow"></div>
        <button id="songPrev" class="song-nav song-nav-prev" type="button" aria-label="前の曲">‹</button>
        <div id="songCarousel" class="song-carousel" aria-live="polite"></div>
        <button id="songNext" class="song-nav song-nav-next" type="button" aria-label="次の曲">›</button>
      </div>
      <div id="songInfo" class="song-info-panel">
        <div class="song-info-main"><div id="songInfoTitle" class="song-info-title">楽曲を選択</div><div id="songInfoArtist" class="song-info-artist"></div></div>
        <div class="song-info-stats"><span id="songInfoLevel">★--</span><span id="songInfoBpm">BPM --</span><span id="songInfoNotes">NOTES --</span></div>
        <button id="songLiveStart" class="song-live-start" type="button">LIVE START</button>
      </div>
    `;
    panel.prepend(ui);
    document.getElementById('songSelectAdd')?.addEventListener('click',()=>document.getElementById('openSongAddBtn')?.click());
    document.getElementById('songPrev')?.addEventListener('click',()=>move(-1));
    document.getElementById('songNext')?.addEventListener('click',()=>move(1));
    document.getElementById('songLiveStart')?.addEventListener('click',()=>{
      const song=state.filtered[state.index];
      if(!song)return;

      // Snow halation must always launch the latest chart directly.
      // Do not route through a possibly stale/duplicated hidden source card.
      if(song.title==='Snow halation' && typeof window.prepareSnowHalationV0829==='function'){ window.prepareSnowHalationV0829(); return; }
      if(song.title==='Boooooom Boooooom Bee!!' && typeof window.prepareBoooooomBeeV077==='function'){ window.prepareBoooooomBeeV077(); return; }
      if(song.title==='Dazzling Game' && typeof window.prepareDazzlingGameV0841==='function'){ window.prepareDazzlingGameV0841(); return; }
      if(song.title==='眩耀夜行' && typeof window.prepareGenyoYakoV0839==='function'){ window.prepareGenyoYakoV0839(); return; }

      const grid=document.getElementById('songLibraryGrid');
      if(!grid)return;
      const cards=[...grid.querySelectorAll('.song-library-card')];
      const liveCard=cards.find(card=>{
        const id=card.dataset.song075||card.dataset.songId||'';
        const title=card.querySelector('h3')?.textContent?.trim()||'';
        return String(id)===String(song.id)&&title===song.title;
      }) || cards.find(card=>card.querySelector('h3')?.textContent?.trim()===song.title);
      const liveButton=liveCard?.querySelector('button');
      if(!liveButton){
        console.warn('選択中の楽曲起動ボタンが見つかりません',song);
        return;
      }
      liveButton.click();
    });
    let startX=null;
    const carousel=document.getElementById('songCarousel');
    carousel?.addEventListener('pointerdown',e=>{startX=e.clientX;});
    carousel?.addEventListener('pointerup',e=>{if(startX===null)return;const dx=e.clientX-startX;startX=null;if(Math.abs(dx)>42)move(dx<0?1:-1);});
    carousel?.addEventListener('pointercancel',()=>{startX=null;});
    return ui;
  }
  function renderTabs(){
    const root=document.getElementById('songCategoryTabs');if(!root)return;
    root.innerHTML='';
    CATEGORY_LABELS.forEach(([id,label])=>{
      const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.category=id;b.classList.toggle('active',state.category===id);
      b.addEventListener('click',()=>{state.category=id;state.index=0;applyFilter();});
      root.appendChild(b);
    });
  }
  function applyFilter(preserveTitle){
    state.filtered=state.category==='all'?state.songs.slice():state.songs.filter(s=>s.category===state.category);
    if(preserveTitle){const idx=state.filtered.findIndex(s=>s.title===preserveTitle);if(idx>=0)state.index=idx;}
    if(state.index>=state.filtered.length)state.index=Math.max(0,state.filtered.length-1);
    renderTabs();render();
  }
  function move(delta){
    const n=state.filtered.length;if(!n)return;
    state.index=(state.index+delta+n)%n;render();
  }
  function relPosition(i,n){
    let d=i-state.index;
    if(n>2){if(d>n/2)d-=n;if(d<-n/2)d+=n;}
    return Math.max(-2,Math.min(2,d));
  }
  function render(){
    const carousel=document.getElementById('songCarousel');
    const start=document.getElementById('songLiveStart');
    if(!carousel)return;
    carousel.innerHTML='';
    if(!state.filtered.length){
      const empty=document.createElement('div');empty.className='song-select-empty';empty.textContent='このカテゴリの楽曲はまだありません';carousel.appendChild(empty);
      if(start)start.disabled=true;updateInfo(null);return;
    }
    if(start)start.disabled=false;
    state.filtered.forEach((song,i)=>{
      let pos=relPosition(i,state.filtered.length);
      if(Math.abs(pos)>2)return;
      const btn=document.createElement('button');btn.type='button';btn.className=`song-jacket pos-${pos<0?'m'+Math.abs(pos):'p'+pos}${i===state.index?' selected':''}`;
      btn.style.setProperty('--j1',song.palette[0]);btn.style.setProperty('--j2',song.palette[1]);btn.style.setProperty('--j3',song.palette[2]);
      btn.setAttribute('aria-label',`${song.title}を選択`);
      btn.innerHTML=`${song.jacket?`<img class="song-jacket-art" src="${escapeHtml(song.jacket)}" alt="">`:''}<span class="jacket-orbit"></span><span class="jacket-series">${escapeHtml(song.artist)}</span><strong>${escapeHtml(song.title)}</strong><small>${song.category==='custom'?'LOCAL SONG':'LOVE FEST!'}</small>`;
      if(song.jacket)btn.classList.add('has-jacket-art');
      btn.addEventListener('click',()=>{state.index=i;render();});
      carousel.appendChild(btn);
    });
    const song=state.filtered[state.index];
    const stage=document.getElementById('songSelectStage');
    if(stage&&song){stage.style.setProperty('--song-glow-1',song.palette[0]);stage.style.setProperty('--song-glow-2',song.palette[1]);}
    updateInfo(song);
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function updateInfo(song){
    const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text||'';};
    if(!song){set('songInfoTitle','楽曲を選択');set('songInfoArtist','');set('songInfoLevel','★--');set('songInfoBpm','BPM --');set('songInfoNotes','NOTES --');return;}
    set('songInfoTitle',song.title);set('songInfoArtist',song.artist);set('songInfoLevel',song.level);set('songInfoBpm',`BPM ${song.bpm}`);set('songInfoNotes',`NOTES ${song.notes}`);
  }
  function sync(){
    state.syncQueued=false;
    if(!ensureUI())return;
    const current=state.filtered[state.index]?.title;
    state.songs=collectSongs();
    applyFilter(current);
    refreshSpicaMeta();
  }
  function queueSync(){if(state.syncQueued)return;state.syncQueued=true;requestAnimationFrame(sync);}
  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>el.textContent=`Ver. ${VERSION}`);
    const head=document.querySelector('#updateBanner .update-head span:last-child');if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');if(text)text.textContent='楽曲選択画面を、ジャケットを横にめくって選べる新しいカルーセルUIに刷新しました。';
  }
  function install(){
    const grid=document.getElementById('songLibraryGrid');
    if(!grid){setTimeout(install,50);return;}
    ensureUI();sync();
    new MutationObserver(queueSync).observe(grid,{childList:true,subtree:true});
    const screen=document.getElementById('songLibraryScreen');
    if(screen)new MutationObserver(()=>{if(!screen.hidden)queueSync();}).observe(screen,{attributes:true,attributeFilter:['hidden']});
    syncVersion();
  }
  install();
})();
