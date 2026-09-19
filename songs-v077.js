// Ver.0.7.7: revised HPT/SIF-inspired chart and more varied Boooooom Bee chart.
(function(){
  const VERSION='0.7.7';
  const HPT_AUDIO_KEY='happy-party-train';
  const BOOM_AUDIO_KEY='boooooom-bee';

  function builder(title,artist,bpm,startMs,endMs){
    const beat=60000/bpm, half=beat/2;
    const notes=[], seen=new Set(), perTime=new Map();
    function add(time,lane){
      const t=Math.round(time), l=Math.max(0,Math.min(8,Math.round(lane)));
      if(t<startMs||t>endMs)return;
      const key=`${t}:${l}`, count=perTime.get(t)||0;
      if(seen.has(key)||count>=2)return;
      seen.add(key);perTime.set(t,count+1);notes.push({timeMs:t,lane:l});
    }
    function chord(time,a,b){add(time,a);if(b!==a)add(time,b);}
    function at(bar,sub){return startMs+(bar*8+sub)*half;}
    function bars(a,b,fn){for(let bar=a;bar<b;bar++)fn(bar,(sub)=>at(bar,sub));}
    function finish(){notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);return {title,artist,difficulty:'EXPERT 二本指向け',bpm,offsetMs:0,noteCount:notes.length,notes};}
    return {beat,half,add,chord,at,bars,finish};
  }

  function makeHpt(){
    const B=builder('HAPPY PARTY TRAIN','Aqours',172.266,813,276400);
    const {add,chord,bars}=B;

    // Intro: SIF-like mirrored doubles with center punctuation.
    bars(0,14,(bar,t)=>{
      const pair=[[1,7],[2,6],[3,5],[2,6]][bar%4];
      chord(t(0),pair[0],pair[1]);
      add(t(2),bar%2?5:3); add(t(4),4);
      if(bar%2===0)chord(t(6),2,6); else add(t(6),bar%4===1?7:1);
    });

    // A melody: alternating short stairs, not a fixed sweep.
    bars(14,38,(bar,t)=>{
      const variants=[
        [1,2,3,4,6],[7,6,5,4,2],[2,4,3,5,6],[6,4,5,3,2]
      ];
      const seq=variants[bar%variants.length];
      [0,2,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%4===3)chord(t(6),1,7);
    });

    // A' : center taps and small mirrored jumps, inspired by the SIF chart's center-heavy feel.
    bars(38,54,(bar,t)=>{
      const flip=bar%2;
      chord(t(0),flip?2:1,flip?6:7);
      add(t(2),4); add(t(3),4);
      add(t(5),flip?6:2);
      if(bar%4===1)chord(t(7),3,5); else add(t(7),flip?3:5);
    });

    // B melody: irregular 5-note phrases and hand switches.
    bars(54,72,(bar,t)=>{
      const variants=[
        [7,5,6,4,5],[3,5,4,6,4],[1,4,2,5,3],[7,4,6,3,5]
      ];
      const seq=variants[bar%4];
      [0,2,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%6===5)chord(t(6),2,6);
    });

    // Pre-chorus: SIF-like axis idea, but playable with two fingers and no dense anchor lock.
    bars(72,84,(bar,t)=>{
      const right=bar>=78;
      const anchor=right?7:1;
      const seq=right?[5,4,3,2]:[3,4,5,6];
      chord(t(0),anchor,4);
      add(t(2),anchor);
      add(t(3),seq[0]); add(t(4),seq[1]);
      chord(t(5),anchor,seq[2]);
      add(t(7),seq[3]);
    });

    // Chorus 1: satisfying downbeat chords -> center -> answer, with alternating shapes.
    bars(84,112,(bar,t)=>{
      const type=bar%4;
      if(type===0){chord(t(0),1,7);add(t(2),4);add(t(3),5);chord(t(4),2,6);add(t(6),4);chord(t(7),3,5);}
      if(type===1){chord(t(0),2,6);add(t(1),4);add(t(3),3);chord(t(5),1,7);add(t(7),4);}
      if(type===2){add(t(0),7);add(t(1),6);add(t(2),5);add(t(3),4);chord(t(5),2,6);add(t(7),3);}
      if(type===3){add(t(0),1);add(t(1),2);add(t(2),3);add(t(3),4);chord(t(5),1,7);chord(t(7),2,6);}
    });

    // Interlude: cross-screen runs with breathing room.
    bars(112,130,(bar,t)=>{
      const seq=bar%3===0?[0,3,6,4,8]:bar%3===1?[8,5,2,4,0]:[2,5,7,3,1];
      [0,1,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%5===4)chord(t(6),3,5);
    });

    // Verse reprise: new lane shapes so the second half doesn't repeat the first.
    bars(130,154,(bar,t)=>{
      const variants=[[2,3,5,4,6],[6,5,3,4,2],[0,2,4,5,7],[8,6,4,3,1]];
      const seq=variants[bar%4];
      [0,2,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%4===2)chord(t(6),bar%8===2?0:1,bar%8===2?8:7);
    });

    // Second build: center accents and short SIF-like mirrored bursts.
    bars(154,170,(bar,t)=>{
      const flip=bar%2;
      add(t(0),4); add(t(1),flip?6:2);
      chord(t(3),flip?1:2,flip?7:6);
      add(t(5),4); add(t(6),flip?3:5);
      if(bar>=166)chord(t(7),1,7);
    });

    // Final chorus: same musical logic but more energetic and less repetitive.
    bars(170,194,(bar,t)=>{
      const type=bar%6;
      const patterns=[
        ()=>{chord(t(0),1,7);add(t(1),4);add(t(3),5);chord(t(4),2,6);add(t(6),3);chord(t(7),3,5);},
        ()=>{add(t(0),8);add(t(1),6);add(t(2),4);add(t(3),2);chord(t(5),1,7);add(t(7),4);},
        ()=>{chord(t(0),2,6);add(t(2),3);add(t(3),4);add(t(4),5);chord(t(6),1,7);},
        ()=>{add(t(0),0);add(t(1),2);add(t(2),4);add(t(3),6);add(t(4),8);chord(t(6),3,5);},
        ()=>{chord(t(0),3,5);add(t(2),4);chord(t(3),2,6);add(t(5),4);chord(t(7),1,7);},
        ()=>{add(t(0),7);add(t(1),5);add(t(3),4);add(t(4),3);chord(t(6),0,8);}
      ];
      patterns[type]();
    });

    // Outro: center scramble and a clean final chord.
    bars(194,198,(bar,t)=>{
      const seq=bar%2?[7,4,6,3,5,2]:[1,4,2,5,3,6];
      [0,1,2,4,5,6].forEach((s,i)=>add(t(s),seq[i]));
      chord(t(7),bar===197?0:2,bar===197?8:6);
    });
    return B.finish();
  }

  function makeBoom(){
    const B=builder('Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会',161.499,1370,225000);
    const {add,chord,bars}=B;

    // Intro: four distinct bars instead of one repeated gesture.
    bars(0,16,(bar,t)=>{
      const type=bar%4;
      if(type===0){chord(t(0),0,8);add(t(2),4);add(t(4),2);add(t(6),6);}
      if(type===1){add(t(0),1);add(t(1),3);add(t(3),5);add(t(5),7);chord(t(7),2,6);}
      if(type===2){chord(t(0),1,7);add(t(2),5);add(t(3),4);add(t(5),3);chord(t(7),0,8);}
      if(type===3){add(t(0),8);add(t(2),6);add(t(3),4);add(t(4),2);add(t(6),0);}
    });

    // Verse: 8-bar phrase library with deliberately different motion.
    bars(16,48,(bar,t)=>{
      const v=bar%8;
      const P=[
        [0,2,4,6,8],[8,5,3,1,4],[1,4,7,5,2],[7,4,1,3,6],
        [2,3,6,5,4],[6,5,2,3,4],[0,4,8,3,5],[8,4,0,5,3]
      ][v];
      const subs=v%2?[0,1,3,5,7]:[0,2,3,5,7];
      subs.forEach((s,i)=>add(t(s),P[i]));
      if(v===3||v===7)chord(t(6),1,7);
    });

    // Build 1: syncopation increases toward chorus.
    bars(48,62,(bar,t)=>{
      const r=bar%4;
      add(t(0),4);
      add(t(r===0?1:2),r<2?2:6);
      chord(t(3),r%2?2:1,r%2?6:7);
      add(t(5),r%2?5:3);
      if(bar>=58){add(t(6),4);chord(t(7),r%2?0:1,r%2?8:7);} else add(t(7),4);
    });

    // Chorus 1: big 'boom' chords, fast answers and satisfying center landings.
    bars(62,86,(bar,t)=>{
      const type=bar%6;
      if(type===0){chord(t(0),0,8);add(t(1),4);add(t(2),3);add(t(3),5);chord(t(4),1,7);add(t(6),4);}
      if(type===1){chord(t(0),2,6);add(t(2),4);add(t(3),7);add(t(4),6);chord(t(6),1,7);add(t(7),4);}
      if(type===2){add(t(0),0);add(t(1),2);add(t(2),4);add(t(3),6);add(t(4),8);chord(t(6),2,6);}
      if(type===3){chord(t(0),1,7);add(t(1),5);add(t(2),4);add(t(3),3);chord(t(5),0,8);add(t(7),4);}
      if(type===4){add(t(0),8);add(t(1),7);add(t(2),5);add(t(3),4);add(t(4),3);add(t(5),1);chord(t(7),2,6);}
      if(type===5){chord(t(0),3,5);add(t(2),4);chord(t(3),1,7);add(t(5),4);chord(t(7),0,8);}
    });

    // Break: alternating small motifs, each bar different from the previous two.
    bars(86,106,(bar,t)=>{
      const type=bar%5;
      const seqs=[[1,2,1,4,6],[7,6,7,4,2],[2,5,3,6,4],[6,3,5,2,4],[0,3,8,5,4]];
      const seq=seqs[type];
      [0,1,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(type===4)chord(t(6),1,7);
    });

    // Verse 2: call & response and diagonals, no reuse of chorus shapes.
    bars(106,126,(bar,t)=>{
      const type=bar%4;
      const seq=type===0?[1,3,4,6,8]:type===1?[7,5,4,2,0]:type===2?[0,4,2,6,4]:[8,4,6,2,4];
      [0,2,3,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%5===0)chord(t(6),3,5);
    });

    // Build 2: denser but still readable.
    bars(126,138,(bar,t)=>{
      const flip=bar%2;
      chord(t(0),flip?2:1,flip?6:7);
      add(t(1),4);add(t(3),flip?6:2);add(t(4),4);add(t(5),flip?3:5);
      chord(t(7),flip?0:1,flip?8:7);
    });

    // Final chorus: highest energy, changing pattern every bar.
    bars(138,154,(bar,t)=>{
      const type=bar%8;
      const actions=[
        ()=>{chord(t(0),0,8);add(t(1),4);add(t(2),2);add(t(3),6);chord(t(4),1,7);add(t(6),4);chord(t(7),3,5);},
        ()=>{add(t(0),1);add(t(1),3);add(t(2),5);add(t(3),7);chord(t(5),2,6);add(t(7),4);},
        ()=>{chord(t(0),2,6);add(t(1),4);add(t(3),8);add(t(4),6);add(t(5),4);chord(t(7),1,7);},
        ()=>{add(t(0),8);add(t(1),6);add(t(2),4);add(t(3),2);add(t(4),0);chord(t(6),3,5);},
        ()=>{chord(t(0),1,7);add(t(2),4);chord(t(3),0,8);add(t(5),4);chord(t(7),2,6);},
        ()=>{add(t(0),0);add(t(1),3);add(t(2),6);add(t(3),8);add(t(5),5);add(t(6),2);chord(t(7),1,7);},
        ()=>{chord(t(0),3,5);add(t(1),4);add(t(2),7);add(t(3),6);add(t(4),4);add(t(5),2);chord(t(7),0,8);},
        ()=>{chord(t(0),0,8);chord(t(2),2,6);add(t(4),4);add(t(5),3);add(t(6),5);chord(t(7),1,7);}
      ];
      actions[type]();
    });

    // Finale: short celebratory run and final wide hit.
    bars(154,158,(bar,t)=>{
      const seq=bar%2?[8,6,4,2,0,4]:[0,2,4,6,8,4];
      [0,1,2,4,5,6].forEach((s,i)=>add(t(s),seq[i]));
      chord(t(7),bar===157?0:2,bar===157?8:6);
    });
    return B.finish();
  }

  async function prepare(chartFactory,audioKey,title){
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
      try{const cached=await getPresetAudio(audioKey);if(cached&&usePresetAudio(cached,title)){canStart();return;}}catch(e){console.warn(e);}
      awaitingPresetAudioKey=audioKey;
      songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
      try{audioFile.click();}catch(_){}
    }
    canStart();
  }

  function patchCards(){
    const grid=document.getElementById('songLibraryGrid'); if(!grid)return;
    [...grid.querySelectorAll('.song-library-card')].forEach(card=>{
      const title=card.querySelector('h3')?.textContent?.trim();
      if(title!=='HAPPY PARTY TRAIN'&&title!=='Boooooom Boooooom Bee!!')return;
      const old=card.querySelector('button'); if(!old||old.dataset.v077==='1')return;
      const btn=old.cloneNode(true); btn.dataset.v077='1'; old.replaceWith(btn);
      if(title==='HAPPY PARTY TRAIN')btn.addEventListener('click',()=>prepare(makeHpt,HPT_AUDIO_KEY,title));
      else btn.addEventListener('click',()=>prepare(makeBoom,BOOM_AUDIO_KEY,title));
    });
  }
  const library=document.getElementById('songLibraryScreen');
  if(library){
    new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(()=>requestAnimationFrame(patchCards));}).observe(library,{attributes:true,attributeFilter:['hidden']});
    if(!library.hidden)requestAnimationFrame(patchCards);
  }

  window.makeHappyPartyTrainChartV077=makeHpt;
  window.makeBoooooomBeeChartV077=makeBoom;

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>el.textContent=`Ver. ${VERSION}`);
    const head=document.querySelector('#updateBanner .update-head span:last-child');if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');if(text)text.textContent='HAPPY PARTY TRAINをさらにスクフェス寄りに調整し、Boooooom Boooooom Bee!!の反復を減らしてサビを強化しました。';
  }
  syncVersion();
})();
