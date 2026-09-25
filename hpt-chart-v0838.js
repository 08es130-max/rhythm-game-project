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

    // Ver.0.8.213: replace the full first-verse/first-chorus section with a
    // transcription from the supplied original SIF EXPERT full-combo video.
    // Video pre-roll was removed and hit times were snapped to the 170 BPM 1/16 grid.
    // The full-song LoveFes audio continues after this point, so only the first section
    // is replaced; the existing full-song continuation remains intact.
    const SIF_FIRST_END_MS=102353;
    const sifFirstPart=[[1235,0],[1941,6],[2912,2],[4765,2],[5647,6],[6176,3],[7059,6],[7235,5],[7412,7],[7588,8],[7765,0],[7941,1],
[8118,3],[8294,1],[8294,2],[8471,7],[8559,3],[8647,8],[8824,6],[9000,5],[9000,8],[9176,3],[9353,2],[9529,0],
[9706,1],[9706,7],[9882,5],[10059,4],[10235,3],[10412,8],[10412,2],[10500,6],[10588,2],[10765,6],[10765,0],[10941,2],
[10941,6],[11118,7],[11118,1],[11824,0],[11824,8],[12000,0],[12176,2],[12176,6],[12529,5],[12618,1],[12882,8],[13235,6],
[13235,0],[13588,2],[13941,5],[14294,1],[14294,4],[14471,2],[15000,8],[15000,0],[15353,3],[15441,7],[15706,0],[15971,8],
[16147,2],[16412,6],[16765,3],[17029,4],[17118,7],[17471,6],[17647,3],[17735,5],[17824,3],[18000,4],[18176,0],[18176,6],
[18529,2],[18882,7],[19235,3],[19235,5],[19588,4],[19941,8],[19941,0],[20118,4],[20206,1],[20206,4],[20382,7],[20471,3],
[20559,5],[20647,3],[21000,2],[21000,6],[21176,1],[21353,7],[21529,5],[21529,0],[21706,1],[21882,8],[22235,7],[22588,2],
[22676,6],[22765,2],[22941,4],[23029,8],[23118,0],[23294,4],[23471,4],[23824,7],[24353,3],[24706,5],[24882,6],[25059,7],
[25235,8],[26118,0],[26294,6],[26647,5],[27176,2],[27706,6],[28059,8],[28588,5],[29118,0],[29294,1],[29471,2],[30000,8],
[30529,2],[30882,3],[31500,6],[31941,2],[32294,0],[32824,1],[33000,8],[33176,7],[33353,6],[33529,5],[33706,4],[34324,3],
[34765,0],[35206,8],[35735,1],[36176,3],[36529,5],[36618,8],[37147,2],[37588,1],[37941,0],[38559,7],[39000,5],[39353,3],
[39882,6],[40412,7],[40765,1],[41118,5],[41294,3],[41824,6],[42176,7],[42529,3],[43235,2],[43324,5],[43588,1],[43941,8],
[44294,0],[44647,1],[44647,5],[45000,3],[45000,7],[45353,4],[45529,2],[45529,6],[45882,3],[45882,5],[46235,0],[46324,8],
[46588,0],[46765,6],[47118,7],[47294,6],[47471,7],[47471,3],[47824,5],[48176,2],[48176,7],[48529,1],[48618,2],[48882,0],
[48882,6],[49235,7],[49588,1],[49588,5],[49941,6],[50294,8],[50294,3],[50647,5],[51000,6],[51000,1],[51176,4],[51529,2],
[51529,6],[51706,3],[51706,5],[52147,8],[52412,2],[52765,1],[52941,2],[53118,5],[53471,1],[53471,3],[53824,6],[54176,7],
[54529,2],[54529,8],[54882,1],[55235,7],[55235,3],[55588,2],[55941,0],[55941,5],[56294,3],[56647,2],[56647,7],[56824,1],
[56824,6],[57176,5],[57265,3],[57265,1],[57353,5],[57529,4],[57618,8],[58059,1],[58412,2],[58588,1],[58765,2],[59118,0],
[59471,1],[59647,2],[60000,3],[60176,2],[60529,2],[60882,7],[61059,6],[61412,5],[61588,6],[61941,8],[62294,7],[62471,6],
[62824,4],[63353,0],[63706,1],[63706,5],[64059,6],[64235,7],[64412,0],[64412,6],[64765,4],[65118,1],[65118,7],[65294,3],
[65294,5],[65824,0],[65824,6],[66176,2],[66176,8],[66353,4],[66529,7],[66706,4],[66882,2],[66971,4],[67059,3],[67059,5],
[67235,4],[67500,4],[67500,8],[67588,0],[67765,4],[67941,1],[67941,5],[68118,4],[68294,3],[68294,7],[68471,1],[68647,6],
[69000,7],[69353,8],[69706,1],[69882,8],[70059,2],[70412,1],[70500,5],[70765,0],[71118,7],[71294,0],[71294,6],[71471,5],
[71824,2],[71824,6],[72176,0],[72441,8],[72529,3],[72706,5],[72882,1],[73059,6],[73147,2],[73235,6],[73412,3],[73588,5],
[73765,4],[73941,6],[74029,4],[74118,5],[74206,3],[74294,4],[74647,2],[75000,8],[75000,0],[75176,6],[75265,1],[75706,3],
[75794,1],[76059,6],[76412,0],[76412,8],[76676,7],[76765,2],[77118,5],[77471,0],[77471,6],[77647,5],[77647,7],[77824,1],
[78176,2],[78176,8],[78353,1],[78529,3],[78529,7],[78882,0],[78882,4],[79059,0],[79235,0],[79412,0],[79588,0],[79588,5],
[79765,0],[79765,6],[79941,0],[79941,7],[80029,8],[80118,0],[80294,0],[80294,6],[80471,1],[80471,6],[80647,2],[80647,6],
[81000,4],[81176,5],[81265,1],[81353,5],[81618,1],[81706,8],[81882,6],[82059,3],[82059,7],[82235,1],[82324,0],[82765,2],
[82765,5],[83118,3],[83471,1],[83824,2],[83912,6],[84176,0],[84529,8],[84706,7],[84882,3],[84882,8],[85235,0],[85412,1],
[85588,0],[85676,5],[85941,8],[86118,7],[86294,2],[86294,6],[86471,8],[86647,0],[86824,3],[86912,7],[87000,3],[87176,4],
[87353,0],[87529,2],[87529,3],[87706,1],[87706,5],[88059,8],[88235,7],[88412,3],[88412,6],[88765,5],[89118,7],[89471,6],
[89647,2],[89824,8],[90000,5],[90176,3],[90529,8],[90529,3],[90706,8],[90882,0],[90882,8],[91235,2],[91235,6],[91588,1],
[91588,5],[91941,1],[91941,7],[92206,3],[92294,1],[92294,7],[92471,7],[92647,7],[93000,5],[93176,3],[93265,5],[93706,0],
[93706,6],[93882,6],[94059,2],[94059,6],[94324,2],[94324,8],[94588,2],[94765,2],[94765,6],[95118,3],[95118,5],[95294,4],
[95471,0],[95471,5],[95647,6],[95824,1],[95824,3],[96000,2],[96176,7],[96441,3],[96529,5],[96706,6],[96794,0],
[96882,8],[96971,2],[97059,7],[97235,8],[97235,0],[97412,4],[97588,4],[97765,1],[97765,7],[98118,2],[98118,6],[98471,8],
[98559,0],[98647,8],[98824,1],[99000,3],[99000,5],[99353,2],[99529,1],[99706,0],[99706,8],[100059,7],[100235,6],[100324,3],
[100412,5],[100588,3],[100588,5],[100941,7],[101029,1],[101118,7],[101471,3],[101471,5],[101647,4],[101824,4],[102000,2],[102000,6],
[102353,0],[102353,5]];
    const continuation=notes.filter(n=>n.timeMs>SIF_FIRST_END_MS);

    // LoveFes two-thumb simultaneous-note rules take priority over the source video:
    // - at most two starts inside any rolling 115ms window;
    // - a two-note chord must use opposite sides (center may pair with either side);
    // - never require a third finger immediately before/after a chord.
    const first=sifFirstPart.map(([timeMs,lane])=>({timeMs,lane}));
    const groups=new Map();
    for(const n of first){
      if(!groups.has(n.timeMs))groups.set(n.timeMs,[]);
      groups.get(n.timeMs).push(n);
    }
    const side=l=>l<4?-1:l>4?1:0;
    for(const g of groups.values()){
      if(g.length!==2)continue;
      const [a,b]=g;
      const sa=side(a.lane),sb=side(b.lane);
      if(sa!==0&&sa===sb){
        const keep=Math.abs(a.lane-4)>=Math.abs(b.lane-4)?a:b;
        const move=keep===a?b:a;
        move.lane=keep.lane<4?Math.max(5,8-keep.lane):Math.min(3,8-keep.lane);
      }
    }
    first.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

    const safeFirst=[];
    for(const n of first){
      const recent=safeFirst.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
      if(recent.length>=2)continue;
      safeFirst.push(n);
    }

    // Slight density lift for LoveFes. Only fill genuinely wide gaps in the SIF
    // transcription, keeping at least 115ms from neighboring starts and stopping
    // at 525 notes for the first section.
    const FIRST_TARGET=560;
    const lanePattern=[2,6,3,5,1,7,4,6,2,5,3,7,1];
    let fillIndex=0;
    while(safeFirst.length<FIRST_TARGET){
      const times=[...new Set(safeFirst.map(n=>n.timeMs))].sort((a,b)=>a-b);
      let added=false;
      for(let i=0;i<times.length-1&&safeFirst.length<FIRST_TARGET;i++){
        const a=times[i],b=times[i+1];
        if(b-a<350)continue;
        const t=Math.round(a+(60000/BPM)/2);
        if(t-a<115||b-t<115)continue;
        if(safeFirst.some(n=>Math.abs(n.timeMs-t)<115))continue;
        safeFirst.push({timeMs:t,lane:lanePattern[fillIndex++%lanePattern.length]});
        added=true;
      }
      if(!added)break;
    }

    // Re-introduce SIF-style long notes for the first section while keeping
    // LoveFes' two-thumb rules stricter than the source chart.
    // Rules:
    // - no center-lane holds;
    // - no overlapping holds;
    // - keep at least 220ms between a release and the next hold start;
    // - while holding, only one ordinary note at a time may appear on the opposite side;
    // - never leave an ordinary note on the held side during the hold body.
    const HOLD_TARGET=42;
    const HOLD_STEP=Math.round((60000/BPM)/2); // 1/8 note at 170 BPM
    const sortedFirst=[...safeFirst].sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    let holdCount=0, heldUntil=-Infinity;
    for(const n of sortedFirst){
      if(holdCount>=HOLD_TARGET)break;
      if(n.lane===4||n.timeMs<heldUntil+220)continue;
      const s=side(n.lane);
      let hazard=n.timeMs+HOLD_STEP*4; // cap at ~706ms
      const inside=sortedFirst.filter(x=>x.timeMs>n.timeMs&&x.timeMs<hazard);
      for(const x of inside){
        // Same-side taps would require the holding thumb, so end before them.
        if(side(x.lane)===s){hazard=Math.min(hazard,x.timeMs-130);break;}
      }
      // A hold already consumes one thumb. Two ordinary starts inside any 115ms
      // window on the free side would become an effective three-finger pattern.
      const free=inside.filter(x=>side(x.lane)!==s);
      for(let i=0;i<free.length;i++){
        for(let j=i+1;j<free.length;j++){
          if(free[j].timeMs-free[i].timeMs<115){
            hazard=Math.min(hazard,free[j].timeMs-130);
            break;
          }
        }
      }
      let steps=Math.floor((hazard-n.timeMs)/HOLD_STEP);
      steps=Math.min(4,steps);
      if(steps<2)continue; // minimum ~353ms
      const end=n.timeMs+steps*HOLD_STEP;
      if(end<=n.timeMs+300)continue;
      n.holdEndMs=end;
      n.holdVisualOnly=true;
      heldUntil=end;
      holdCount++;
    }

    // Ver.0.8.216: extend the approved first-part design into verse 2 and the final chorus.
    // Keep the first 102.353s untouched. Reuse its authored rhythm/hold language, not the
    // older generic continuation, for the matching late-song sections.
    const SECOND_START_MS=Math.round(at(136,0));
    const FINAL_START_MS=Math.round(at(174,0));
    const FINAL_END_MS=END_MS;

    function cloneApprovedSection(sourceFrom,sourceTo,targetStart,targetEnd,mirror=false){
      const shift=targetStart-sourceFrom;
      const out=[];
      for(const src of sortedFirst){
        if(src.timeMs<sourceFrom||src.timeMs>sourceTo)continue;
        if(Number.isFinite(src.holdEndMs)&&src.holdEndMs>sourceTo)continue;
        const timeMs=src.timeMs+shift;
        if(timeMs>targetEnd)continue;
        const lane=mirror?8-src.lane:src.lane;
        const n={timeMs,lane};
        if(Number.isFinite(src.holdEndMs)){
          const holdEndMs=src.holdEndMs+shift;
          if(holdEndMs<=targetEnd){
            n.holdEndMs=holdEndMs;
            n.holdVisualOnly=true;
          }
        }
        out.push(n);
      }
      return out;
    }

    // Verse 2: reuse ~54s of the approved first part, mirrored so it feels related
    // without becoming a literal visual repeat.
    const secondSourceFrom=4765;
    const secondSourceTo=58765;
    let secondPart=cloneApprovedSection(
      secondSourceFrom,secondSourceTo,
      SECOND_START_MS,FINAL_START_MS-1,
      true
    );

    // Final chorus: reuse the densest final ~30s of the approved first part.
    // Keep the original orientation so the song's final return feels familiar.
    const finalSourceFrom=72441;
    const finalSourceTo=SIF_FIRST_END_MS;
    let finalPart=cloneApprovedSection(
      finalSourceFrom,finalSourceTo,
      FINAL_START_MS,FINAL_END_MS,
      false
    );

    // A small finale-only lift: add safe opposite-side chord accents at selected
    // single-note moments. Never alter holds, never exceed two simultaneous starts,
    // and never create an effective three-finger pattern inside a running hold.
    function addFinaleAccents(section,targetCount){
      const out=[...section].sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      let added=0;
      const times=[...new Set(out.map(n=>n.timeMs))];
      for(const t of times){
        if(added>=targetCount)break;
        const same=out.filter(n=>n.timeMs===t);
        if(same.length!==1)continue;
        const base=same[0];
        if(base.holdVisualOnly)continue;
        const active=out.find(h=>Number.isFinite(h.holdEndMs)&&t>h.timeMs&&t<h.holdEndMs);
        if(active)continue;
        const recent=out.filter(n=>Math.abs(n.timeMs-t)<115);
        if(recent.length!==1)continue;
        const partner=base.lane<4?Math.max(5,8-base.lane):base.lane>4?Math.min(3,8-base.lane):(added&1?2:6);
        if(partner===base.lane)continue;
        out.push({timeMs:t,lane:partner});
        added++;
      }
      return out.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    }
    finalPart=addFinaleAccents(finalPart,18);

    // Preserve only the middle instrumental bridge from the old authored continuation.
    const bridge=continuation.filter(n=>n.timeMs<SECOND_START_MS);

    notes.length=0;
    notes.push(...sortedFirst,...bridge,...secondPart,...finalPart);

    // Absolute LoveFes playability guard for the newly generated late-song sections.
    // First part is already approved and remains byte-for-byte identical.
    const protectedFirst=notes.filter(n=>n.timeMs<=SIF_FIRST_END_MS);
    const late=notes.filter(n=>n.timeMs>SIF_FIRST_END_MS).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    const safeLate=[];
    let activeHold=null;
    let lastHoldEnd=-Infinity;
    for(const src of late){
      const n={...src};
      if(activeHold&&n.timeMs>=activeHold.holdEndMs)activeHold=null;

      if(Number.isFinite(n.holdEndMs)){
        if(n.lane===4||activeHold||n.timeMs<lastHoldEnd+220){
          delete n.holdEndMs; delete n.holdVisualOnly;
        }else{
          activeHold=n;
          lastHoldEnd=n.holdEndMs;
        }
      }

      if(activeHold&&n!==activeHold&&n.timeMs>activeHold.timeMs&&n.timeMs<activeHold.holdEndMs){
        const heldSide=side(activeHold.lane);
        if(side(n.lane)===heldSide||n.lane===activeHold.lane)continue;
        const tapInWindow=safeLate.some(x=>
          x!==activeHold&&!x.holdVisualOnly&&
          x.timeMs>activeHold.timeMs&&x.timeMs<activeHold.holdEndMs&&
          Math.abs(x.timeMs-n.timeMs)<115
        );
        if(tapInWindow)continue;
      }

      const recent=safeLate.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
      if(recent.length>=2)continue;
      const same=safeLate.filter(x=>Math.abs(x.timeMs-n.timeMs)<=18);
      if(same.length>=2||same.some(x=>x.lane===n.lane))continue;
      if(same.length===1){
        const sa=side(same[0].lane),sb=side(n.lane);
        if(sa!==0&&sa===sb){
          n.lane=same[0].lane<4?Math.max(5,8-same[0].lane):Math.min(3,8-same[0].lane);
        }
      }
      safeLate.push(n);
    }

    notes.length=0;
    notes.push(...protectedFirst,...safeLate);
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    return {
      title:'HAPPY PARTY TRAIN',
      artist:'Aqours',
      difficulty:'EXPERT / SIF本家基準・全曲二本指向け',
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
