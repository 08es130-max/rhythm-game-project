// Ver.0.8.224: Dazzling Game fully rebuilt from HPT/Spica chart language.
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
    const sec=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar,s=>at(bar,s));};

    // HPT-like intro/verse language: inner lanes, off-beats and phrase-ending doubles.
    sec(0,18,(bar,t)=>{
      const flip=bar&1;
      chord(t(0),flip?2:1,flip?6:7);
      [3,6,10,13].forEach((s,i)=>add(t(s),flip?[6,5,3,2][i]:[2,3,5,6][i]));
      if(bar%4===3)chord(t(15),3,5); else add(t(15),flip?6:2);
    });

    sec(18,58,(bar,t)=>{
      const seqs=[[1,2,3,2,5,6,5],[7,6,5,6,3,2,3],[2,3,1,3,6,5,7],[6,5,7,5,2,3,1]];
      const seq=seqs[bar%4];
      [0,3,5,8,10,13,15].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%8===6)chord(t(7),2,6);
    });

    // HPT axis-jack build with occasional Spica-like 16th pickups.
    sec(58,78,(bar,t)=>{
      const right=(bar%6)>=3,axis=right?6:2,inner=right?5:3,outer=right?7:1;
      [0,2,4].forEach((s,i)=>add(t(s),i===1?inner:axis));
      add(t(7),outer);add(t(9),axis);add(t(11),inner);
      if(bar%3===2){add(t(13),axis);chord(t(15),right?2:6,axis);} else add(t(15),inner);
    });

    // Chorus: wide-to-inner gestures, alternating hands, short dense answers.
    sec(78,116,(bar,t)=>{
      const type=bar%4;
      if(type===0){chord(t(0),1,7);[2,4,6,8,10,12].forEach((s,i)=>add(t(s),[3,5,3,2,3,5][i]));chord(t(15),2,6);}
      if(type===1){[0,2,4,6,8,10,12,15].forEach((s,i)=>add(t(s),[7,6,5,6,3,2,3,1][i]));}
      if(type===2){chord(t(0),2,6);[2,4,7,9,11,13].forEach((s,i)=>add(t(s),[5,3,5,6,5,3][i]));chord(t(15),1,7);}
      if(type===3){[0,1,3,5,7,9,11,13,15].forEach((s,i)=>add(t(s),[1,2,3,2,6,5,6,7,4][i]));}
    });

    // Mid-song: swing across the screen, with more breathing room before the second build.
    sec(116,146,(bar,t)=>{
      const seqs=[[0,2,3,6,7,5,2],[8,6,5,2,1,3,6],[1,3,5,7,6,3,2],[7,5,3,1,2,5,6]];
      [0,2,4,7,9,12,15].forEach((s,i)=>add(t(s),seqs[bar%4][i]));
      if(bar%5===4)chord(t(6),2,6);
    });

    sec(146,168,(bar,t)=>{
      const flip=bar&1,seq=flip?[6,7,5,6,3,2,3]:[2,1,3,2,5,6,5];
      [0,3,5,8,10,13,15].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%6===5)chord(t(7),1,7);
    });

    sec(168,184,(bar,t)=>{
      const right=bar&1,axis=right?6:2,answer=right?5:3,far=right?7:1;
      add(t(0),axis);add(t(2),answer);add(t(4),axis);
      chord(t(6),right?2:6,axis);
      add(t(9),far);add(t(11),axis);add(t(13),answer);add(t(15),axis);
    });

    // Final chorus: busiest section, but still only two-thumb-safe starts.
    sec(184,214,(bar,t)=>{
      const type=bar%6;
      if(type===0){chord(t(0),1,7);[2,4,6,8,10,12].forEach((s,i)=>add(t(s),[2,3,5,6,5,3][i]));chord(t(15),2,6);}
      if(type===1){[0,1,3,5,7,9,11,13,15].forEach((s,i)=>add(t(s),[7,6,5,6,5,3,2,3,1][i]));}
      if(type===2){chord(t(0),2,6);[2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),[3,5,3,6,5,7,4][i]));}
      if(type===3){[0,2,3,5,6,8,10,12,14,15].forEach((s,i)=>add(t(s),[1,3,5,7,6,4,2,3,5,4][i]));}
      if(type===4){chord(t(0),0,8);[2,4,6,8,10,12].forEach((s,i)=>add(t(s),[2,4,6,3,5,4][i]));chord(t(15),1,7);}
      if(type===5){[0,1,2,4,6,8,10,12,14,15].forEach((s,i)=>add(t(s),[7,5,3,1,2,4,6,8,5,4][i]));}
    });

    // Rolling burst safety, copied from the Spica philosophy.
    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    const safe=[];
    for(const n of notes){
      const recent=safe.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
      if(recent.length>=2)continue;
      safe.push(n);
    }

    const side=l=>l<4?-1:l>4?1:0;
    let heldUntil=-Infinity,holdCount=0;
    for(let i=0;i<safe.length&&holdCount<30;i++){
      const n=safe[i];
      if(n.lane===4||n.timeMs<heldUntil+220||i%13!==4)continue;
      const s=side(n.lane);
      let hazard=n.timeMs+q*8; // up to two beats
      const inside=safe.filter(x=>x.timeMs>n.timeMs&&x.timeMs<hazard);
      for(const x of inside){
        if(side(x.lane)===s){hazard=Math.min(hazard,x.timeMs-130);break;}
      }
      const free=inside.filter(x=>side(x.lane)!==s);
      for(let a=0;a<free.length;a++)for(let b=a+1;b<free.length;b++){
        if(free[b].timeMs-free[a].timeMs<115)hazard=Math.min(hazard,free[b].timeMs-130);
      }
      let steps=Math.min(8,Math.floor((hazard-n.timeMs)/q));
      if(steps<4)continue;
      n.holdEndMs=Math.round(n.timeMs+steps*q);n.holdVisualOnly=true;
      heldUntil=n.holdEndMs;holdCount++;
    }

    const final=[];
    for(const n of safe){
      const active=safe.find(h=>h.holdVisualOnly&&n!==h&&n.timeMs>h.timeMs&&n.timeMs<h.holdEndMs);
      if(!active){final.push(n);continue;}
      if(side(n.lane)===side(active.lane)||n.lane===active.lane)continue;
      if(final.some(x=>x.timeMs===n.timeMs&&x!==active))continue;
      final.push(n);
    }

    final.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 二本指上級',bpm:BPM,offsetMs:0,noteCount:final.length,holdCount,notes:final};
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