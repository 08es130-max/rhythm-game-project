// Ver.0.8.231: swing-free MASTER density expansion and direct launch.
(function(){
  const TITLE='Dazzling Game';
  const ARTIST='Liella!、澁谷かのん、ウィーン・マルガレーテ、鬼塚冬毬';
  const AUDIO_KEY='dazzling-game';
  const BPM=188, START=2949, END=270500, TARGET=1500;
  function makeChart(){
    const beat=60000/BPM,q=beat/4,notes=[],seen=new Set(),count=new Map();
    const add=(t,l)=>{t=Math.round(t);l=Math.max(0,Math.min(8,Math.round(l)));if(t<START||t>END)return;
      const k=t+':'+l,c=count.get(t)||0;if(seen.has(k)||c>=2)return;seen.add(k);count.set(t,c+1);notes.push({timeMs:t,lane:l});};
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,s)=>START+(bar*16+s)*q;
    const sec=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar,s=>at(bar,s));};

    // Intro 0-14: dramatic, spacious opening.
    sec(0,14,(bar,t)=>{
      const k=bar%7;
      const S=[
        [[0,1],[0,7],[4,4],[10,2],[14,6]],
        [[0,7],[3,5],[7,3],[11,1],[15,4]],
        [[0,2],[4,6],[8,4],[12,1],[15,7]],
        [[0,8],[2,6],[6,4],[10,2],[14,0]],
        [[0,1],[4,3],[8,5],[12,7],[15,4]],
        [[0,2],[0,6],[5,4],[9,7],[13,1]],
        [[0,7],[3,4],[6,1],[10,5],[15,3]]
      ][k];
      const first=new Map();
      S.forEach(([s,l])=>{if(first.has(s))chord(t(s),first.get(s),l);else{first.set(s,l);add(t(s),l);}});
    });

    // Verse 1 14-48: fast vocal rhythm with different syncopation every bar.
    const vSubs=[[0,3,5,8,11,14],[0,2,6,9,12,15],[0,1,4,7,10,13,15],[0,4,6,8,11,15],[0,2,5,7,12,14],[0,1,3,8,10,13,15],[0,3,6,9,11,14],[0,2,4,7,9,12,15]];
    const vLane=[[1,3,5,7,4,2],[7,5,3,1,4,6],[2,4,6,5,3,1,7],[6,4,2,5,7,3],[0,3,5,4,2,6],[8,5,3,1,4,6,2],[1,4,7,5,2,6],[7,4,1,3,6,2,5]];
    sec(14,48,(bar,t)=>{const k=(bar-14)%8;vSubs[k].forEach((s,i)=>add(t(s),vLane[k][i]));if(k===3)chord(t(14),1,7);if(k===7)chord(t(13),2,6);});

    // Build 48-60: accelerating confrontation.
    sec(48,60,(bar,t)=>{
      const k=(bar-48)%6,flip=k>=3;
      if(k%3===0){[0,2,4,7,10,13,15].forEach((s,i)=>add(t(s),flip?[6,5,6,3,2,3,1][i]:[2,3,2,5,6,5,7][i]));}
      if(k%3===1){add(t(0),flip?7:1);add(t(3),4);chord(t(6),2,6);add(t(10),flip?3:5);add(t(14),4);}
      if(k%3===2){chord(t(0),1,7);[3,5,8,11,13].forEach((s,i)=>add(t(s),flip?[6,4,2,5,3][i]:[2,4,6,3,5][i]));}
    });

    // Chorus 1 60-88: wide hits + rapid answers, 8-bar phrase library.
    sec(60,88,(bar,t)=>{
      const k=(bar-60)%8;
      const P=[
        ()=>{chord(t(0),0,8);[2,4,6,9,12,14].forEach((s,i)=>add(t(s),[2,4,6,5,3,1][i]));},
        ()=>{[0,2,5,7,10,12,15].forEach((s,i)=>add(t(s),[7,5,3,4,6,2,4][i]));},
        ()=>{chord(t(0),1,7);add(t(1),4);add(t(4),6);add(t(6),2);add(t(9),5);add(t(13),3);},
        ()=>{[0,1,3,6,8,11,13,15].forEach((s,i)=>add(t(s),[0,2,4,7,5,3,1,4][i]));},
        ()=>{chord(t(0),2,6);[3,5,8,10,12,15].forEach((s,i)=>add(t(s),[4,1,5,8,3,7][i]));},
        ()=>{[0,2,4,6,9,11,14].forEach((s,i)=>add(t(s),[8,6,4,1,3,5,7][i]));},
        ()=>{chord(t(0),3,5);add(t(2),1);add(t(5),7);add(t(7),4);add(t(10),2);add(t(14),6);},
        ()=>{[0,1,2,5,7,10,12,15].forEach((s,i)=>add(t(s),[1,3,5,7,4,6,2,4][i]));}
      ];P[k]();
    });

    // 88-104 instrumental break: sparse strings / response.
    sec(88,104,(bar,t)=>{
      const k=(bar-88)%4;
      const subs=[[0,4,8,12],[0,3,7,11,15],[0,5,10,15],[0,2,6,10,14]][k];
      const lanes=[[1,4,7,3],[7,5,3,1,4],[0,4,8,4],[2,6,3,5,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
    });

    // Verse 2 104-138: new rhythmic grammar, less mirror-copying.
    sec(104,138,(bar,t)=>{
      const k=(bar-104)%6;
      const subs=[[0,2,5,9,12,15],[0,1,4,8,11,14],[0,3,6,10,13,15],[0,2,4,7,11,13],[0,1,5,8,10,14,15],[0,3,7,9,12,15]][k];
      const lanes=[[2,5,7,4,1,6],[6,3,1,4,7,2],[0,4,6,3,5,8],[8,5,2,4,7,1],[1,4,7,5,2,6,3],[7,3,5,1,4,2]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
      if(k===2)chord(t(14),2,6);
    });

    // Build 2 138-150.
    sec(138,150,(bar,t)=>{
      const flip=bar&1;
      [0,2,4,6,9,11,13,15].forEach((s,i)=>add(t(s),flip?[7,5,3,1,4,6,2,4][i]:[1,3,5,7,4,2,6,4][i]));
      if(bar%4===3)chord(t(8),0,8);
    });

    // Chorus 2 150-178: reuse musical role, not literal patterns.
    sec(150,178,(bar,t)=>{
      const k=(bar-150)%7;
      const seqs=[
        [0,2,4,6,8,10,12,14],[0,1,3,5,7,10,13,15],[0,3,5,8,11,13,15],[0,2,5,7,9,12,14],
        [0,1,4,6,9,11,14,15],[0,2,3,6,8,10,13,15],[0,3,6,9,12,15]
      ];
      const lanes=[
        [0,2,4,6,8,5,3,1],[1,3,5,7,6,4,2,4],[2,4,7,5,3,1,6],[8,6,4,2,0,3,5],
        [1,4,7,5,2,6,3,4],[7,5,3,1,4,6,2,4],[2,6,3,5,1,7]
      ];
      seqs[k].forEach((s,i)=>add(t(s),lanes[k][i]));if(k===0||k===4)chord(t(15),1,7);
    });

    // Bridge 178-190: hold-friendly breathing section.
    sec(178,190,(bar,t)=>{
      const k=(bar-178)%4;
      [[0,6,12],[0,4,10,15],[0,8,14],[0,3,9,15]][k].forEach((s,i)=>add(t(s),[[1,4,7],[7,4,2,6],[0,4,8],[2,5,3,7]][k][i]));
    });

    // Final chorus 190-208: high energy, 9 different bar shapes.
    sec(190,208,(bar,t)=>{
      const k=(bar-190)%9;
      const subs=[[0,1,3,5,7,9,11,13,15],[0,2,4,6,8,10,12,14],[0,3,5,7,10,12,15],[0,1,4,6,8,11,13,15],[0,2,5,7,9,12,14],[0,1,3,6,8,10,13,15],[0,2,4,7,9,11,14],[0,3,6,8,10,12,15],[0,1,4,7,10,13,15]][k];
      const lanes=[[0,2,4,7,5,3,1,6,4],[8,6,4,2,0,3,5,7],[1,4,7,5,2,6,3],[7,5,3,1,4,6,2,4],[2,5,8,6,3,1,4],[6,3,0,2,5,7,4,1],[1,3,6,8,5,2,4],[7,4,1,3,6,2,5],[0,3,5,8,6,2,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));if(k===0||k===3||k===6)chord(t(15),1,7);
    });

    sec(208,211,(bar,t)=>{[0,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),bar&1?[8,6,4,2,0,3,5,4][i]:[0,2,4,6,8,5,3,4][i]));if(bar===210)chord(t(15),0,8);});


    // MASTER expansion from the EXPERT-like base. Straight 8th/16th timing only; no swing.
    (function expandMasterDensity(){
      const occupied=new Set(notes.map(n=>Math.round(n.timeMs)));
      const laneSeqs=[[1,3,5,7,4,2,6,4],[7,5,3,1,4,6,2,4],[0,2,4,6,8,5,3,1],[8,6,4,2,0,3,5,7],[2,4,7,5,3,1,6,4],[6,4,1,3,5,7,2,4]];
      const defs=[[0,14,[[2,6,10,14]],0],[14,48,[[1,3,5,7,9,11,13,15],[2,6,10,14]],1],[48,60,[[1,2,3,5,6,7,9,10,11,13,14,15]],2],[60,88,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],3],[88,104,[[3,7,11,15]],4],[104,138,[[1,3,5,7,9,11,13,15],[2,6,10,14]],5],[138,150,[[1,2,3,5,6,7,9,10,11,13,14,15]],0],[150,178,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],2],[178,190,[[3,7,11,15]],4],[190,211,[[1,2,3,4,5,6,7,9,10,11,12,13,14,15]],1]];
      for(const d of defs){
        for(let bar=d[0];bar<d[1]&&notes.length<1800;bar++){
          const subs=d[2][(bar-d[0])%d[2].length],lanes=laneSeqs[(bar+d[3])%laneSeqs.length];
          for(let j=0;j<subs.length&&notes.length<1800;j++){
            const tm=Math.round(at(bar,subs[j]));
            if(occupied.has(tm))continue;
            add(tm,lanes[j%lanes.length]);occupied.add(tm);
          }
        }
      }
    })();
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

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

    const specs=[[6,0,6,6,1],[10,0,10,8,7],[14,0,14,10,2],[18,0,18,6,6],[22,0,22,12,1],[26,0,26,8,7],[30,0,30,6,2],[34,0,34,8,6],[38,0,38,10,1],[42,0,42,6,7],[46,0,46,12,2],[50,0,50,8,6],[54,0,54,6,1],[58,0,58,8,7],[62,0,62,10,2],[66,0,66,6,6],[70,0,70,12,1],[74,0,74,8,7],[78,0,78,6,2],[82,0,82,8,6],[86,0,86,10,1],[90,0,90,6,7],[94,0,94,12,2],[98,0,98,8,6],[102,0,102,6,1],[106,0,106,8,7],[110,0,110,10,2],[114,0,114,6,6],[118,0,118,12,1],[122,0,122,8,7],[126,0,126,6,2],[130,0,130,8,6],[134,0,134,10,1],[138,0,138,6,7],[142,0,142,12,2],[146,0,146,8,6],[150,0,150,6,1],[154,0,154,8,7],[158,0,158,10,2],[162,0,162,6,6],[166,0,166,12,1],[170,0,170,8,7],[174,0,174,6,2],[178,0,178,8,6],[182,0,182,10,1],[186,0,186,6,7],[190,0,190,12,2],[194,0,194,8,6],[198,0,198,6,1],[202,0,202,8,7],[206,0,206,10,2]].map(([b,s,eb,es,l])=>({start:at(b,s),end:at(eb,es),lane:l}));
    const fin=finalizeWithHolds(notes,specs);
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 二本指上級',bpm:BPM,offsetMs:0,noteCount:fin.notes.length,holdCount:fin.holdCount,notes:fin.notes};
  }
  async function prepare(){
    chart=makeChart();validateChart(chart);document.body.classList.remove('hasunosora-live-active');
    chartName.textContent=`${TITLE}（${chart.notes.length} notes）`;offsetInput.value=String(getSavedTimingOffset());audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}window.scrollTo({top:0,behavior:'auto'});
    try{const cached=await getPresetAudio(AUDIO_KEY);if(cached&&usePresetAudio(cached,TITLE)){canStart();return;}}catch(e){console.warn(e);}
    awaitingPresetAudioKey=AUDIO_KEY;songName.textContent=`${TITLE}（初回のみ音源ファイルを選択してください）`;audioFile.click();canStart();
  }
  function makeCard(){
    const card=document.createElement('div');card.className='song-library-card';card.dataset.song075=AUDIO_KEY;card.dataset.series='liella';
    const h=document.createElement('h3');h.textContent=TITLE;
    const a=document.createElement('p');a.textContent=ARTIST+' / ラブライブ！スーパースター!!';
    const m=document.createElement('p');m.textContent=`MASTER 二本指上級 / BPM ${BPM}`;
    const b=document.createElement('span');b.className='song-library-badge';b.textContent='Liella!';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);
    card.append(h,a,m,b,btn);return card;
  }
  function install(){const grid=document.getElementById('songLibraryGrid');if(!grid)return;grid.querySelectorAll(`[data-song075="${AUDIO_KEY}"]`).forEach(el=>el.remove());grid.appendChild(makeCard());}
  const library=document.getElementById('songLibraryScreen');
  if(library){new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(install);}).observe(library,{attributes:true,attributeFilter:['hidden']});if(!library.hidden)install();}
  window.makeDazzlingGameChartV0841=makeChart;
  window.prepareDazzlingGameV0841=prepare;
})();