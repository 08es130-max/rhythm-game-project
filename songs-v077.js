// Ver.0.8.227: Boooooom Bee hold density raised further toward HPT level.
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
    const B=builder('Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会',160,1370,225000);
    const {add,chord,bars,at,half}=B;

    // 0-12: intro - big "boom" accents with space between answers.
    bars(0,12,(bar,t)=>{
      const p=bar%6;
      if(p===0){chord(t(0),0,8);add(t(2),4);add(t(5),2);add(t(7),6);}
      if(p===1){add(t(0),1);add(t(1),3);add(t(3),5);add(t(6),7);}
      if(p===2){chord(t(0),1,7);add(t(2),5);add(t(4),4);add(t(7),3);}
      if(p===3){add(t(0),8);add(t(2),6);add(t(3),4);add(t(5),2);add(t(7),0);}
      if(p===4){add(t(0),2);add(t(2),3);chord(t(4),1,7);add(t(7),5);}
      if(p===5){add(t(0),6);add(t(1),5);add(t(3),3);chord(t(6),0,8);}
    });

    // 12-38: verse - syncopated speech-like rhythm, 8 genuinely different bars.
    const verseSubs=[[0,2,5,7],[0,1,4,6,7],[0,3,5,7],[0,2,3,6],[0,1,3,5,7],[0,2,5,6],[0,3,4,7],[0,1,4,7]];
    const verseLanes=[[1,3,6,5],[7,5,3,1,4],[2,4,7,5],[6,4,1,3],[0,3,5,7,4],[8,5,2,4],[1,4,6,2],[7,4,2,6]];
    bars(12,38,(bar,t)=>{
      const k=(bar-12)%8;
      verseSubs[k].forEach((s,i)=>add(t(s),verseLanes[k][i]));
      if(k===3)chord(t(7),1,7);
      if(k===7)chord(t(6),2,6);
    });

    // 38-50: pre-chorus - axis pressure rises, but changes every two bars.
    bars(38,50,(bar,t)=>{
      const k=(bar-38)%6, right=k>=3,axis=right?6:2,inner=right?5:3,far=right?7:1;
      if(k===0||k===3){add(t(0),axis);add(t(1),inner);add(t(2),axis);add(t(5),far);add(t(7),axis);}
      else if(k===1||k===4){add(t(0),inner);add(t(2),axis);chord(t(4),right?2:6,axis);add(t(7),far);}
      else {add(t(0),far);add(t(2),axis);add(t(3),inner);add(t(5),axis);chord(t(7),right?1:7,axis);}
    });

    // 50-76: chorus - large hits, quick answers, changing shapes instead of one loop.
    bars(50,76,(bar,t)=>{
      const k=(bar-50)%8;
      const P=[
        ()=>{chord(t(0),0,8);add(t(1),4);add(t(3),3);add(t(4),5);chord(t(7),1,7);},
        ()=>{add(t(0),1);add(t(1),3);add(t(2),5);add(t(4),7);add(t(6),4);},
        ()=>{chord(t(0),2,6);add(t(2),4);add(t(3),7);add(t(5),6);chord(t(7),1,7);},
        ()=>{add(t(0),8);add(t(1),6);add(t(3),4);add(t(4),2);add(t(6),0);},
        ()=>{chord(t(0),1,7);add(t(2),5);add(t(3),4);add(t(4),3);chord(t(7),0,8);},
        ()=>{add(t(0),0);add(t(1),2);add(t(2),4);add(t(4),6);add(t(5),8);add(t(7),4);},
        ()=>{chord(t(0),3,5);add(t(2),2);add(t(3),4);add(t(5),6);chord(t(7),1,7);},
        ()=>{add(t(0),7);add(t(1),5);add(t(3),4);add(t(5),3);chord(t(7),0,8);}
      ];P[k]();
    });

    // 76-88: break - fewer notes and wider travel.
    bars(76,88,(bar,t)=>{
      const k=(bar-76)%4;
      const subs=[[0,3,7],[0,2,5,7],[0,4,6],[0,1,5,7]][k];
      const lanes=[[0,4,8],[8,5,2,0],[1,4,7],[7,5,3,1]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
    });

    // 88-112: verse 2 - new call/response, not verse-1 copy.
    bars(88,112,(bar,t)=>{
      const k=(bar-88)%6;
      const subs=[[0,2,4,7],[0,1,3,6],[0,3,5,7],[0,2,5,7],[0,1,4,6,7],[0,3,6]][k];
      const lanes=[[2,4,6,7],[7,5,3,1],[0,3,6,4],[8,5,2,4],[1,3,5,7,4],[6,4,2]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
      if(k===5)chord(t(7),1,7);
    });

    // 112-124: second build with short Spica-like bursts.
    bars(112,124,(bar,t)=>{
      const flip=bar&1;
      if(bar%3===0){add(t(0),flip?6:2);add(t(1),flip?5:3);add(t(2),flip?6:2);add(t(4),4);chord(t(7),1,7);}
      else if(bar%3===1){add(t(0),flip?7:1);add(t(2),4);add(t(3),flip?5:3);add(t(5),flip?6:2);add(t(7),4);}
      else {chord(t(0),2,6);add(t(2),flip?5:3);add(t(3),4);add(t(4),flip?3:5);chord(t(7),1,7);}
    });

    // 124-146: final chorus - highest density but many phrase variants.
    bars(124,146,(bar,t)=>{
      const k=(bar-124)%10;
      const variants=[
        [[0,8],[1,4],[3,3],[4,5],[6,2],[7,6]],
        [[0,1],[1,3],[2,5],[3,7],[5,4],[7,0]],
        [[0,2],[0,6],[2,4],[4,7],[5,5],[7,1]],
        [[0,8],[1,6],[2,4],[3,2],[4,0],[7,4]],
        [[0,1],[0,7],[2,5],[3,4],[5,3],[7,2]],
        [[0,0],[1,2],[3,4],[4,6],[6,8],[7,4]],
        [[0,3],[0,5],[2,2],[3,4],[5,6],[7,1]],
        [[0,7],[1,5],[3,3],[4,1],[6,4],[7,8]],
        [[0,0],[0,8],[2,3],[4,5],[5,2],[7,6]],
        [[0,2],[1,4],[2,6],[4,3],[5,5],[7,1]]
      ][k];
      const by=new Map();
      variants.forEach(([s,l])=>{if(by.has(s))chord(t(s),by.get(s),l);else{by.set(s,l);add(t(s),l);}});
    });

    bars(146,150,(bar,t)=>{
      const seq=bar&1?[8,6,4,2,0,4]:[0,2,4,6,8,4];
      [0,1,2,4,5,7].forEach((s,i)=>add(t(s),seq[i]));
      if(bar===149)chord(t(7),0,8);
    });

    const base=B.finish();
    const specs=[[6,0,6,6,1],[10,0,10,8,7],[14,0,14,10,2],[18,0,18,6,6],[22,0,22,12,1],[26,0,26,8,7],[30,0,30,6,2],[34,0,34,8,6],[38,0,38,10,1],[42,0,42,6,7],[46,0,46,12,2],[50,0,50,8,6],[54,0,54,6,1],[58,0,58,8,7],[62,0,62,10,2],[66,0,66,6,6],[70,0,70,12,1],[74,0,74,8,7],[78,0,78,6,2],[82,0,82,8,6],[86,0,86,10,1],[90,0,90,6,7],[94,0,94,12,2],[98,0,98,8,6],[102,0,102,6,1],[106,0,106,8,7],[110,0,110,10,2],[114,0,114,6,6],[118,0,118,12,1],[122,0,122,8,7],[126,0,126,6,2],[130,0,130,8,6],[134,0,134,10,1],[138,0,138,6,7],[142,0,142,12,2],[146,0,146,8,6],[8,0,8,6,2],[24,0,24,8,6],[40,0,40,10,1],[56,0,56,6,7],[72,0,72,8,2],[88,0,88,10,6],[104,0,104,6,1],[120,0,120,8,7],[136,0,136,10,2]].map(([b,s,eb,es,l])=>({start:at(b,s),end:at(eb,es),lane:l}));

    function finalizeWithHolds(rawNotes, holdSpecs){
      let work=rawNotes.map(n=>({...n})).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      const side=l=>l<4?-1:l>4?1:0;
      const accepted=[];

      // Build explicit long notes. Holds never overlap; leave 220ms after release.
      for(const spec of holdSpecs){
        const start=Math.round(spec.start),end=Math.round(spec.end),lane=spec.lane;
        if(end<=start+300)continue;
        if(accepted.some(h=>start<h.end+220&&end>h.start-220))continue;
        const heldSide=side(lane);
        const byTime=new Map(),kept=[];
        for(const n of work){
          if(n.timeMs<start-25||n.timeMs>end+25){kept.push(n);continue;}
          if(Math.abs(n.timeMs-start)<=25){
            // At a hold start, keep at most one partner, on the opposite side or center.
            if(n.lane===lane)continue;
            const ns=side(n.lane);
            if(heldSide!==0&&ns===heldSide)continue;
            const prev=byTime.get(start);
            if(!prev)byTime.set(start,n);
            continue;
          }
          if(Math.abs(n.timeMs-end)<=25){
            if(n.lane===lane)continue;
            const ns=side(n.lane);
            if(heldSide!==0&&ns===heldSide)continue;
            const prev=byTime.get(end);
            if(!prev)byTime.set(end,n);
            continue;
          }
          if(n.timeMs>start&&n.timeMs<end){
            // One thumb is holding: only one tap at a time on the free side.
            const ns=side(n.lane);
            if(heldSide<0&&ns<=0)continue;
            if(heldSide>0&&ns>=0)continue;
            if(heldSide===0&&ns===0)continue;
            const prev=byTime.get(n.timeMs);
            if(!prev)byTime.set(n.timeMs,n);
            continue;
          }
        }
        kept.push(...byTime.values(),{timeMs:start,lane,holdEndMs:end,holdVisualOnly:true});
        work=kept.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
        accepted.push({start,end,lane});
      }

      // Exact simultaneous-note rule:
      // left + right, or center + either side. Never left+left / right+right.
      const groups=new Map();
      for(const n of work){
        if(!groups.has(n.timeMs))groups.set(n.timeMs,[]);
        groups.get(n.timeMs).push(n);
      }
      for(const g of groups.values()){
        if(g.length>2)g.splice(2);
        if(g.length!==2)continue;
        const [a,b]=g,sa=side(a.lane),sb=side(b.lane);
        if(sa!==0&&sa===sb){
          const move=Math.abs(a.lane-4)<Math.abs(b.lane-4)?a:b;
          move.lane=8-move.lane;
          if(move.lane===4)move.lane=sa<0?6:2;
        }
      }
      work=[...groups.values()].flat().sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

      // Spica-style rolling burst guard: at most two starts in any 115ms.
      const safe=[];
      for(const n of work){
        let recent=safe.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
        if(recent.length>=2){
          if(n.holdVisualOnly){
            // Hold starts are structural. Prefer the hold and drop the latest ordinary
            // tap in the same 115ms burst instead of silently deleting the hold.
            for(let i=safe.length-1;i>=0&&recent.length>=2;i--){
              const x=safe[i];
              if(n.timeMs-x.timeMs<0||n.timeMs-x.timeMs>=115)continue;
              if(x.holdVisualOnly)continue;
              safe.splice(i,1);
              recent=safe.filter(y=>n.timeMs-y.timeMs>=0&&n.timeMs-y.timeMs<115);
            }
          }
          if(recent.length>=2)continue;
        }
        safe.push(n);
      }

      // Re-check hold-body ergonomics after chord correction.
      const final=[];
      for(const n of safe){
        const active=safe.find(h=>h.holdVisualOnly&&h!==n&&n.timeMs>h.timeMs&&n.timeMs<h.holdEndMs);
        if(!active){final.push(n);continue;}
        const hs=side(active.lane),ns=side(n.lane);
        if(hs<0&&ns<=0)continue;
        if(hs>0&&ns>=0)continue;
        if(hs===0&&ns===0)continue;
        if(final.some(x=>x.timeMs===n.timeMs&&x!==active))continue;
        final.push(n);
      }
      final.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      return {notes:final,holdCount:final.filter(n=>n.holdVisualOnly).length};
    }

    const fin=finalizeWithHolds(base.notes,specs);
    base.notes=fin.notes;base.noteCount=fin.notes.length;base.holdCount=fin.holdCount;base.bpm=160;
    return base;
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
