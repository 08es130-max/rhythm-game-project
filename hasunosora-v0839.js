// Ver.0.8.39: Hasunosora page and high-difficulty Genyo Yako chart.
(function(){
  const VERSION='0.8.39';
  const TITLE='眩耀夜行';
  const ARTIST='スリーズブーケ';
  const AUDIO_KEY='genyo-yako';
  const BPM=161.499;
  const START=520;
  const END=244500;
  const TARGET=1500;

  function makeChart(){
    const beat=60000/BPM, q=beat/4, notes=[], seen=new Set(), counts=new Map();
    const add=(t,l)=>{
      t=Math.round(t);l=Math.max(0,Math.min(8,Math.round(l)));
      if(t<START||t>END)return;
      const key=t+':'+l,c=counts.get(t)||0;
      if(seen.has(key)||c>=2)return;
      seen.add(key);counts.set(t,c+1);notes.push({timeMs:t,lane:l});
    };
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,sub)=>START+(bar*16+sub)*q;
    const section=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar,s=>at(bar,s));};

    section(0,10,(bar,t)=>{
      const seq=bar%2?[7,5,4,3,1,4]:[1,3,4,5,7,4];
      [0,3,6,8,11,14].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%3===2)chord(t(15),2,6);
    });

    section(10,38,(bar,t)=>{
      const v=bar%4;
      const seq=[[1,2,4,3,5,7,6,4],[7,6,4,5,3,1,2,4],[2,4,6,5,3,4,7,1],[6,4,2,3,5,4,1,7]][v];
      [0,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),seq[i]));
      if(bar%4===3){add(t(13),4);chord(t(15),1,7);}
    });

    section(38,54,(bar,t)=>{
      const left=bar%2===0, anchor=left?1:7;
      const run=left?[2,3,4,5,6]:[6,5,4,3,2];
      chord(t(0),anchor,4);add(t(2),anchor);
      [4,6,8,10,12].forEach((s,i)=>add(t(s),run[i]));
      chord(t(14),anchor,left?6:2);add(t(15),4);
    });

    section(54,82,(bar,t)=>{
      const type=bar%7;
      const P=[
        ()=>{chord(t(0),0,8);[2,4,6,8,10,12].forEach((s,i)=>add(t(s),[2,4,6,5,3,4][i]));chord(t(14),1,7);},
        ()=>{[0,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),[7,5,3,4,6,2,4,1][i]));},
        ()=>{chord(t(0),2,6);add(t(1),4);add(t(3),5);add(t(5),7);add(t(7),4);add(t(9),1);add(t(11),3);chord(t(14),0,8);},
        ()=>{[0,1,3,5,7,9,11,13,15].forEach((s,i)=>add(t(s),[1,3,5,7,6,4,2,3,4][i]));},
        ()=>{chord(t(0),1,7);add(t(2),4);chord(t(4),2,6);add(t(6),3);add(t(8),5);chord(t(10),0,8);add(t(12),4);chord(t(14),3,5);},
        ()=>{[0,2,3,5,6,8,10,12,14].forEach((s,i)=>add(t(s),[8,6,4,2,0,3,5,7,4][i]));},
        ()=>{chord(t(0),3,5);[2,4,6,8,10,12].forEach((s,i)=>add(t(s),i%2?6:2));chord(t(14),1,7);}
      ];P[type]();
    });

    section(82,98,(bar,t)=>{
      const seq=bar%2?[8,6,4,2,0,3,5,7]:[0,2,4,6,8,5,3,1];
      [0,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),seq[i]));
      [5,11].forEach((s,i)=>add(t(s),bar%2?(i?2:6):(i?6:2)));
      if(bar%4===3)chord(t(15),0,8);
    });

    section(98,126,(bar,t)=>{
      const type=bar%6;
      const seqs=[[2,3,5,4,6,7,4,1],[6,5,3,4,2,1,4,7],[0,4,2,6,4,8,5,3],[8,4,6,2,4,0,3,5],[1,4,7,5,2,4,6,3],[7,4,1,3,6,4,2,5]];
      const subs=type%2?[0,1,4,6,8,11,13,15]:[0,2,4,5,8,10,12,14];
      subs.forEach((s,i)=>add(t(s),seqs[type][i]));
      if(type===2||type===5)chord(t(7),2,6);
    });

    section(126,142,(bar,t)=>{
      const flip=bar%2, a=flip?7:1;
      chord(t(0),a,4);add(t(1),a);
      [3,5,7,9,11,13].forEach((s,i)=>add(t(s),flip?[6,5,4,3,2,4][i]:[2,3,4,5,6,4][i]));
      chord(t(15),flip?0:1,flip?8:7);
    });

    section(142,170,(bar,t)=>{
      const type=bar%8;
      const actions=[
        ()=>{chord(t(0),0,8);add(t(1),4);[3,5,7,9,11,13].forEach((s,i)=>add(t(s),[2,6,3,5,1,7][i]));chord(t(15),2,6);},
        ()=>{[0,2,4,6,8,10,12,14,15].forEach((s,i)=>add(t(s),[1,4,7,5,2,6,3,8,4][i]));},
        ()=>{chord(t(0),1,7);chord(t(4),2,6);chord(t(8),3,5);add(t(10),4);add(t(11),2);add(t(12),4);add(t(13),6);chord(t(15),0,8);},
        ()=>{[0,1,2,4,6,8,10,12,14].forEach((s,i)=>add(t(s),[8,7,5,3,1,4,6,2,4][i]));},
        ()=>{chord(t(0),2,6);[2,3,5,6,8,9,11,12,14].forEach((s,i)=>add(t(s),i%2?[7,1,6,2,5][Math.floor(i/2)]:4));},
        ()=>{[0,2,4,5,7,9,10,12,14,15].forEach((s,i)=>add(t(s),[0,3,6,8,5,2,4,7,1,4][i]));},
        ()=>{chord(t(0),3,5);add(t(2),4);chord(t(3),1,7);add(t(5),4);chord(t(7),0,8);add(t(9),3);add(t(11),5);chord(t(13),2,6);add(t(15),4);},
        ()=>{[0,1,3,4,6,7,9,10,12,13,15].forEach((s,i)=>add(t(s),[1,3,5,7,6,4,2,0,3,6,4][i]));}
      ];actions[type]();
    });

    section(170,190,(bar,t)=>{
      const pair=bar%4===0?[2,5]:bar%4===1?[3,6]:bar%4===2?[1,4]:[4,7];
      for(let s=0;s<16;s+=2)add(t(s),pair[(s/2)%2]);
      [1,5,9,13].forEach((s,i)=>add(t(s),i%2?8:0));
      if(bar%5===4)chord(t(15),1,7);
    });

    section(190,202,(bar,t)=>{
      const seq=bar%2?[7,6,4,2,3,5]:[1,2,4,6,5,3];
      [0,3,6,9,12,15].forEach((s,i)=>add(t(s),seq[i]));
      if(bar>=198){add(t(13),4);chord(t(15),2,6);}
    });

    section(202,238,(bar,t)=>{
      const type=bar%6;
      const seqs=[[0,2,4,6,8,7,5,3,1,4,6,2],[8,6,4,2,0,1,3,5,7,4,2,6],[1,3,5,7,6,4,2,0,3,5,7,4],[7,5,3,1,2,4,6,8,5,3,1,4],[2,4,6,3,5,7,4,1,3,5,2,6],[6,4,2,5,3,1,4,7,5,3,6,2]][type];
      [0,1,3,4,6,7,8,10,11,12,14,15].forEach((s,i)=>add(t(s),seqs[i]));
      if(type===0||type===3)chord(t(2),1,7);
      if(type===2||type===5)chord(t(13),0,8);
    });

    section(238,244,(bar,t)=>{
      const seq=bar%2?[8,6,4,2,0,4]:[0,2,4,6,8,4];
      [0,2,5,8,11,14].forEach((s,i)=>add(t(s),seq[i]));
      if(bar===243)chord(t(15),0,8);else chord(t(15),2,6);
    });

    notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    if(notes.length>TARGET){
      const grouped=new Map();notes.forEach((n,i)=>{if(!grouped.has(n.timeMs))grouped.set(n.timeMs,[]);grouped.get(n.timeMs).push(i);});
      const removable=[];notes.forEach((n,i)=>{if(grouped.get(n.timeMs).length===1)removable.push(i);});
      const excess=Math.min(notes.length-TARGET,removable.length),remove=new Set();
      for(let k=0;k<excess;k++)remove.add(removable[Math.min(removable.length-1,Math.floor((k+.5)*removable.length/excess))]);
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
    try{const cached=await getPresetAudio(AUDIO_KEY);if(cached&&usePresetAudio(cached,TITLE)){canStart();return;}}catch(e){console.warn(e);}
    awaitingPresetAudioKey=AUDIO_KEY;songName.textContent=`${TITLE}（初回のみ音源ファイルを選択してください）`;audioFile.click();canStart();
  }

  function ensureHasuPage(){
    let page=document.getElementById('hasunosoraSongScreen');
    if(!page){
      page=document.createElement('section');page.id='hasunosoraSongScreen';page.className='app-screen hasunosora-song-screen';page.hidden=true;
      page.innerHTML=`<div class="hasu-page-stars" aria-hidden="true"></div><div class="screen-header hasu-page-header"><button id="hasuBackBtn" class="home-back-btn" type="button">楽曲選択</button><div><span class="hasu-kicker">HASUNOSORA</span><h1>蓮ノ空</h1></div><span class="hasu-page-mark">102期</span></div><div class="hasu-page-content"><div class="hasu-jacket" aria-hidden="true"><span class="hasu-ripple r1"></span><span class="hasu-ripple r2"></span><span class="hasu-ripple r3"></span><span class="hasu-moon"></span><strong>眩耀<br>夜行</strong><small>スリーズブーケ</small></div><div class="hasu-song-detail"><div class="hasu-series-label">蓮ノ空女学院スクールアイドルクラブ</div><h2>${TITLE}</h2><p>${ARTIST}</p><div class="hasu-stats"><span>MASTER</span><span>★11</span><span>BPM ${BPM}</span><span>1500 NOTES</span></div><p class="hasu-description">水面のきらめきと夜の疾走感を、細かな交互連打・左右の大移動・高密度サビで表現した上級譜面です。</p><button id="hasuLiveStartBtn" class="hasu-live-start" type="button">LIVE START</button></div></div>`;
      document.querySelector('.app-shell')?.appendChild(page);
      page.querySelector('#hasuBackBtn')?.addEventListener('click',()=>{page.hidden=true;const library=document.getElementById('songLibraryScreen');if(library)library.hidden=false;});
      page.querySelector('#hasuLiveStartBtn')?.addEventListener('click',prepare);
    }
    const tabs=document.getElementById('songCategoryTabs');
    if(tabs&&!document.getElementById('hasunosoraPageBtn')){
      const btn=document.createElement('button');btn.id='hasunosoraPageBtn';btn.type='button';btn.textContent='蓮ノ空';btn.className='hasunosora-page-tab';
      btn.addEventListener('click',()=>{document.querySelectorAll('.app-screen').forEach(el=>el.hidden=true);page.hidden=false;});
      const custom=tabs.querySelector('button[data-category="custom"]');
      if(custom) tabs.insertBefore(btn,custom); else tabs.appendChild(btn);
    }
    return page;
  }

  function makeCard(){
    const card=document.createElement('div');card.className='song-library-card hasunosora-song-card';card.dataset.song075='genyo-yako';card.dataset.series='hasunosora';
    const h=document.createElement('h3');h.textContent=TITLE;const a=document.createElement('p');a.textContent=ARTIST+' / 蓮ノ空女学院スクールアイドルクラブ';
    const m=document.createElement('p');m.textContent=`MASTER 二本指上級 / BPM ${BPM}`;const b=document.createElement('span');b.className='song-library-badge';b.textContent='蓮ノ空';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);card.append(h,a,m,b,btn);return card;
  }

  function install(){const grid=document.getElementById('songLibraryGrid');if(!grid)return;grid.querySelectorAll('[data-song075="genyo-yako"]').forEach(el=>el.remove());grid.appendChild(makeCard());ensureHasuPage();}
  const library=document.getElementById('songLibraryScreen');
  if(library){new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(install);}).observe(library,{attributes:true,attributeFilter:['hidden']});if(!library.hidden)install();}
  document.querySelectorAll('[data-home],#backBtn,#resultHomeBtn').forEach(el=>el.addEventListener('click',()=>document.body.classList.remove('hasunosora-live-active')));
  window.makeGenyoYakoChartV0839=makeChart;
})();