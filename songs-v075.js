// Ver.0.7.5: add HAPPY PARTY TRAIN and Boooooom Boooooom Bee!! as built-in charts.
(function(){
  const VERSION='0.7.5';
  const HPT_AUDIO_KEY='happy-party-train';
  const BOOM_AUDIO_KEY='boooooom-bee';

  function makeChart({title,artist,bpm,startMs,endMs,mask,chordEvery,laneSeed}){
    const halfBeat=30000/bpm;
    const notes=[];
    const lanePattern=[4,5,6,7,8,7,6,5,4,3,2,1,0,1,2,3];
    let eventIndex=0;
    let gridIndex=0;
    for(let t=startMs;t<=endMs;t+=halfBeat,gridIndex++){
      if(!mask[gridIndex%mask.length])continue;
      const lane=lanePattern[(eventIndex+laneSeed)%lanePattern.length];
      notes.push({timeMs:Math.round(t),lane});
      if(eventIndex%chordEvery===0){
        let other=8-lane;
        if(other===lane)other=(lane+4)%9;
        notes.push({timeMs:Math.round(t),lane:other});
      }
      eventIndex++;
    }
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    return {title,artist,difficulty:'EXPERT 二本指向け',bpm,offsetMs:0,noteCount:notes.length,notes};
  }

  function makeHappyPartyTrainChart(){
    return makeChart({
      title:'HAPPY PARTY TRAIN',artist:'Aqours',bpm:172.266,startMs:813,endMs:273200,
      mask:[1,1,1,0,1,1,0,1,1,1,1,0,1,0,1,1],chordEvery:4,laneSeed:0
    });
  }

  function makeBoooooomBeeChart(){
    return makeChart({
      title:'Boooooom Boooooom Bee!!',artist:'虹ヶ咲学園スクールアイドル同好会',bpm:161.499,startMs:1370,endMs:223800,
      mask:[1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1],chordEvery:4,laneSeed:3
    });
  }

  async function prepareBuiltInSong(chartFactory,audioKey,title){
    chart=chartFactory();
    validateChart(chart);
    chartName.textContent=`${title}（${chart.notes.length} notes）`;
    offsetInput.value=String(getSavedTimingOffset());
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    try{
      const cached=await getPresetAudio(audioKey);
      if(cached&&usePresetAudio(cached,title)){canStart();return;}
    }catch(e){console.warn(`${title}の保存済み音源を読み込めませんでした`,e);}
    awaitingPresetAudioKey=audioKey;
    songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
    audioFile.click();
    canStart();
  }

  function makeCard(id,title,artist,bpm,prepare){
    const card=document.createElement('div');card.className='song-library-card';card.dataset.song075=id;
    const h=document.createElement('h3');h.textContent=title;
    const a=document.createElement('p');a.textContent=artist;
    const m=document.createElement('p');m.textContent=`EXPERT 二本指向け / BPM ${bpm}`;
    const b=document.createElement('span');b.className='song-library-badge';b.textContent='内蔵楽曲';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);
    card.append(h,a,m,b,btn);return card;
  }

  function installCards(){
    const grid=document.getElementById('songLibraryGrid');
    if(!grid)return;
    if(!grid.querySelector('[data-song075="hpt"]'))grid.append(makeCard('hpt','HAPPY PARTY TRAIN','Aqours','172.266',()=>prepareBuiltInSong(makeHappyPartyTrainChart,HPT_AUDIO_KEY,'HAPPY PARTY TRAIN')));
    if(!grid.querySelector('[data-song075="boom"]'))grid.append(makeCard('boom','Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会','161.499',()=>prepareBuiltInSong(makeBoooooomBeeChart,BOOM_AUDIO_KEY,'Boooooom Boooooom Bee!!')));
  }

  const library=document.getElementById('songLibraryScreen');
  if(library){
    new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(installCards);}).observe(library,{attributes:true,attributeFilter:['hidden']});
    if(!library.hidden)installCards();
  }

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');if(text)text.textContent='HAPPY PARTY TRAIN と Boooooom Boooooom Bee!! を新しいプレイ楽曲として追加しました。';
  }
  syncVersion();
})();
