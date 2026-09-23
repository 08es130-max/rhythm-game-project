// Ver.0.8.41: Dazzling Game, audio-shaped two-thumb MASTER chart.
(function(){
  const TITLE='Dazzling Game';
  const ARTIST='Liella!、澁谷かのん、ウィーン・マルガレーテ、鬼塚冬毬';
  const AUDIO_KEY='dazzling-game';
  const BPM=184.57, START=2949, END=270500, TARGET=1500;
  function makeChart(){
    const beat=60000/BPM,q=beat/4,notes=[],seen=new Set(),count=new Map();
    const add=(t,l)=>{t=Math.round(t);l=Math.max(0,Math.min(8,Math.round(l)));if(t<START||t>END)return;
      const k=t+':'+l,c=count.get(t)||0;if(seen.has(k)||c>=2)return;seen.add(k);count.set(t,c+1);notes.push({timeMs:t,lane:l});};
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,s)=>START+(bar*16+s)*q;
    const run=(bar,subs,lanes)=>subs.forEach((s,i)=>add(at(bar,s),lanes[i%lanes.length]));
    const tri=(bar,s,a,b)=>{add(at(bar,s),a);add(at(bar,s+2),b);add(at(bar,s+4),a);};
    const sec=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar);};

    sec(0,20,bar=>{
      const p=bar%4;
      if(p===0){chord(at(bar,0),1,7);run(bar,[4,8,12],[3,5,4]);}
      else if(p===1){run(bar,[0,3,6,8,11,14],[7,5,3,4,6,2]);}
      else if(p===2){tri(bar,0,2,6);tri(bar,8,6,2);chord(at(bar,14),0,8);}
      else {run(bar,[0,2,4,7,10,12,14,15],[1,3,5,7,6,4,2,4]);}
    });
    sec(20,52,bar=>{
      const v=bar%8;
      const seqs=[[1,3,4,6,7,5,2],[7,5,4,2,1,3,6],[2,4,6,3,5,7,4],[6,4,2,5,3,1,4],[0,3,5,7,4,2,6],[8,5,3,1,4,6,2],[1,4,7,5,2,4,6],[7,4,1,3,6,4,2]];
      run(bar,v<4?[0,3,5,8,10,13,15]:[0,2,5,7,10,12,15],seqs[v]);
      if(v===2||v===6)tri(bar,6,v===2?1:7,4);
      if(v===3||v===7)chord(at(bar,14),2,6);
    });
    sec(52,68,bar=>{
      const flip=bar%2;
      run(bar,[0,2,4,6,8,10,12,14],[flip?7:1,flip?5:3,4,flip?3:5,flip?1:7,4,flip?6:2,flip?2:6]);
      if(bar%4===3){chord(at(bar,0),0,8);chord(at(bar,15),1,7);}
    });
    const chorus=[
      (b)=>{chord(at(b,0),0,8);run(b,[2,4,6,8,10,12,14],[2,4,6,5,3,1,4]);},
      (b)=>{tri(b,0,7,3);run(b,[6,8,10,12,14],[5,2,6,1,4]);},
      (b)=>{run(b,[0,1,3,5,7,9,11,13,15],[1,3,5,7,4,6,2,4,8]);},
      (b)=>{chord(at(b,0),2,6);run(b,[2,4,5,7,9,11,13,15],[4,1,5,8,3,7,2,4]);},
      (b)=>{tri(b,0,0,5);tri(b,6,8,3);run(b,[12,14,15],[1,7,4]);},
      (b)=>{run(b,[0,2,3,5,6,8,10,12,14],[8,6,4,1,3,5,7,2,4]);},
      (b)=>{chord(at(b,0),1,7);run(b,[1,3,5,7,9,11,13,15],[4,6,2,5,1,3,7,4]);},
      (b)=>{run(b,[0,1,2,4,6,8,10,12,14,15],[0,2,4,7,5,3,1,6,8,4]);}
    ];
    sec(68,100,b=>chorus[b%chorus.length](b));
    sec(100,116,b=>{
      run(b,[0,1,2,4,6,8,10,12,14,15],b%2?[8,7,5,3,1,2,4,6,7,4]:[0,1,3,5,7,6,4,2,1,4]);
      if(b%4===2)chord(at(b,7),2,6);
    });
    sec(116,144,b=>{
      const p=b%6,seq=[[2,5,7,4,1,6,3],[6,3,1,4,7,2,5],[0,4,7,5,2,6,3],[8,4,1,3,6,2,5],[1,5,3,7,4,0,6],[7,3,5,1,4,8,2]][p];
      run(b,p%2?[0,2,4,7,9,12,15]:[0,3,5,8,10,13,15],seq);
      if(p===1||p===4)tri(b,6,p===1?7:1,4);
    });
    sec(144,156,b=>{
      run(b,[0,2,4,6,8,9,11,13,15],b%2?[7,5,3,1,4,6,2,5,4]:[1,3,5,7,4,2,6,3,4]);
      if(b%3===2)chord(at(b,14),0,8);
    });
    sec(156,184,b=>chorus[(b+3)%chorus.length](b));
    sec(184,198,b=>{
      if(b<191) run(b,[0,1,2,3,5,7,9,11,13,15],b%2?[8,6,4,2,0,3,5,7,6,4]:[0,2,4,6,8,5,3,1,2,4]);
      else {chord(at(b,0),b%2?1:0,b%2?7:8);tri(b,4,b%2?7:1,4);run(b,[10,12,14,15],[2,6,3,5]);}
    });
    sec(198,212,b=>{
      chorus[(b*3+1)%chorus.length](b);
      if(b%4===0)chord(at(b,8),0,8);
      if(b%4===3)chord(at(b,15),1,7);
    });
    sec(212,214,b=>{
      run(b,[0,2,4,6,8,10,12,14],[b%2?8:0,6,4,2,b%2?0:8,3,5,4]);
      chord(at(b,15),0,8);
    });

    // Hold prototype. Keep the held lane empty for the full hold, and while one thumb is
    // fixed, keep intervening notes on one side only so the other thumb never has to cross it.
    const holdStart=Math.round(at(8,0)),holdEnd=Math.round(at(9,0)),holdLane=4;
    for(let i=notes.length-1;i>=0;i--){
      const n=notes[i];
      if(n.timeMs<holdStart||n.timeMs>holdEnd)continue;
      // Never place another note on the held lane.
      // During this center-lane prototype, reserve the left half for the free thumb.
      if(n.lane===holdLane||n.lane>holdLane){
        seen.delete(n.timeMs+':'+n.lane);
        count.set(n.timeMs,Math.max(0,(count.get(n.timeMs)||1)-1));
        notes.splice(i,1);
      }
    }
    notes.push({timeMs:holdStart,lane:holdLane,holdEndMs:holdEnd,holdVisualOnly:true});
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    if(notes.length>TARGET){
      const groups=new Map();notes.forEach((n,i)=>{if(!groups.has(n.timeMs))groups.set(n.timeMs,[]);groups.get(n.timeMs).push(i);});
      const removable=[];notes.forEach((n,i)=>{if(groups.get(n.timeMs).length===1)removable.push(i);});
      const excess=Math.min(notes.length-TARGET,removable.length),drop=new Set();
      for(let k=0;k<excess;k++)drop.add(removable[Math.min(removable.length-1,Math.floor((k+.5)*removable.length/excess))]);
      const out=notes.filter((n,i)=>n.holdVisualOnly||!drop.has(i));
      return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 二本指上級',bpm:BPM,offsetMs:0,noteCount:out.length,notes:out};
    }
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 二本指上級',bpm:BPM,offsetMs:0,noteCount:notes.length,notes};
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
})();