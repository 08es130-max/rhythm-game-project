// Ver.0.7.6: rebuild HAPPY PARTY TRAIN and Boooooom Boooooom Bee!! charts with varied section-based patterns.
(function(){
  const VERSION='0.7.6';
  const HPT_AUDIO_KEY='happy-party-train';
  const BOOM_AUDIO_KEY='boooooom-bee';

  function chartBuilder(title,artist,bpm,startMs,endMs){
    const beat=60000/bpm;
    const half=beat/2;
    const notes=[];
    const seen=new Set();
    function addAt(t,lane){
      lane=Math.max(0,Math.min(8,Math.round(lane)));
      const time=Math.round(t);
      const key=`${time}:${lane}`;
      if(seen.has(key)||time<startMs||time>endMs)return;
      seen.add(key);notes.push({timeMs:time,lane});
    }
    function chord(t,a,b){addAt(t,a);if(b!==a)addAt(t,b);}
    function step(bar,sub){return startMs+(bar*8+sub)*half;}
    function eightBarPattern(fromBar,toBar,fn){
      for(let bar=fromBar;bar<toBar;bar++)for(let s=0;s<8;s++)fn(bar,s,step(bar,s));
    }
    function finish(){
      notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
      return {title,artist,difficulty:'EXPERT 二本指向け',bpm,offsetMs:0,noteCount:notes.length,notes};
    }
    return {beat,half,addAt,chord,step,eightBarPattern,finish};
  }

  function makeHappyPartyTrainChart(){
    const B=chartBuilder('HAPPY PARTY TRAIN','Aqours',172.266,813,273850);
    const {addAt,chord,step,eightBarPattern}=B;

    // Intro: double-note movement and center accents, inspired by the reference SIF chart.
    eightBarPattern(0,8,(bar,s,t)=>{
      const pair=[[1,7],[2,6],[3,5],[2,6]][(bar+s)%4];
      if(s%2===0)chord(t,pair[0],pair[1]);
      else addAt(t,[4,3,4,5,4,2,4,6][s]);
    });

    // Intro B: center attacks + alternating 3-note fragments (525 / 8 / 464 style feel).
    eightBarPattern(8,16,(bar,s,t)=>{
      const p=[4,2,4,7,3,5,3,4];
      addAt(t,p[(s+bar)%p.length]);
      if(s===2||s===6)chord(t,1+(bar%2),7-(bar%2));
    });

    // A-melody: one-hand biased 4/5-step stairs, switching sides every 2 bars.
    eightBarPattern(16,32,(bar,s,t)=>{
      const left=[1,2,3,4,3,2,1,2], right=[7,6,5,4,5,6,7,6];
      const arr=((bar>>1)%2===0)?left:right;
      addAt(t,arr[s]);
      if(s===0||s===4)addAt(t,((bar>>1)%2===0)?7:1);
    });

    // A-melody end: denim-like chord / center-center alternation and short crossing stairs.
    eightBarPattern(32,40,(bar,s,t)=>{
      const seq=[2,4,6,4,3,4,5,4];
      if(s===0||s===4)chord(t,1+(bar%2),7-(bar%2));
      else addAt(t,seq[s]);
    });

    // B-melody: rhythm-difficulty feel with mirrored 5-note fragments.
    eightBarPattern(40,52,(bar,s,t)=>{
      const seq=(bar%2===0)?[7,5,6,4,5,3,4,2]:[1,3,2,4,3,5,4,6];
      if([1,4,6].includes(s))addAt(t,seq[s]);
      else if(s%2===0)chord(t,seq[s],8-seq[s]);
      else addAt(t,4);
    });

    // Pre-chorus: strong axis patterns. Left anchor -> right staircase, then mirrored.
    eightBarPattern(52,60,(bar,s,t)=>{
      if(bar<56){
        const other=[4,5,6,7,8,7,6,5][s];
        if(s<6)chord(t,0,other); else addAt(t,0);
      }else{
        const other=[4,3,2,1,0,1,2,3][s];
        if(s<6)chord(t,8,other); else addAt(t,8);
      }
    });

    // Chorus: same-single-same style, alternating anchors and wide movement.
    eightBarPattern(60,76,(bar,s,t)=>{
      const patterns=[
        [[1,6],4,[1,7],5,[2,7],4,[2,6],3],
        [[7,2],4,[7,1],3,[6,1],4,[6,2],5]
      ];
      const row=patterns[bar%2];
      const v=row[s];
      if(Array.isArray(v))chord(t,v[0],v[1]); else addAt(t,v);
    });

    // Instrumental: alternating triples, cross-screen runs, and small gaps for contrast.
    eightBarPattern(76,84,(bar,s,t)=>{
      const seq=[8,3,7,2,6,4,5,1];
      if(s===3||s===7){chord(t,2+(bar%2),6-(bar%2));}
      else if(!(bar%3===0&&s===5))addAt(t,seq[(s+bar)%seq.length]);
    });

    // Verse reprise: mirrored stairs with anchor swaps.
    eightBarPattern(84,92,(bar,s,t)=>{
      const seq=(bar%2===0)?[6,5,4,3,2,3,4,5]:[2,3,4,5,6,5,4,3];
      addAt(t,seq[s]);
      if(s===0||s===4)addAt(t,bar%2===0?0:8);
    });

    // Final chorus / outro: denser, but still max 2 simultaneous.
    eightBarPattern(92,98,(bar,s,t)=>{
      const seq=[3,5,2,6,1,7,4,4];
      if(s%2===0)chord(t,seq[s],8-seq[s]); else addAt(t,seq[s]);
    });
    for(let i=0;i<20;i++){
      const t=step(98,0)+i*(B.half/2);
      const seq=[8,3,7,2,6,4,5,3,4,5,2,6,1,7,3,5,4,2,4,6];
      addAt(t,seq[i]);
    }
    return B.finish();
  }

  function makeBoooooomBeeChart(){
    const B=chartBuilder('Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会',161.499,1370,224300);
    const {addAt,chord,step,eightBarPattern}=B;

    // Each block deliberately changes motion so the chart never falls into one repeated loop.
    eightBarPattern(0,8,(bar,s,t)=>{
      const seq=[4,2,6,1,7,3,5,4];
      if(s===0||s===4)chord(t,1+(bar%3),7-(bar%3)); else addAt(t,seq[(s+bar)%8]);
    });
    eightBarPattern(8,16,(bar,s,t)=>{
      const orbit=[0,2,4,6,8,6,4,2];
      addAt(t,orbit[(s+bar)%8]);
      if(s===3||s===7)addAt(t,8-orbit[(s+bar)%8]);
    });
    eightBarPattern(16,24,(bar,s,t)=>{
      const zig=(bar%2===0)?[1,3,5,7,6,4,2,4]:[7,5,3,1,2,4,6,4];
      if(s%3===0)chord(t,zig[s],8-zig[s]); else addAt(t,zig[s]);
    });
    eightBarPattern(24,32,(bar,s,t)=>{
      // syncopated bounce: intentionally leaves air on a few offbeats
      if([1,5].includes(s)&&bar%2===0)return;
      const seq=[4,5,4,6,4,3,4,2];
      addAt(t,seq[s]);
      if(s===2||s===6)chord(t,1,7);
    });
    eightBarPattern(32,40,(bar,s,t)=>{
      // short trills that migrate left -> center -> right
      const base=[1,2,3,4,5,6][bar%6];
      const other=Math.min(8,base+1);
      addAt(t,s%2===0?base:other);
      if(s===7)chord(t,Math.max(0,base-1),Math.min(8,other+1));
    });
    eightBarPattern(40,48,(bar,s,t)=>{
      const chords=[[0,8],[1,7],[2,6],[3,5]];
      if(s%2===0){const c=chords[(bar+s/2)%4];chord(t,c[0],c[1]);}
      else addAt(t,[4,3,5,2,6,4,4,4][s]);
    });
    eightBarPattern(48,56,(bar,s,t)=>{
      // diagonal runs with direction change mid-bar
      const a=[0,1,2,3,4,5,6,7],b=[8,7,6,5,4,3,2,1];
      addAt(t,(bar%2===0?a:b)[s]);
      if(s===3)chord(t,0,8);
    });
    eightBarPattern(56,64,(bar,s,t)=>{
      // chorus: big "boom" hits on downbeats + quick answers
      if(s===0||s===4)chord(t,bar%2?1:0,bar%2?7:8);
      else addAt(t,[4,2,5,3,4,6,3,5][(s+bar)%8]);
    });
    eightBarPattern(64,72,(bar,s,t)=>{
      // call-and-response: left phrase then mirrored right phrase
      const seq=bar%2===0?[1,2,4,3,1,4,2,3]:[7,6,4,5,7,4,6,5];
      addAt(t,seq[s]);
      if(s===6)chord(t,2,6);
    });
    eightBarPattern(72,80,(bar,s,t)=>{
      // pinball section
      const seq=[0,4,8,3,7,2,6,4];
      if(s===1||s===5)chord(t,1+(bar%2),7-(bar%2)); else addAt(t,seq[(s+bar)%8]);
    });

    // Last bars: mix prior motifs, then a compact finale instead of repeating one loop.
    eightBarPattern(80,88,(bar,s,t)=>{
      const seq=[3,4,5,2,6,1,7,4];
      if((bar+s)%4===0)chord(t,0+(bar%3),8-(bar%3)); else addAt(t,seq[s]);
    });
    for(let i=0;i<24;i++){
      const t=step(88,0)+i*(B.half/2);
      const seq=[0,2,4,6,8,5,3,1,4,7,5,3,1,2,4,6,8,6,4,2,3,5,4,4];
      if(i%6===0)chord(t,seq[i],8-seq[i]); else addAt(t,seq[i]);
    }
    return B.finish();
  }

  async function prepareBuiltInSong(chartFactory,audioKey,title){
    chart=chartFactory();
    validateChart(chart);
    chartName.textContent=`${title}（${chart.notes.length} notes）`;
    offsetInput.value=String(getSavedTimingOffset());
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    try{
      const cached=await getPresetAudio(audioKey);
      if(cached&&usePresetAudio(cached,title)){canStart();return;}
    }catch(e){console.warn(`${title}の保存済み音源を読み込めませんでした`,e);}
    awaitingPresetAudioKey=audioKey;
    songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
    audioFile.click();
    canStart();
  }

  function makeCard(id,title,artist,bpm,prepare){
    const card=document.createElement('div');card.className='song-library-card';card.dataset.song075=id;
    const h=document.createElement('h3');h.textContent=title;
    const a=document.createElement('p');a.textContent=artist;
    const m=document.createElement('p');m.textContent=`EXPERT 二本指向け / BPM ${bpm}`;
    const b=document.createElement('span');b.className='song-library-badge';b.textContent='内蔵楽曲';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);
    card.append(h,a,m,b,btn);return card;
  }

  function installCards(){
    const grid=document.getElementById('songLibraryGrid');if(!grid)return;
    grid.querySelectorAll('[data-song075]').forEach(el=>el.remove());
    grid.append(
      makeCard('hpt','HAPPY PARTY TRAIN','Aqours','172.266',()=>prepareBuiltInSong(makeHappyPartyTrainChart,HPT_AUDIO_KEY,'HAPPY PARTY TRAIN')),
      makeCard('boom','Boooooom Boooooom Bee!!','虹ヶ咲学園スクールアイドル同好会','161.499',()=>prepareBuiltInSong(makeBoooooomBeeChart,BOOM_AUDIO_KEY,'Boooooom Boooooom Bee!!'))
    );
  }

  const library=document.getElementById('songLibraryScreen');
  if(library){
    new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(installCards);}).observe(library,{attributes:true,attributeFilter:['hidden']});
    if(!library.hidden)installCards();
  }

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='HAPPY PARTY TRAINの譜面をスクフェス譜面の特徴を参考に再構成し、Boooooom Boooooom Bee!!も単調な反復をやめて全面的に作り直しました。シャン音も復旧しました。';
  }
  syncVersion();
})();
