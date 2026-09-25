// Ver.0.8.226: Snow halation full-song two-thumb chart.
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

    // Piano/bell intro: sparse, symmetrical sparkle.
    sec(0,8,(bar,t)=>{
      const k=bar%4;
      if(k===0){add(t(0),4);add(t(6),2);add(t(12),6);}
      if(k===1){add(t(0),1);add(t(4),3);add(t(10),5);add(t(14),7);}
      if(k===2){chord(t(0),1,7);add(t(6),4);add(t(12),2);}
      if(k===3){add(t(0),7);add(t(4),5);add(t(8),3);chord(t(14),0,8);}
    });

    // Verse 1: melody-led, light off-beats.
    const vSubs=[[0,4,7,11,14],[0,3,6,10,13,15],[0,2,5,9,12,15],[0,4,8,11,15],[0,1,5,8,12,14],[0,3,7,10,13,15]];
    const vLanes=[[1,3,5,6,2],[7,5,3,1,4,6],[2,4,6,5,3,1],[6,4,2,5,7],[1,3,5,7,4,2],[7,4,1,3,6,5]];
    sec(8,34,(bar,t)=>{
      const k=(bar-8)%6;vSubs[k].forEach((s,i)=>add(t(s),vLanes[k][i]));
      if(k===5)chord(t(14),1,7);
    });

    // Pre-chorus: rising emotion and alternating hands.
    sec(34,46,(bar,t)=>{
      const k=(bar-34)%4,flip=k>=2;
      if(k%2===0)[0,3,6,9,12,15].forEach((s,i)=>add(t(s),flip?[7,5,6,3,2,1][i]:[1,3,2,5,6,7][i]));
      else {add(t(0),flip?7:1);add(t(4),4);chord(t(8),2,6);add(t(12),flip?3:5);add(t(15),4);}
    });

    // Chorus 1: bright wide chords and flowing inner answers.
    sec(46,70,(bar,t)=>{
      const k=(bar-46)%8;
      const P=[
        ()=>{chord(t(0),0,8);[3,6,9,12,15].forEach((s,i)=>add(t(s),[2,4,6,5,3][i]));},
        ()=>{[0,2,5,8,11,14].forEach((s,i)=>add(t(s),[1,3,5,7,4,2][i]));},
        ()=>{chord(t(0),1,7);add(t(4),4);add(t(7),6);add(t(10),2);chord(t(14),2,6);},
        ()=>{[0,1,4,7,10,13,15].forEach((s,i)=>add(t(s),[7,5,3,1,4,6,2][i]));},
        ()=>{chord(t(0),2,6);[3,5,8,11,14].forEach((s,i)=>add(t(s),[4,1,5,7,3][i]));},
        ()=>{[0,2,4,8,10,12,15].forEach((s,i)=>add(t(s),[0,2,4,6,8,5,3][i]));},
        ()=>{chord(t(0),3,5);add(t(3),1);add(t(6),7);add(t(9),4);add(t(12),2);add(t(15),6);},
        ()=>{[0,3,6,9,12,15].forEach((s,i)=>add(t(s),[1,4,7,5,2,4][i]));}
      ];P[k]();
    });

    // Bridge / instrumental: let the arrangement breathe.
    sec(70,84,(bar,t)=>{
      const k=(bar-70)%4;
      [[0,6,12],[0,4,10,15],[0,8,14],[0,3,9,15]][k].forEach((s,i)=>add(t(s),[[0,4,8],[7,4,1,5],[1,4,7],[2,5,3,7]][k][i]));
    });

    // Verse 2: same melodic role, different lane/rhythm vocabulary.
    sec(84,110,(bar,t)=>{
      const k=(bar-84)%7;
      const subs=[[0,3,6,10,13,15],[0,2,5,8,12,14],[0,1,4,7,11,15],[0,4,6,9,13,15],[0,2,6,10,12,15],[0,1,5,9,13,15],[0,3,7,11,14]][k];
      const lanes=[[2,5,7,4,1,6],[6,3,1,4,7,2],[0,3,5,7,4,2],[8,5,2,4,6,1],[1,4,7,5,2,6],[7,4,1,3,6,2],[2,6,3,5,1]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
      if(k===6)chord(t(15),1,7);
    });

    // Pre-chorus 2: denser than the first.
    sec(110,122,(bar,t)=>{
      const flip=bar&1;
      [0,2,4,6,9,11,13,15].forEach((s,i)=>add(t(s),flip?[7,5,3,1,4,6,2,4][i]:[1,3,5,7,4,2,6,4][i]));
      if(bar%4===3)chord(t(8),0,8);
    });

    // Chorus 2.
    sec(122,146,(bar,t)=>{
      const k=(bar-122)%7;
      const subs=[[0,2,4,7,9,12,15],[0,1,3,6,8,11,14],[0,3,5,8,10,13,15],[0,2,5,7,10,12,15],[0,1,4,6,9,13,15],[0,2,4,8,10,14],[0,3,6,9,12,15]][k];
      const lanes=[[0,2,4,6,5,3,8],[1,3,5,7,4,2,6],[8,6,4,2,3,5,1],[2,4,7,5,3,1,6],[7,5,3,1,4,6,2],[0,3,6,8,5,2],[2,6,3,5,1,7]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));if(k===0||k===4)chord(t(15),1,7);
    });

    // Break before final chorus: sparse sustained feel.
    sec(146,158,(bar,t)=>{
      const k=(bar-146)%4;
      [[0,8],[0,4,12],[0,6,14],[0,3,10,15]][k].forEach((s,i)=>add(t(s),[[1,7],[7,4,1],[0,4,8],[2,5,3,7]][k][i]));
    });

    // Final chorus / Honoka solo lift: maximum energy but varied phrases.
    sec(158,184,(bar,t)=>{
      const k=(bar-158)%9;
      const subs=[[0,1,3,5,7,9,11,13,15],[0,2,4,6,8,10,12,14],[0,3,5,7,10,12,15],[0,1,4,6,8,11,13,15],[0,2,5,7,9,12,14],[0,1,3,6,8,10,13,15],[0,2,4,7,9,11,14],[0,3,6,8,10,12,15],[0,1,4,7,10,13,15]][k];
      const lanes=[[0,2,4,7,5,3,1,6,4],[8,6,4,2,0,3,5,7],[1,4,7,5,2,6,3],[7,5,3,1,4,6,2,4],[2,5,8,6,3,1,4],[6,3,0,2,5,7,4,1],[1,3,6,8,5,2,4],[7,4,1,3,6,2,5],[0,3,5,8,6,2,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
      if(k===0||k===3||k===6)chord(t(15),1,7);
    });

    // Coda.
    sec(184,187,(bar,t)=>{
      [0,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),bar&1?[8,6,4,2,0,3,5,4][i]:[0,2,4,6,8,5,3,4][i]));
      if(bar===186)chord(t(15),0,8);
    });

    function finalize(raw){
      let work=raw.map(n=>({...n})).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      const side=l=>l<4?-1:l>4?1:0;
      const holdBars=[10,14,18,22,26,30,34,38,42,47,52,57,62,67,72,77,82,87,92,97,102,107,112,117,122,127,132,137,142,147,151,155,159,163,167,171,175,179,183];
      const lens=[8,10,6,12,8,6];
      const lanes=[1,7,2,6];
      const accepted=[];
      for(let i=0;i<holdBars.length;i++){
        const start=Math.round(at(holdBars[i],0));
        const end=Math.round(at(holdBars[i],lens[i%lens.length]));
        const lane=lanes[i%lanes.length];
        if(end<=start+300||accepted.some(h=>start<h.end+220&&end>h.start-220))continue;
        const hs=side(lane),kept=[],byTime=new Map();
        for(const n of work){
          if(n.timeMs<start-25||n.timeMs>end+25){kept.push(n);continue;}
          if(Math.abs(n.timeMs-start)<=25||Math.abs(n.timeMs-end)<=25){
            if(n.lane===lane)continue;
            if(hs!==0&&side(n.lane)===hs)continue;
            if(!byTime.has(n.timeMs))byTime.set(n.timeMs,n);
            continue;
          }
          if(n.timeMs>start&&n.timeMs<end){
            const ns=side(n.lane);
            if(hs<0&&ns<=0)continue;
            if(hs>0&&ns>=0)continue;
            if(!byTime.has(n.timeMs))byTime.set(n.timeMs,n);
          }
        }
        kept.push(...byTime.values(),{timeMs:start,lane,holdEndMs:end,holdVisualOnly:true});
        work=kept.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
        accepted.push({start,end});
      }

      // Chord invariant: opposite sides, or center + one side.
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

      // Rolling two-thumb capacity, preserving hold starts.
      const safe=[];
      for(const n of work){
        let recent=safe.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
        if(recent.length>=2&&n.holdVisualOnly){
          for(let i=safe.length-1;i>=0&&recent.length>=2;i--){
            const x=safe[i];if(n.timeMs-x.timeMs<0||n.timeMs-x.timeMs>=115||x.holdVisualOnly)continue;
            safe.splice(i,1);recent=safe.filter(y=>n.timeMs-y.timeMs>=0&&n.timeMs-y.timeMs<115);
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
        if(hs<0&&ns<=0)continue;if(hs>0&&ns>=0)continue;
        if(final.some(x=>x.timeMs===n.timeMs&&x!==active))continue;
        final.push(n);
      }
      return final.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    }

    const final=finalize(notes);
    return {title:TITLE,artist:ARTIST,difficulty:'EXPERT / 二本指上級',bpm:BPM,offsetMs:0,noteCount:final.length,holdCount:final.filter(n=>n.holdVisualOnly).length,notes:final};
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
    const m=document.createElement('p');m.textContent=`EXPERT 二本指上級 / BPM ${BPM}`;
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
  window.makeSnowHalationChartV0826=makeChart;
})();
