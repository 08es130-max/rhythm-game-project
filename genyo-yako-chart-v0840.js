// Ver.0.8.40: revised Genyo Yako chart with varied stairs, triangles and fewer repeated phrases.
(function(){
  const TITLE='眩耀夜行',ARTIST='スリーズブーケ',AUDIO_KEY='genyo-yako';
  const BPM=161.499,START=1800,END=244900,TARGET=1480;

  function makeChart(){
    const beat=60000/BPM,q=beat/4,notes=[],seen=new Set(),counts=new Map();
    const add=(time,lane)=>{
      const t=Math.round(time),l=Math.max(0,Math.min(8,Math.round(lane)));
      if(t<START||t>END)return;
      const key=`${t}:${l}`,count=counts.get(t)||0;
      if(seen.has(key)||count>=2)return;
      seen.add(key);counts.set(t,count+1);notes.push({timeMs:t,lane:l});
    };
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,sub)=>START+(bar*16+sub)*q;
    const bars=(from,to,fn)=>{for(let bar=from;bar<to;bar++)fn(bar,s=>at(bar,s));};
    const line=(t,subs,lanes)=>subs.forEach((s,i)=>add(t(s),lanes[i%lanes.length]));

    const intro=[
      [1,3,5,4,2,6],[7,5,3,4,6,2],[2,4,6,4,1,7],[6,4,2,4,7,1],
      [1,4,7,4,3,5],[7,4,1,4,5,3],[2,3,5,7,4,1],[6,5,3,1,4,7]
    ];
    bars(0,12,(bar,t)=>{
      line(t,[0,3,6,9,12,15],intro[bar%intro.length]);
      if(bar===5||bar===11)chord(t(14),2,6);
    });

    const verse=[
      [1,2,4,6,5,3,7,4],[7,6,4,2,3,5,1,4],[2,5,7,5,3,1,4,6],
      [6,3,1,3,5,7,4,2],[1,4,6,4,2,5,7,3],[7,4,2,4,6,3,1,5],
      [0,3,6,8,5,2,4,7],[8,5,2,0,3,6,4,1],[2,4,7,4,1,5,3,6],
      [6,4,1,4,7,3,5,2],[1,3,6,4,7,5,2,4],[7,5,2,4,1,3,6,4]
    ];
    bars(12,42,(bar,t)=>{
      const p=verse[(bar-12)%verse.length];
      const subs=(bar%3===0)?[0,1,4,6,8,10,13,15]:bar%3===1?[0,2,4,7,9,11,13,15]:[0,2,3,5,8,10,12,14];
      line(t,subs,p);
      if(bar%5===4)chord(t(7),bar%2?1:2,bar%2?7:6);
    });

    const build=[
      [1,4,7,4,2,3,4,5,6],[7,4,1,4,6,5,4,3,2],
      [2,3,4,5,6,4,1,7,4],[6,5,4,3,2,4,7,1,4],
      [1,5,1,3,4,6,8,4,2],[7,3,7,5,4,2,0,4,6]
    ];
    bars(42,54,(bar,t)=>{
      line(t,[0,2,4,6,8,10,12,14,15],build[(bar-42)%build.length]);
      if(bar%3===2)chord(t(0),1,7);
    });

    const chorus=[
      [0,8,4,1,6,3,7,2,5,4],[1,6,1,3,5,7,4,2,6,4],
      [7,2,7,5,3,1,4,6,2,4],[2,3,4,5,6,7,4,1,5,3],
      [6,5,4,3,2,1,4,7,3,5],[1,4,7,5,2,6,3,8,4,0],
      [7,4,1,3,6,2,5,0,4,8],[2,6,3,5,1,7,4,2,6,4],
      [6,2,5,3,7,1,4,6,2,4],[0,3,6,8,5,2,4,7,1,4],
      [8,5,2,0,3,6,4,1,7,4],[1,5,2,6,3,7,4,0,8,4]
    ];
    bars(54,78,(bar,t)=>{
      const p=chorus[(bar-54)%chorus.length];
      const subs=(bar%4===0)?[0,1,3,5,7,9,11,13,14,15]:bar%4===1?[0,2,3,5,6,8,10,12,14,15]:bar%4===2?[0,1,4,6,8,9,11,13,14,15]:[0,2,4,5,7,9,10,12,14,15];
      line(t,subs,p);
      if(bar%6===5)chord(t(0),0,8);
    });

    const interlude=[
      [0,2,4,6,8,5,2,4,7,3],[8,6,4,2,0,3,6,4,1,5],
      [1,4,7,4,2,5,8,5,3,6],[7,4,1,4,6,3,0,3,5,2],
      [2,3,4,5,6,7,6,5,4,3],[6,5,4,3,2,1,2,3,4,5],
      [1,6,1,4,7,2,7,4,3,5],[7,2,7,4,1,6,1,4,5,3]
    ];
    bars(78,96,(bar,t)=>{
      line(t,[0,1,3,4,6,8,10,12,14,15],interlude[(bar-78)%interlude.length]);
      if(bar%4===3)chord(t(7),2,6);
    });

    const verse2=[
      [2,4,6,5,3,1,4,7,5],[6,4,2,3,5,7,4,1,3],
      [1,3,5,7,4,2,6,4,8],[7,5,3,1,4,6,2,4,0],
      [0,4,2,6,4,8,3,5,1],[8,4,6,2,4,0,5,3,7],
      [1,5,1,4,6,3,7,4,2],[7,3,7,4,2,5,1,4,6],
      [2,5,7,4,1,3,6,4,0],[6,3,1,4,7,5,2,4,8]
    ];
    bars(96,124,(bar,t)=>{
      const p=verse2[(bar-96)%verse2.length];
      const subs=bar%2?[0,1,4,6,8,10,12,14,15]:[0,2,3,5,7,9,11,13,15];
      line(t,subs,p);
      if(bar%7===6)chord(t(7),1,7);
    });

    const bridge=[
      [1,4,7,4,2,6],[7,4,1,4,6,2],[2,4,6,5,3,4],
      [6,4,2,3,5,4],[1,5,3,7,4,2],[7,3,5,1,4,6]
    ];
    bars(124,136,(bar,t)=>{
      line(t,[0,3,6,9,12,15],bridge[(bar-124)%bridge.length]);
      if(bar>=132)add(t(14),bar%2?2:6);
    });

    const finalChorus=[
      [0,8,4,2,6,3,5,1,7,4,2,6],[1,4,7,5,2,6,3,8,4,0,3,5],
      [7,4,1,3,6,2,5,0,4,8,5,3],[2,6,3,5,1,7,4,2,6,4,0,8],
      [6,2,5,3,7,1,4,6,2,4,8,0],[0,3,6,8,5,2,4,7,1,4,6,2],
      [8,5,2,0,3,6,4,1,7,4,2,6],[1,5,2,6,3,7,4,0,8,4,6,2],
      [7,3,6,2,5,1,4,8,4,0,3,5],[2,4,6,4,1,7,3,5,0,8,4,2],
      [6,4,2,4,7,1,5,3,8,0,4,6],[1,6,1,3,5,7,4,2,6,4,0,8]
    ];
    bars(136,160,(bar,t)=>{
      const p=finalChorus[(bar-136)%finalChorus.length];
      line(t,[0,1,3,4,6,7,8,10,11,12,14,15],p);
      if(bar%4===0)chord(t(2),1,7);
      if(bar%4===2)chord(t(13),0,8);
    });

    bars(160,164,(bar,t)=>{
      const p=bar%2?[8,6,4,2,0,3,5,7,4]:[0,2,4,6,8,5,3,1,4];
      line(t,[0,2,4,6,8,10,12,14,15],p);
      if(bar===163)chord(t(15),0,8);
    });

    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    if(notes.length>TARGET){
      const grouped=new Map();notes.forEach((n,i)=>{if(!grouped.has(n.timeMs))grouped.set(n.timeMs,[]);grouped.get(n.timeMs).push(i);});
      const singles=[];notes.forEach((n,i)=>{if(grouped.get(n.timeMs).length===1)singles.push(i);});
      const excess=Math.min(notes.length-TARGET,singles.length),remove=new Set();
      for(let i=0;i<excess;i++)remove.add(singles[Math.min(singles.length-1,Math.floor((i+.5)*singles.length/excess))]);
      const trimmed=notes.filter((_,i)=>!remove.has(i));
      return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 蓮ノ空・二本指上級',bpm:BPM,offsetMs:0,noteCount:trimmed.length,notes:trimmed};
    }
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 蓮ノ空・二本指上級',bpm:BPM,offsetMs:0,noteCount:notes.length,notes};
  }

  async function prepare(){
    chart=makeChart();validateChart(chart);document.body.classList.add('hasunosora-live-active');
    chartName.textContent=`${TITLE}（${chart.notes.length} notes）`;offsetInput.value=String(getSavedTimingOffset());audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}window.scrollTo({top:0,behavior:'auto'});
    try{const cached=await getPresetAudio(AUDIO_KEY);if(cached&&usePresetAudio(cached,TITLE)){window.rhythmGameTrimChartToAudio?.();canStart();return;}}catch(e){console.warn(e);}
    awaitingPresetAudioKey=AUDIO_KEY;songName.textContent=`${TITLE}（初回のみ音源ファイルを選択してください）`;audioFile.click();canStart();
  }

  function patchButtons(){
    const pageBtn=document.getElementById('hasuLiveStartBtn');
    if(pageBtn&&pageBtn.dataset.genyo0840!=='1'){
      const btn=pageBtn.cloneNode(true);btn.dataset.genyo0840='1';pageBtn.replaceWith(btn);btn.addEventListener('click',prepare);
    }
    document.querySelectorAll('.song-library-card').forEach(card=>{
      if(card.querySelector('h3')?.textContent?.trim()!==TITLE)return;
      const old=card.querySelector('button');if(!old||old.dataset.genyo0840==='1')return;
      const btn=old.cloneNode(true);btn.dataset.genyo0840='1';old.replaceWith(btn);btn.addEventListener('click',prepare);
    });
  }

  new MutationObserver(()=>requestAnimationFrame(patchButtons)).observe(document.body,{childList:true,subtree:true});
  requestAnimationFrame(()=>requestAnimationFrame(patchButtons));
  window.makeGenyoYakoChartV0840=makeChart;
})();
