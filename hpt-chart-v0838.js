// Ver.0.8.38: HAPPY PARTY TRAIN full-song chart reworked from the SIF EXPERT feel.
// Chart-only override. Keep the Ver.0.8.37 live/input/audio engine untouched.
(function(){
  const HPT_AUDIO_KEY='happy-party-train';
  const TARGET_NOTES=1220;
  const BPM=170;
  const START_MS=813;
  const END_MS=276400;

  function makeHpt0838(){
    const beat=60000/BPM;
    const half=beat/2;
    const notes=[];
    const seen=new Set();
    const perTime=new Map();

    function add(time,lane){
      const t=Math.round(time);
      const l=Math.max(0,Math.min(8,Math.round(lane)));
      if(t<START_MS||t>END_MS)return false;
      const key=`${t}:${l}`;
      const count=perTime.get(t)||0;
      if(seen.has(key)||count>=2)return false;
      seen.add(key);
      perTime.set(t,count+1);
      notes.push({timeMs:t,lane:l});
      return true;
    }
    function chord(time,a,b){add(time,a);if(a!==b)add(time,b);}
    function at(bar,sub){return START_MS+(bar*8+sub)*half;}
    function bars(a,b,fn){for(let bar=a;bar<b;bar++)fn(bar,(sub)=>at(bar,sub));}

    // The reference EXPERT chart puts relatively little weight on the center lane,
    // favors the inner-left / inner-right lanes, uses syncopation heavily, and
    // punctuates phrases with two-note hits. These sections preserve that feel
    // while extending it over the full-length audio used by LoveFes.

    // Intro: alternating mirrored hits and inward answers.
    bars(0,14,(bar,t)=>{
      const flip=bar&1;
      chord(t(0),flip?2:1,flip?6:7);
      add(t(2),flip?6:2);
      add(t(3),flip?5:3);
      add(t(5),flip?7:1);
      if(bar%4===3)chord(t(7),3,5); else add(t(7),flip?6:2);
    });

    // Verse 1: off-beat single-note phrases, mostly avoiding the center.
    bars(14,42,(bar,t)=>{
      const seqs=[
        [1,2,3,2,5,6],[7,6,5,6,3,2],
        [2,3,1,3,6,5],[6,5,7,5,2,3]
      ];
      const seq=seqs[bar%4];
      [0,2,3,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%8===6)chord(t(4),2,6);
    });

    // Verse turn: short center-adjacent trills like the reference chart's bursts.
    bars(42,58,(bar,t)=>{
      const flip=bar&1;
      const seq=flip?[6,5,6,3,2,3]:[2,3,2,5,6,5];
      [0,1,2,4,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%4===3)chord(t(6),1,7);
    });

    // Build 1: axis-jack feel before the chorus. Never more than two simultaneous notes.
    bars(58,76,(bar,t)=>{
      const right=(bar%6)>=3;
      const axis=right?6:2;
      const inner=right?5:3;
      const outer=right?7:1;
      add(t(0),axis);
      add(t(1),inner);
      add(t(2),axis);
      add(t(4),outer);
      add(t(5),axis);
      if(bar%3===2)chord(t(7),right?2:6,axis); else add(t(7),inner);
    });

    // Pre-chorus: alternating hands, then a wider two-note pickup.
    bars(76,88,(bar,t)=>{
      const flip=bar&1;
      const seq=flip?[7,5,6,3,2,5,6]:[1,3,2,5,6,3,2];
      [0,1,3,4,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar>=84)chord(t(2),flip?2:1,flip?6:7);
    });

    // Chorus 1: repeated wide-to-inner motions and center-adjacent trills.
    bars(88,116,(bar,t)=>{
      const type=bar%4;
      if(type===0){chord(t(0),1,7);add(t(1),3);add(t(2),5);add(t(3),3);add(t(5),2);add(t(6),3);chord(t(7),2,6);}
      if(type===1){add(t(0),7);add(t(1),6);add(t(2),5);add(t(3),6);add(t(4),3);add(t(5),2);add(t(7),1);}
      if(type===2){chord(t(0),2,6);add(t(1),5);add(t(2),3);add(t(4),5);add(t(5),6);add(t(6),5);chord(t(7),1,7);}
      if(type===3){add(t(0),1);add(t(1),2);add(t(2),3);add(t(3),2);add(t(4),6);add(t(5),5);add(t(6),6);add(t(7),7);}
    });

    // Instrumental: strong left/right swings with occasional edge notes.
    bars(116,136,(bar,t)=>{
      const type=bar%4;
      const seqs=[
        [0,2,3,6,7,5,2],[8,6,5,2,1,3,6],
        [1,3,5,7,6,3,2],[7,5,3,1,2,5,6]
      ];
      const seq=seqs[type];
      [0,1,2,4,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%5===4)chord(t(3),2,6);
    });

    // Verse 2: a lighter call-and-response section before density rises again.
    bars(136,158,(bar,t)=>{
      const flip=bar&1;
      const seq=flip?[6,7,5,6,3,2]:[2,1,3,2,5,6];
      [0,2,3,5,6,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%6===5)chord(t(4),1,7);
    });

    // Build 2: denser axis patterns, matching the reference chart's pre-chorus pressure.
    bars(158,174,(bar,t)=>{
      const right=bar&1;
      const axis=right?6:2;
      const answer=right?5:3;
      const far=right?7:1;
      add(t(0),axis); add(t(1),answer); add(t(2),axis);
      chord(t(3),right?2:6,axis);
      add(t(5),far); add(t(6),axis); add(t(7),answer);
    });

    // Final chorus: the busiest section, still designed for two thumbs.
    bars(174,196,(bar,t)=>{
      const type=bar%6;
      if(type===0){chord(t(0),1,7);add(t(1),2);add(t(2),3);add(t(3),5);add(t(4),6);add(t(5),5);chord(t(7),2,6);}
      if(type===1){add(t(0),7);add(t(1),6);add(t(2),5);add(t(3),6);add(t(4),5);add(t(5),3);add(t(6),2);add(t(7),3);}
      if(type===2){chord(t(0),2,6);add(t(1),3);add(t(2),2);add(t(3),3);add(t(4),5);add(t(5),6);add(t(6),5);chord(t(7),1,7);}
      if(type===3){add(t(0),1);add(t(1),3);add(t(2),2);add(t(3),5);add(t(4),6);add(t(5),7);add(t(6),5);add(t(7),6);}
      if(type===4){chord(t(0),3,5);add(t(1),2);add(t(2),3);add(t(3),2);add(t(5),6);add(t(6),5);chord(t(7),1,7);}
      if(type===5){add(t(0),7);add(t(1),5);add(t(2),6);add(t(3),5);add(t(4),3);add(t(5),2);add(t(6),3);chord(t(7),0,8);}
    });

    // Outro: decrescendo into a wide final hit.
    bars(196,198,(bar,t)=>{
      const seq=bar===196?[1,2,3,5,6,7]:[7,6,5,3,2,1];
      [0,1,2,4,5,6].forEach((s,i)=>add(t(s),seq[i]));
      chord(t(7),0,8);
    });

    // Full-song target density derived from the reference EXPERT's 498 notes / ~112.5 s.
    // Fill only empty eighth-note slots so the authored phrase shapes above stay intact.
    const laneTarget=[142,130,149,145,88,147,162,130,127];
    const laneCount=Array(9).fill(0);
    notes.forEach(n=>laneCount[n.lane]++);

    const candidates=[];
    const totalBars=Math.floor((END_MS-START_MS)/(8*half));
    for(let bar=0;bar<totalBars;bar++){
      for(let sub=0;sub<8;sub++){
        const t=Math.round(at(bar,sub));
        if(t>END_MS)break;
        if((perTime.get(t)||0)===0)candidates.push({t,bar,sub});
      }
    }

    function preferredLane(bar,sub){
      const phase=(bar*3+sub)%8;
      return [2,6,3,5,1,7,3,6][phase];
    }

    let cursor=0;
    while(notes.length<TARGET_NOTES&&cursor<candidates.length){
      const c=candidates[cursor++];
      // Spread additions across the song rather than creating one dense block.
      if((c.bar+c.sub)%3===1 && notes.length<TARGET_NOTES-80)continue;
      let lane=preferredLane(c.bar,c.sub);
      let bestDeficit=-Infinity;
      for(let l=0;l<9;l++){
        const deficit=laneTarget[l]-laneCount[l];
        const centerPenalty=l===4?18:0;
        const preferencePenalty=Math.abs(l-lane)*1.5;
        const score=deficit-centerPenalty-preferencePenalty;
        if(score>bestDeficit){bestDeficit=score;lane=l;}
      }
      if(add(c.t,lane))laneCount[lane]++;
    }

    // If a few notes are still missing, add second notes to selected single-note events.
    if(notes.length<TARGET_NOTES){
      const times=[...perTime.keys()].sort((a,b)=>a-b);
      for(const t of times){
        if(notes.length>=TARGET_NOTES)break;
        if((perTime.get(t)||0)!==1)continue;
        const first=notes.find(n=>n.timeMs===t)?.lane;
        if(first==null)continue;
        const candidates2=[8-first, first<4?6:2, first<4?7:1, first<4?5:3];
        for(const l of candidates2){
          if(l===first||l===4)continue;
          if(add(t,l)){laneCount[l]++;break;}
        }
      }
    }

    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    return {
      title:'HAPPY PARTY TRAIN',
      artist:'Aqours',
      difficulty:'EXPERT / SIF参考・二本指向け',
      bpm:BPM,
      offsetMs:0,
      noteCount:notes.length,
      notes
    };
  }

  async function prepareHpt0838(){
    const title='HAPPY PARTY TRAIN';
    const next=makeHpt0838();
    next.audioKey=HPT_AUDIO_KEY;
    if(typeof window.setActiveRhythmChart==='function'){
      window.setActiveRhythmChart(next,`${title}（${next.notes.length} notes）`,HPT_AUDIO_KEY);
    }else{
      chart=next;validateChart(chart);
      chartName.textContent=`${title}（${chart.notes.length} notes）`;
      offsetInput.value=String(getSavedTimingOffset());
    }
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    if(typeof window.preparePresetAudio==='function') await window.preparePresetAudio(HPT_AUDIO_KEY,title);
    else{
      try{
        const cached=await getPresetAudio(HPT_AUDIO_KEY);
        if(cached&&usePresetAudio(cached,title)){canStart();return;}
      }catch(e){console.warn(e);}
      awaitingPresetAudioKey=HPT_AUDIO_KEY;
      songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
      try{audioFile.click();}catch(_){}
    }
    canStart();
  }

  function patchHptCard(){
    const grid=document.getElementById('songLibraryGrid');
    if(!grid)return;
    [...grid.querySelectorAll('.song-library-card')].forEach(card=>{
      const title=card.querySelector('h3')?.textContent?.trim();
      if(title!=='HAPPY PARTY TRAIN')return;
      const old=card.querySelector('button');
      if(!old||old.dataset.hpt0838==='1')return;
      const btn=old.cloneNode(true);
      btn.dataset.hpt0838='1';
      btn.dataset.v077='1';
      old.replaceWith(btn);
      btn.addEventListener('click',prepareHpt0838);
    });
  }

  const library=document.getElementById('songLibraryScreen');
  if(library){
    new MutationObserver(()=>requestAnimationFrame(patchHptCard)).observe(library,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  }
  requestAnimationFrame(()=>requestAnimationFrame(patchHptCard));
  window.makeHappyPartyTrainChartV0838=makeHpt0838;
})();
