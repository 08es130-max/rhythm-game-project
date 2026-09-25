// Ver.0.8.224: Boooooom Bee fully rebuilt from HPT/Spica chart language; HPT untouched.
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

  function applyPlayableHolds(chart,specs){
    const notes=(chart.notes||[]).map(n=>({...n}));
    const accepted=[];
    for(const spec of specs){
      const start=Math.round(spec.start),end=Math.round(spec.end),lane=spec.lane;
      if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start+260)continue;
      if(accepted.some(h=>start<h.end+180&&end>h.start-180))continue;
  
      // One thumb is occupied during a hold. Keep only notes on the free side,
      // and never require two ordinary taps at the same moment while holding.
      const freeSide=spec.freeSide||(lane<4?'right':lane>4?'left':'right');
      const kept=[];
      const bodyByTime=new Map();
      for(const n of notes){
        if(n.timeMs<start-25||n.timeMs>end+25){kept.push(n);continue;}
        if(n.holdVisualOnly)continue;
        if(Math.abs(n.timeMs-start)<=25||Math.abs(n.timeMs-end)<=25)continue;
        if(n.lane===lane)continue;
        const onFreeSide=freeSide==='left'?n.lane<=3:n.lane>=5;
        if(!onFreeSide)continue;
        const key=n.timeMs;
        const prev=bodyByTime.get(key);
        if(!prev||Math.abs(n.lane-lane)>Math.abs(prev.lane-lane))bodyByTime.set(key,n);
      }
      kept.push(...bodyByTime.values());
      kept.push({timeMs:start,lane,holdEndMs:end,holdVisualOnly:true});
      notes.length=0;notes.push(...kept);
      accepted.push({start,end,lane});
    }
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    chart.notes=notes;
    chart.noteCount=notes.length;
    chart.holdCount=accepted.length;
    return chart;
  }

  function promoteReferenceHolds(input,step,target){
    const notes=input.map(n=>({...n})).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    const side=l=>l<4?-1:l>4?1:0;
    let heldUntil=-Infinity,count=0;
    for(let i=0;i<notes.length&&count<target;i++){
      const n=notes[i];
      if(n.lane===4||n.timeMs<heldUntil+220||i%11!==3)continue;
      const s=side(n.lane);
      let end=n.timeMs+step*4;
      const inside=notes.filter(x=>x.timeMs>n.timeMs&&x.timeMs<end);
      for(const x of inside){
        if(side(x.lane)===s){end=Math.min(end,x.timeMs-130);break;}
      }
      const free=inside.filter(x=>side(x.lane)!==s);
      for(let a=0;a<free.length;a++)for(let b=a+1;b<free.length;b++){
        if(free[b].timeMs-free[a].timeMs<115)end=Math.min(end,free[b].timeMs-130);
      }
      const steps=Math.min(4,Math.floor((end-n.timeMs)/step));
      if(steps<2)continue;
      n.holdEndMs=n.timeMs+steps*step;n.holdVisualOnly=true;heldUntil=n.holdEndMs;count++;
    }

    // Remove notes that would need the holding thumb, and collapse free-side doubles
    // to one tap during a hold body.
    const out=[];
    for(const n of notes){
      const active=notes.find(h=>h.holdVisualOnly&&n!==h&&n.timeMs>h.timeMs&&n.timeMs<h.holdEndMs);
      if(!active){out.push(n);continue;}
      if(side(n.lane)===side(active.lane)||n.lane===active.lane)continue;
      if(out.some(x=>x.timeMs===n.timeMs&&x!==active))continue;
      out.push(n);
    }
    return out.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
  }

  function makeBoom(){
    const B=builder('Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会',161.499,1370,225000);
    const {add,chord,bars,at,half}=B;

    // HPT / Spica reference language:
    // - verses: off-beat single-note phrases, mostly inner lanes
    // - builds: short axis jacks and alternating hands
    // - choruses: wide -> inner motions with phrase-ending chords
    // - bridge/finale: short Spica-like bursts, never more than two starts at once
    bars(0,16,(bar,t)=>{
      const flip=bar&1;
      chord(t(0),flip?2:1,flip?6:7);
      add(t(2),flip?6:2); add(t(3),flip?5:3);
      add(t(5),flip?7:1);
      if(bar%4===3)chord(t(7),3,5); else add(t(7),flip?6:2);
    });

    bars(16,46,(bar,t)=>{
      const seqs=[
        [1,2,3,2,5,6],[7,6,5,6,3,2],
        [2,3,1,3,6,5],[6,5,7,5,2,3]
      ];
      const seq=seqs[bar%4];
      [0,2,3,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%8===6)chord(t(4),2,6);
    });

    bars(46,62,(bar,t)=>{
      const right=(bar%6)>=3,axis=right?6:2,inner=right?5:3,outer=right?7:1;
      add(t(0),axis);add(t(1),inner);add(t(2),axis);
      add(t(4),outer);add(t(5),axis);
      if(bar%3===2)chord(t(7),right?2:6,axis); else add(t(7),inner);
    });

    bars(62,88,(bar,t)=>{
      const type=bar%4;
      if(type===0){chord(t(0),1,7);add(t(1),3);add(t(2),5);add(t(3),3);add(t(5),2);add(t(6),3);chord(t(7),2,6);}
      if(type===1){add(t(0),7);add(t(1),6);add(t(2),5);add(t(3),6);add(t(4),3);add(t(5),2);add(t(7),1);}
      if(type===2){chord(t(0),2,6);add(t(1),5);add(t(2),3);add(t(4),5);add(t(5),6);add(t(6),5);chord(t(7),1,7);}
      if(type===3){add(t(0),1);add(t(1),2);add(t(2),3);add(t(3),2);add(t(4),6);add(t(5),5);add(t(6),6);add(t(7),7);}
    });

    bars(88,108,(bar,t)=>{
      const seqs=[[0,2,3,6,7,5,2],[8,6,5,2,1,3,6],[1,3,5,7,6,3,2],[7,5,3,1,2,5,6]];
      [0,1,2,4,5,6,7].forEach((s,i)=>add(t(s),seqs[bar%4][i]));
      if(bar%5===4)chord(t(3),2,6);
    });

    bars(108,128,(bar,t)=>{
      const flip=bar&1,seq=flip?[6,7,5,6,3,2]:[2,1,3,2,5,6];
      [0,2,3,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%6===5)chord(t(4),1,7);
    });

    bars(128,140,(bar,t)=>{
      const right=bar&1,axis=right?6:2,answer=right?5:3,far=right?7:1;
      add(t(0),axis);add(t(1),answer);add(t(2),axis);
      chord(t(3),right?2:6,axis);
      add(t(5),far);add(t(6),axis);add(t(7),answer);
    });

    bars(140,158,(bar,t)=>{
      const type=bar%6;
      if(type===0){chord(t(0),1,7);add(t(1),2);add(t(2),3);add(t(3),5);add(t(4),6);add(t(5),5);chord(t(7),2,6);}
      if(type===1){add(t(0),7);add(t(1),6);add(t(2),5);add(t(3),6);add(t(4),5);add(t(5),3);add(t(6),2);add(t(7),3);}
      if(type===2){chord(t(0),2,6);add(t(1),3);add(t(2),5);add(t(3),3);add(t(4),6);add(t(5),5);add(t(6),7);chord(t(7),1,7);}
      if(type===3){add(t(0),1);add(t(1),3);add(t(2),5);add(t(3),7);add(t(4),6);add(t(5),4);add(t(6),2);add(t(7),4);}
      if(type===4){chord(t(0),0,8);add(t(1),2);add(t(2),4);add(t(3),6);add(t(4),3);add(t(5),5);chord(t(7),2,6);}
      if(type===5){add(t(0),7);add(t(1),5);add(t(2),3);add(t(3),1);add(t(4),2);add(t(5),4);add(t(6),6);chord(t(7),1,7);}
    });

    const chart=B.finish();
    chart.notes=promoteReferenceHolds(chart.notes,half,22);
    chart.noteCount=chart.notes.length;
    chart.holdCount=chart.notes.filter(n=>n.holdVisualOnly).length;
    return chart;
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
