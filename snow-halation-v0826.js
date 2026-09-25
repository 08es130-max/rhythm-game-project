// Ver.0.8.232: Snow halation MASTER density tuned to about 1400 notes.
(function(){
  'use strict';
  const TITLE='Snow halation';
  const ARTIST="μ's";
  const AUDIO_KEY='snow-halation';
  const BPM=173;
  const START=1200;
  const END=258800;

  function makeChart(){
    const beat=60000/BPM,q=beat/4,notes=[],seen=new Set(),perTime=new Map();
    const add=(t,l)=>{
      t=Math.round(t);l=Math.max(0,Math.min(8,Math.round(l)));
      if(t<START||t>END)return;
      const k=t+':'+l,c=perTime.get(t)||0;
      if(seen.has(k)||c>=2)return;
      seen.add(k);perTime.set(t,c+1);notes.push({timeMs:t,lane:l});
    };
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,s)=>START+(bar*16+s)*q;
    const sec=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar,s=>at(bar,s));};
    const place=(t,subs,lanes)=>subs.forEach((s,i)=>add(t(s),lanes[i]));
    const chordAt=(t,s,a,b)=>chord(t(s),a,b);

    // Intro 0-9: piano/bell. Sparse beginnings, held tones and small sparkling pickups.
    sec(0,9,(bar,t)=>{
      const k=bar;
      if(k===0){place(t,[0,8],[4,6]);}
      if(k===1){place(t,[0,6,12],[1,4,7]);}
      if(k===2){place(t,[0,4,10,14],[7,5,3,1]);}
      if(k===3){chordAt(t,0,1,7);place(t,[6,12],[4,2]);}
      if(k===4){place(t,[0,5,11,15],[2,4,6,4]);}
      if(k===5){place(t,[0,4,8,13],[8,6,3,1]);}
      if(k===6){chordAt(t,0,0,8);place(t,[7,12],[4,5]);}
      if(k===7){place(t,[0,3,9,14],[1,3,6,7]);}
      if(k===8){place(t,[0,2,6,10,14],[2,4,6,5,3]);chordAt(t,15,1,7);}
    });

    // Verse 1A 9-22: acoustic-guitar feel. Follow vocal syllables with gaps; no fixed pulse.
    const aSubs=[
      [0,4,7,11,14],[0,3,6,10,13,15],[0,2,5,9,12],[0,1,5,8,12,15],
      [0,4,6,10,14],[0,3,7,11,15],[0,2,6,9,13],[0,1,4,8,11,15],
      [0,5,9,12,15],[0,3,6,8,12,14],[0,2,5,10,13,15],[0,4,7,11,14]
    ];
    const aLane=[
      [1,3,5,6,2],[7,5,3,1,4,6],[2,4,6,5,3],[6,4,2,5,7,3],
      [0,3,5,7,4],[8,5,2,4,6],[1,4,7,5,2],[7,4,1,3,6,2],
      [2,5,7,4,1],[6,3,1,4,7,2],[0,3,6,4,2,7],[8,5,3,1,4]
    ];
    sec(9,22,(bar,t)=>{
      const k=(bar-9)%aSubs.length;place(t,aSubs[k],aLane[k]);
      if(bar===15)chordAt(t,15,2,6);
      if(bar===21)chordAt(t,14,1,7);
    });

    // Verse 1B 22-31: band comes in / 4-kick. More steady quarter/eighth pulse, but still melodic.
    sec(22,31,(bar,t)=>{
      const k=(bar-22)%5;
      if(k===0){place(t,[0,4,8,12,15],[1,3,5,7,4]);}
      if(k===1){place(t,[0,2,6,8,11,14],[7,5,3,4,6,2]);}
      if(k===2){place(t,[0,4,7,10,12,15],[2,4,7,5,3,1]);}
      if(k===3){place(t,[0,3,6,8,12,14],[6,4,1,3,5,7]);}
      if(k===4){chordAt(t,0,1,7);place(t,[4,7,11,15],[4,6,2,4]);}
    });

    // Pre-chorus 31-39: half beat -> 8 beat. Fingers start getting busier toward the chorus.
    sec(31,35,(bar,t)=>{
      const k=bar-31;
      const subs=[[0,6,10,14],[0,4,8,12,15],[0,5,9,13],[0,3,7,11,15]][k];
      const lanes=[[1,4,7,3],[7,5,3,1,4],[2,4,6,3],[6,4,2,5,7]][k];
      place(t,subs,lanes);
    });
    sec(35,39,(bar,t)=>{
      const flip=bar&1;
      place(t,[0,2,4,6,9,11,13,15],flip?[7,5,3,1,4,6,2,4]:[1,3,5,7,4,2,6,4]);
      if(bar===38)chordAt(t,15,0,8);
    });

    // Chorus 1 39-59: much denser; phrase endings get chords, middles get quick cross-hand movement.
    const c1Subs=[
      [0,2,4,7,9,12,15],[0,1,3,6,8,11,14],[0,3,5,7,10,12,15],
      [0,2,5,8,10,13,15],[0,1,4,6,9,11,14,15],[0,2,4,7,10,12,15],
      [0,3,6,8,11,14],[0,1,3,5,8,10,13,15],[0,2,5,7,9,12,14],
      [0,1,4,7,10,13,15]
    ];
    const c1Lane=[
      [0,2,4,6,5,3,8],[1,3,5,7,4,2,6],[8,6,4,2,3,5,1],
      [2,4,7,5,3,1,6],[7,5,3,1,4,6,2,4],[0,3,6,8,5,2,4],
      [1,4,7,5,2,6],[7,4,1,3,6,2,5,4],[2,5,8,6,3,1,4],
      [6,3,0,2,5,7,4]
    ];
    sec(39,59,(bar,t)=>{
      const k=(bar-39)%10;place(t,c1Subs[k],c1Lane[k]);
      if(k===0||k===4||k===7)chordAt(t,15,1,7);
      if(k===2)chordAt(t,0,2,6);
    });

    // Interlude 59-67: 8-beat instrumental. Clear left-right travel with short bursts.
    sec(59,67,(bar,t)=>{
      const k=bar-59;
      const S=[
        [[0,2,4,8,12,15],[0,2,4,6,8,4]],
        [[0,1,3,7,10,14],[8,6,4,1,3,5]],
        [[0,4,8,12],[1,3,5,7]],
        [[0,2,5,9,13,15],[7,5,3,1,4,6]],
        [[0,1,2,6,10,14],[0,2,4,7,5,3]],
        [[0,3,7,11,15],[8,5,2,4,1]],
        [[0,2,4,6,9,12,15],[1,3,5,7,4,2,6]],
        [[0,1,4,8,11,14],[7,5,3,1,4,6]]
      ][k];
      place(t,S[0],S[1]);if(k===7)chordAt(t,15,0,8);
    });

    // Verse 2A 67-80: filter/half beat. Deliberately lighter again.
    const v2Subs=[
      [0,6,10,14],[0,4,8,13],[0,5,9,12,15],[0,3,7,11],[0,6,12,15],[0,4,9,14],
      [0,3,8,12,15],[0,5,10,14],[0,4,7,11,15],[0,6,9,13],[0,3,7,12,15],[0,5,8,14]
    ];
    const v2Lane=[
      [2,4,6,3],[6,4,2,5],[1,4,7,5,2],[7,5,3,1],[0,4,8,3],[8,5,2,4],
      [1,3,6,4,7],[7,4,1,5],[2,5,7,4,1],[6,3,1,5],[0,4,6,3,8],[8,4,2,5]
    ];
    sec(67,80,(bar,t)=>{const k=(bar-67)%12;place(t,v2Subs[k],v2Lane[k]);if(bar===79)chordAt(t,15,1,7);});

    // Verse 2B 80-96: band back in, rising pulse.
    sec(80,88,(bar,t)=>{
      const k=(bar-80)%4;
      const subs=[[0,4,8,12,15],[0,2,6,9,13,15],[0,3,7,10,14],[0,1,5,8,12,15]][k];
      const lanes=[[1,3,5,7,4],[7,5,3,1,4,6],[2,4,7,5,3],[6,4,2,5,7,3]][k];
      place(t,subs,lanes);
    });
    sec(88,96,(bar,t)=>{
      const flip=bar&1;
      place(t,[0,2,4,6,8,10,13,15],flip?[7,5,3,1,4,6,2,4]:[1,3,5,7,4,2,6,4]);
      if(bar===95)chordAt(t,15,0,8);
    });

    // Chorus 2 96-116: similar energy to chorus 1 but different rhythms/lanes.
    const c2Subs=[
      [0,1,3,5,8,11,14],[0,2,4,7,9,12,15],[0,3,6,8,10,13,15],
      [0,1,4,6,9,12,14],[0,2,5,7,10,13,15],[0,1,3,6,8,11,13,15],
      [0,2,4,8,10,12,15],[0,3,5,7,9,12,14],[0,1,4,7,10,13,15],
      [0,2,5,8,11,14]
    ];
    const c2Lane=[
      [1,3,5,7,4,2,6],[0,2,4,6,8,5,3],[8,6,4,2,3,5,1],
      [7,5,3,1,4,6,2],[2,5,8,6,3,1,4],[6,3,0,2,5,7,4,1],
      [1,4,7,5,2,6,3],[7,4,1,3,6,2,5],[0,3,5,8,6,2,4],
      [2,6,3,5,1,7]
    ];
    sec(96,116,(bar,t)=>{
      const k=(bar-96)%10;place(t,c2Subs[k],c2Lane[k]);
      if(k===1||k===5||k===8)chordAt(t,15,1,7);
      if(k===2)chordAt(t,0,2,6);
    });

    // Break / guitar solo 116-132: half-time feel. Lots of long-note room, few dense taps.
    sec(116,132,(bar,t)=>{
      const k=(bar-116)%8;
      const S=[
        [[0,8],[1,7]],[[0,6,12],[7,4,1]],[[0,4,10,15],[0,3,6,4]],[[0,8,14],[8,4,0]],
        [[0,3,9,15],[2,5,3,7]],[[0,6,12],[6,4,2]],[[0,4,8,13],[1,4,7,3]],[[0,7,14],[7,4,1]]
      ][k];
      place(t,S[0],S[1]);
    });

    // Chorus 3 132-154: All In. Starts with sustained accents, then turns into 16th/eighth bursts.
    sec(132,138,(bar,t)=>{
      const k=bar-132;
      if(k===0){chordAt(t,0,0,8);place(t,[6,12],[4,6]);}
      if(k===1){place(t,[0,5,10,14],[1,4,7,3]);}
      if(k===2){chordAt(t,0,1,7);place(t,[4,8,12,15],[4,6,2,4]);}
      if(k===3){place(t,[0,3,6,9,12,15],[7,5,3,1,4,6]);}
      if(k===4){chordAt(t,0,2,6);place(t,[2,5,8,11,14],[4,1,5,7,3]);}
      if(k===5){place(t,[0,1,4,7,10,13,15],[0,2,4,6,8,5,3]);}
    });
    sec(138,154,(bar,t)=>{
      const k=(bar-138)%8;
      const subs=[
        [0,1,3,5,7,9,11,13,15],[0,2,3,5,6,8,10,12,14],[0,1,4,6,8,10,13,15],[0,2,4,6,9,11,13,15],
        [0,1,3,6,8,10,12,15],[0,2,5,7,9,11,14,15],[0,1,4,7,9,12,14,15],[0,2,3,6,8,11,13,15]
      ][k];
      const lanes=[
        [0,2,4,7,5,3,1,6,4],[8,6,4,2,0,3,5,7,4],[1,3,5,7,4,2,6,4],[7,5,3,1,4,6,2,4],
        [2,5,8,6,3,1,4,7],[6,3,0,2,5,7,4,1],[1,4,7,5,2,6,3,4],[7,4,1,3,6,2,5,4]
      ][k];
      place(t,subs,lanes);
      if(k===0||k===3||k===6)chordAt(t,15,1,7);
    });

    // Post-chorus 154-171: "Start!!" and 8-beat instrumental drive.
    sec(154,162,(bar,t)=>{
      const k=bar-154;
      const S=[
        [[0,4,8,12,15],[1,3,5,7,4]],[[0,2,6,10,14],[7,5,3,1,4]],
        [[0,1,4,8,12,15],[0,2,4,6,8,4]],[[0,3,7,11,15],[8,5,2,4,1]],
        [[0,2,5,9,13,15],[1,4,7,5,2,6]],[[0,1,3,6,10,14],[7,5,3,1,4,6]],
        [[0,2,4,7,9,12,15],[0,3,6,8,5,2,4]],[[0,1,4,7,10,13,15],[8,5,3,1,4,6,2]]
      ][k];place(t,S[0],S[1]);
    });

    // Motown-style ending 162-187: busy bounce, then long-note-heavy outro.
    sec(162,176,(bar,t)=>{
      const k=(bar-162)%7;
      const subs=[[0,2,4,6,8,10,12,14],[0,1,4,6,9,11,14,15],[0,3,5,7,10,12,15],[0,2,5,8,10,13,15],[0,1,3,6,8,11,13,15],[0,2,4,7,9,12,14],[0,1,4,7,10,13,15]][k];
      const lanes=[[1,3,5,7,6,4,2,4],[7,5,3,1,4,6,2,4],[0,3,6,8,5,2,4],[8,5,2,4,7,1,3],[2,5,8,6,3,1,4,7],[6,3,0,2,5,7,4],[1,4,7,5,2,6,3]][k];
      place(t,subs,lanes);if(k===0||k===4)chordAt(t,15,1,7);
    });
    sec(176,187,(bar,t)=>{
      const k=bar-176;
      if(k===0){chordAt(t,0,0,8);place(t,[4,10],[4,6]);}
      if(k===1){place(t,[0,6,12],[1,4,7]);}
      if(k===2){place(t,[0,3,7,11,15],[7,5,3,1,4]);}
      if(k===3){chordAt(t,0,2,6);place(t,[5,10,14],[4,1,7]);}
      if(k===4){place(t,[0,2,6,9,13],[0,3,6,4,8]);}
      if(k===5){place(t,[0,4,8,12,15],[8,6,4,2,0]);}
      if(k===6){chordAt(t,0,1,7);place(t,[6,12],[4,5]);}
      if(k===7){place(t,[0,3,9,14],[2,5,3,7]);}
      if(k===8){chordAt(t,0,0,8);place(t,[8,14],[4,6]);}
      if(k===9){place(t,[0,6,12],[1,4,7]);}
      if(k===10){chordAt(t,0,2,6);add(t(8),4);chordAt(t,15,0,8);}
    });

    function finalize(raw){
      let work=raw.map(n=>({...n})).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      const side=l=>l<4?-1:l>4?1:0;

      // Long-note plan: present from the intro onward, concentrated in the half-time
      // bridge and outro, matching the reference MASTER's long-note character.
      const holds=[
        [3,0,3,8,1],[7,0,7,10,7],[11,0,11,8,2],[15,0,15,10,6],
        [19,0,19,8,1],[23,0,23,10,7],[27,0,27,8,2],[30,0,30,12,6],
        [33,0,33,8,1],[36,0,36,10,7],[40,0,40,8,2],[43,0,43,12,6],
        [47,0,47,8,1],[50,0,50,10,7],[54,0,54,8,2],[57,0,57,10,6],
        [61,0,61,8,1],[65,0,65,10,7],[69,0,69,8,2],[73,0,73,12,6],
        [77,0,77,8,1],[81,0,81,10,7],[85,0,85,8,2],[89,0,89,10,6],
        [93,0,93,8,1],[97,0,97,10,7],[101,0,101,8,2],[105,0,105,12,6],
        [109,0,109,8,1],[113,0,113,10,7],
        [117,0,117,12,2],[119,0,119,12,6],[121,0,121,12,1],[123,0,123,12,7],
        [125,0,125,12,2],[127,0,127,12,6],[129,0,129,12,1],[131,0,131,12,7],
        [134,0,134,8,2],[137,0,137,10,6],[141,0,141,8,1],[145,0,145,10,7],
        [149,0,149,8,2],[153,0,153,10,6],[157,0,157,8,1],[161,0,161,10,7],
        [165,0,165,8,2],[169,0,169,10,6],[173,0,173,8,1],
        [176,0,176,12,7],[178,0,178,12,2],[180,0,180,12,6],[182,0,182,12,1],[184,0,184,12,7]
      ].map(([b,s,eb,es,l])=>({start:at(b,s),end:at(eb,es),lane:l}));

      const accepted=[];
      for(const h of holds){
        const start=Math.round(h.start),end=Math.round(h.end),lane=h.lane,hs=side(lane);
        if(end<=start+300||accepted.some(x=>start<x.end+220&&end>x.start-220))continue;
        const kept=[],byTime=new Map();
        for(const n of work){
          if(n.timeMs<start-25||n.timeMs>end+25){kept.push(n);continue;}
          if(Math.abs(n.timeMs-start)<=25||Math.abs(n.timeMs-end)<=25){
            if(n.lane===lane)continue;
            const ns=side(n.lane);
            if(hs!==0&&ns===hs)continue;
            if(!byTime.has(n.timeMs))byTime.set(n.timeMs,n);
            continue;
          }
          if(n.timeMs>start&&n.timeMs<end){
            const ns=side(n.lane);
            if(hs<0&&ns<=0)continue;
            if(hs>0&&ns>=0)continue;
            if(hs===0&&ns===0)continue;
            if(!byTime.has(n.timeMs))byTime.set(n.timeMs,n);
          }
        }
        kept.push(...byTime.values(),{timeMs:start,lane,holdEndMs:end,holdVisualOnly:true});
        work=kept.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
        accepted.push({start,end});
      }

      // Chords: opposite sides, or center + one side only.
      const groups=new Map();
      for(const n of work){if(!groups.has(n.timeMs))groups.set(n.timeMs,[]);groups.get(n.timeMs).push(n);}
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

      // Two-thumb burst safety; structural hold starts win over nearby filler taps.
      const safe=[];
      for(const n of work){
        let recent=safe.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
        if(recent.length>=2&&n.holdVisualOnly){
          for(let i=safe.length-1;i>=0&&recent.length>=2;i--){
            const x=safe[i];
            if(n.timeMs-x.timeMs<0||n.timeMs-x.timeMs>=115||x.holdVisualOnly)continue;
            safe.splice(i,1);
            recent=safe.filter(y=>n.timeMs-y.timeMs>=0&&n.timeMs-y.timeMs<115);
          }
        }
        if(recent.length>=2)continue;
        safe.push(n);
      }

      const final=[];
      for(const n of safe){
        const active=safe.find(h=>h.holdVisualOnly&&h!==n&&n.timeMs>h.timeMs&&n.timeMs<h.holdEndMs);
        if(!active){final.push(n);continue;}
        const hs=side(active.lane),ns=side(n.lane);
        if(hs<0&&ns<=0)continue;if(hs>0&&ns>=0)continue;if(hs===0&&ns===0)continue;
        if(final.some(x=>x.timeMs===n.timeMs&&x!==active))continue;
        final.push(n);
      }
      return final.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    }


    // MASTER expansion from the EXPERT-like base. Straight 8th/16th timing only; no swing.
    (function expandMasterDensity(){
      const occupied=new Set(notes.map(n=>Math.round(n.timeMs)));
      const laneSeqs=[[1,3,5,7,4,2,6,4],[7,5,3,1,4,6,2,4],[0,2,4,6,8,5,3,1],[8,6,4,2,0,3,5,7],[2,4,7,5,3,1,6,4],[6,4,1,3,5,7,2,4]];
      const defs=[[0,9,[[4,12],[2,10]],0],[9,22,[[1,5,9,13],[2,6,10,14]],1],[22,31,[[1,3,5,7,9,11,13,15]],2],[31,39,[[1,2,3,5,6,7,9,10,11,13,14,15]],3],[39,59,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],4],[59,67,[[1,3,5,7,9,11,13,15]],5],[67,80,[[3,7,11,15]],0],[80,96,[[1,3,5,7,9,11,13,15]],1],[96,116,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],2],[116,132,[[3,7,11,15]],3],[132,154,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],4],[154,176,[[1,2,3,5,6,7,9,10,11,13,14,15]],5],[176,187,[[1,2,3,5,6,7,9,10,11,13,14,15]],0]];
      for(const d of defs){
        for(let bar=d[0];bar<d[1]&&notes.length<1570;bar++){
          const subs=d[2][(bar-d[0])%d[2].length],lanes=laneSeqs[(bar+d[3])%laneSeqs.length];
          for(let j=0;j<subs.length&&notes.length<1570;j++){
            const tm=Math.round(at(bar,subs[j]));
            if(occupied.has(tm))continue;
            add(tm,lanes[j%lanes.length]);occupied.add(tm);
          }
        }
      }
    })();
    const final=finalize(notes);
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 二本指上級',bpm:BPM,offsetMs:0,noteCount:final.length,holdCount:final.filter(n=>n.holdVisualOnly).length,chartRevision:'snow-0831-master1',notes:final};
  }

  async function prepare(){
    const next=makeChart();next.audioKey=AUDIO_KEY;
    if(typeof window.setActiveRhythmChart==='function')window.setActiveRhythmChart(next,`${TITLE}（${next.notes.length} notes）`,AUDIO_KEY);
    else{chart=next;validateChart(chart);chartName.textContent=`${TITLE}（${chart.notes.length} notes）`;offsetInput.value=String(getSavedTimingOffset());}
    document.body.classList.remove('hasunosora-live-active');
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    if(typeof window.preparePresetAudio==='function')await window.preparePresetAudio(AUDIO_KEY,TITLE);
    canStart();
  }

  function makeCard(){
    const card=document.createElement('div');card.className='song-library-card';card.dataset.song075=AUDIO_KEY;card.dataset.series='muse';
    const h=document.createElement('h3');h.textContent=TITLE;
    const a=document.createElement('p');a.textContent=ARTIST+' / ラブライブ！';
    const m=document.createElement('p');m.textContent=`MASTER 二本指上級 / BPM ${BPM}`;
    const b=document.createElement('span');b.className='song-library-badge';b.textContent="μ's";
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);
    card.append(h,a,m,b,btn);return card;
  }
  function install(){
    const grid=document.getElementById('songLibraryGrid');if(!grid)return;
    grid.querySelectorAll('[data-song075="snow-halation"]').forEach(el=>el.remove());
    grid.appendChild(makeCard());
  }
  const library=document.getElementById('songLibraryScreen');
  if(library){new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(install);}).observe(library,{attributes:true,attributeFilter:['hidden']});if(!library.hidden)install();}
  window.makeSnowHalationChartV0829=makeChart;
  window.prepareSnowHalationV0829=prepare;
})();
