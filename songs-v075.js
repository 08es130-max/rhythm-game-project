// Ver.0.8.228: preserve patched Boooooom Bee card so legacy installer cannot restore the old chart handler.
(function(){
  const VERSION='0.7.6';
  const HPT_AUDIO_KEY='happy-party-train';
  const BOOM_AUDIO_KEY='boooooom-bee';

  function chartBuilder(title,artist,bpm,startMs,endMs){
    const beat=60000/bpm;
    const half=beat/2;
    const notes=[];
    const seen=new Set();
    const timeCounts=new Map();
    function addAt(t,lane){
      lane=Math.max(0,Math.min(8,Math.round(lane)));
      const time=Math.round(t);
      const key=`${time}:${lane}`;
      const count=timeCounts.get(time)||0;
      if(seen.has(key)||count>=2||time<startMs||time>endMs)return;
      seen.add(key);timeCounts.set(time,count+1);notes.push({timeMs:time,lane});
    }
    function chord(t,a,b){addAt(t,a);if(b!==a)addAt(t,b);}
    function step(bar,sub){return startMs+(bar*8+sub)*half;}
    function bars(fromBar,toBar,fn){
      for(let bar=fromBar;bar<toBar;bar++)fn(bar,(sub)=>step(bar,sub));
    }
    function finish(){
      notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      return {title,artist,difficulty:'EXPERT 二本指向け',bpm,offsetMs:0,noteCount:notes.length,notes};
    }
    return {beat,half,addAt,chord,step,bars,finish};
  }

  function makeHappyPartyTrainChart(){
    const B=chartBuilder('HAPPY PARTY TRAIN','Aqours',172.266,813,276400);
    const {addAt,chord,step,bars}=B;

    // Intro: double-note movement and center accents, following the feel of the SIF reference.
    bars(0,16,(bar,t)=>{
      const pairs=[[1,7],[2,6],[3,5],[2,6]];
      [0,2,4,6].forEach((s,i)=>{
        const p=pairs[(bar+i)%pairs.length];
        if(i%2===0)chord(t(s),p[0],p[1]); else addAt(t(s),4);
      });
      addAt(t(7),bar%2?3:5);
    });

    // A melody: 4-5 note stairs that switch hands, one of the signature HPT ideas.
    bars(16,44,(bar,t)=>{
      const left=[1,2,3,4,3],right=[7,6,5,4,5];
      const seq=((bar>>1)%2===0)?left:right;
      [0,1,3,4,6].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%4===3)chord(t(7),2,6);
    });

    // A-melody end: chord / center-center "denim" feel + short crossing stairs.
    bars(44,56,(bar,t)=>{
      chord(t(0),bar%2?2:1,bar%2?6:7);
      addAt(t(2),4);addAt(t(3),4);
      const seq=bar%2?[6,5,4,3]:[2,3,4,5];
      [4,5,6,7].forEach((s,i)=>addAt(t(s),seq[i]));
    });

    // B melody: mirrored 75645 / 35465-like fragments and rhythm variation.
    bars(56,76,(bar,t)=>{
      const seq=bar%2?[7,5,6,4,5]:[3,5,4,6,4];
      [0,2,3,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%4===1)chord(t(6),1,7);
    });

    // Pre-chorus: axis hits and opposite-hand staircase, a major feature of the reference chart.
    bars(76,88,(bar,t)=>{
      const mirror=bar>=82;
      const anchor=mirror?8:0;
      const stair=mirror?[4,3,2,1]:[4,5,6,7];
      chord(t(0),anchor,4);
      addAt(t(2),anchor);
      stair.forEach((lane,i)=>chord(t(3+i),anchor,lane));
      if(bar%3===2)addAt(t(7),mirror?6:2);
    });

    // Chorus: same-single-same / anchor-answer patterns rather than a single repeating sweep.
    bars(88,116,(bar,t)=>{
      const flip=bar%2;
      const A=flip?[7,2]:[1,6], Bp=flip?[6,1]:[2,7];
      chord(t(0),A[0],A[1]);
      addAt(t(2),4);
      chord(t(3),Bp[0],Bp[1]);
      addAt(t(5),flip?3:5);
      chord(t(6),flip?7:1,flip?1:7);
      if(bar%4===3)addAt(t(7),4);
    });

    // Instrumental: compact 3-note alternations, cross-screen runs and intentional breathing room.
    bars(116,132,(bar,t)=>{
      const seq=bar%2?[8,3,7,2,6,4]:[0,5,1,6,2,4];
      [0,1,3,4,6,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%4===2)chord(t(5),2,6);
    });

    // Verse reprise: similar difficulty, but mirrored and with different anchor positions.
    bars(132,156,(bar,t)=>{
      const seq=bar%2?[6,5,4,3,2]:[2,3,4,5,6];
      [0,2,3,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%3===0)chord(t(6),bar%2?0:8,4);
    });

    // Second build: center attacks, short alternations, then axis chords.
    bars(156,172,(bar,t)=>{
      addAt(t(0),4);
      addAt(t(1),bar%2?2:6);
      addAt(t(3),4);
      chord(t(4),bar%2?1:0,bar%2?7:8);
      addAt(t(6),bar%2?6:2);
      if(bar>=168)chord(t(7),bar%2?8:0,4);
    });

    // Final chorus: denser variation without exceeding two simultaneous notes.
    bars(172,192,(bar,t)=>{
      const flip=bar%2;
      chord(t(0),flip?2:1,flip?6:7);
      addAt(t(1),4);
      addAt(t(3),flip?5:3);
      chord(t(4),flip?1:2,flip?7:6);
      addAt(t(6),4);
      if(bar%4!==1)chord(t(7),flip?3:0,flip?5:8);
    });

    // Outro: central scramble inspired by the reference chart's tricky finish.
    bars(192,196,(bar,t)=>{
      const seq=bar%2?[8,3,7,2,6,4]:[0,5,1,6,2,4];
      [0,1,2,4,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      chord(t(6),3,5);
    });
    return B.finish();
  }

  function makeBoooooomBeeChart(){
    const B=chartBuilder('Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会',161.499,1370,225000);
    const {addAt,chord,bars}=B;

    // Intro: big outside hits with center answers.
    bars(0,16,(bar,t)=>{
      chord(t(0),bar%2?1:0,bar%2?7:8);
      addAt(t(2),4);
      addAt(t(4),bar%2?6:2);
      addAt(t(6),bar%2?3:5);
      if(bar%4===3)chord(t(7),2,6);
    });

    // Verse A: orbit motion.
    bars(16,32,(bar,t)=>{
      const seq=bar%2?[0,2,4,6,8]:[8,6,4,2,0];
      [0,2,3,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%4===1)chord(t(6),3,5);
    });

    // Verse B: zigzag and short mirrored fragments.
    bars(32,48,(bar,t)=>{
      const seq=bar%2?[1,3,5,7,4]:[7,5,3,1,4];
      [0,1,3,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%3===0)chord(t(6),2,6);
    });

    // Build: syncopated center bounce.
    bars(48,64,(bar,t)=>{
      addAt(t(0),4);
      addAt(t(2),bar%2?5:3);
      chord(t(3),1,7);
      addAt(t(5),4);
      if(bar%2===0)addAt(t(7),6);else chord(t(7),2,6);
    });

    // Chorus 1: "boom" downbeats + quick answers.
    bars(64,84,(bar,t)=>{
      chord(t(0),bar%2?1:0,bar%2?7:8);
      addAt(t(1),4);
      addAt(t(3),bar%2?2:6);
      chord(t(4),bar%2?2:1,bar%2?6:7);
      addAt(t(6),bar%2?5:3);
      if(bar%4===3)addAt(t(7),4);
    });

    // Break: migrating two-lane trills with gaps.
    bars(84,100,(bar,t)=>{
      const base=[1,2,3,4,5,6][bar%6],other=Math.min(8,base+1);
      [0,1,3,4,6].forEach((s,i)=>addAt(t(s),i%2?other:base));
      if(bar%4===2)chord(t(7),Math.max(0,base-1),Math.min(8,other+1));
    });

    // Verse reprise: diagonal runs and reversals.
    bars(100,116,(bar,t)=>{
      const seq=bar%2?[0,1,3,5,7,8]:[8,7,5,3,1,0];
      [0,1,2,4,6,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar%4===1)chord(t(5),0,8);
    });

    // Build 2: call-and-response across left/right halves.
    bars(116,132,(bar,t)=>{
      const seq=bar%2?[1,2,4,3,1]:[7,6,4,5,7];
      [0,2,3,5,7].forEach((s,i)=>addAt(t(s),seq[i]));
      if(bar>=128)chord(t(6),2,6);
    });

    // Chorus 2: wider chords and changing answer lanes.
    bars(132,144,(bar,t)=>{
      const pairs=[[0,8],[1,7],[2,6],[3,5]];
      const p=pairs[bar%4];
      chord(t(0),p[0],p[1]);
      addAt(t(2),[4,3,5,2][bar%4]);
      chord(t(4),pairs[(bar+2)%4][0],pairs[(bar+2)%4][1]);
      addAt(t(6),[5,4,3,6][bar%4]);
      addAt(t(7),4);
    });

    // Finale: mixed motifs instead of looping one gesture.
    bars(144,150,(bar,t)=>{
      const seq=bar%2?[0,2,4,7,5,3]:[8,6,4,1,3,5];
      [0,1,3,4,6,7].forEach((s,i)=>addAt(t(s),seq[i]));
      chord(t(5),bar%2?1:2,bar%2?7:6);
    });
    return B.finish();
  }

  async function prepareBuiltInSong(chartFactory,audioKey,title){
    const next=chartFactory();
    next.audioKey=audioKey;
    if(typeof window.setActiveRhythmChart==='function'){
      window.setActiveRhythmChart(next,`${title}（${next.notes.length} notes）`,audioKey);
    }else{
      chart=next;validateChart(chart);
      chartName.textContent=`${title}（${chart.notes.length} notes）`;
      offsetInput.value=String(getSavedTimingOffset());
    }
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    if(typeof window.preparePresetAudio==='function') await window.preparePresetAudio(audioKey,title);
    else{
      try{
        const cached=await getPresetAudio(audioKey);
        if(cached&&usePresetAudio(cached,title)){canStart();return;}
      }catch(e){console.warn(`${title}の保存済み音源を読み込めませんでした`,e);}
      awaitingPresetAudioKey=audioKey;
      songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
      try{audioFile.click();}catch(_){}
    }
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
    const grid=document.getElementById('songLibraryGrid');if(!grid)return;

    // HPT still uses the legacy card as a base and is re-patched by hpt-chart-v0838.
    grid.querySelectorAll('[data-song075="hpt"]').forEach(el=>el.remove());
    grid.appendChild(
      makeCard('hpt','HAPPY PARTY TRAIN','Aqours','172.266',()=>prepareBuiltInSong(makeHappyPartyTrainChart,HPT_AUDIO_KEY,'HAPPY PARTY TRAIN'))
    );

    // IMPORTANT: once songs-v077 has patched the Boooooom Bee button, never recreate
    // that card here. Recreating it could temporarily restore the old chart handler.
    const boomCards=[...grid.querySelectorAll('[data-song075="boom"]')];
    const patched=boomCards.find(card=>card.querySelector('button[data-v077="1"]'));
    if(patched){
      boomCards.forEach(card=>{if(card!==patched)card.remove();});
    }else{
      boomCards.forEach(el=>el.remove());
      grid.appendChild(
        makeCard('boom','Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会','161.499',()=>prepareBuiltInSong(makeBoooooomBeeChart,BOOM_AUDIO_KEY,'Boooooom Boooooom Bee!!'))
      );
    }
  }

  const library=document.getElementById('songLibraryScreen');
  if(library){
    new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(installCards);}).observe(library,{attributes:true,attributeFilter:['hidden']});
    if(!library.hidden)installCards();
  }

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='HAPPY PARTY TRAINの譜面をスクフェス譜面の特徴を参考に再構成し、Boooooom Boooooom Bee!!も単調な反復をやめて全面的に作り直しました。シャン音も復旧しました。';
  }
  syncVersion();
})();
