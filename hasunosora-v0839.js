// Ver.0.8.225: Genyo Yako rebuilt around corrected 158 BPM, varied phrases, strict chord rules and chorus holds.
(function(){
  const VERSION='0.8.39';
  const TITLE='眩耀夜行';
  const ARTIST='スリーズブーケ';
  const AUDIO_KEY='genyo-yako';
  const BPM=158;
  const START=520;
  const END=244500;
  const TARGET=1500;
  const JACKET='assets/jackets/genyo-yako-v0857.webp?v=0.8.57-jacket1';

  function makeChart(){
    const beat=60000/BPM,q=beat/4,notes=[],seen=new Set(),count=new Map();
    const add=(t,l)=>{t=Math.round(t);l=Math.max(0,Math.min(8,Math.round(l)));if(t<START||t>END)return;
      const k=t+':'+l,c=count.get(t)||0;if(seen.has(k)||c>=2)return;seen.add(k);count.set(t,c+1);notes.push({timeMs:t,lane:l});};
    const chord=(t,a,b)=>{add(t,a);if(a!==b)add(t,b);};
    const at=(bar,s)=>START+(bar*16+s)*q;
    const sec=(a,b,fn)=>{for(let bar=a;bar<b;bar++)fn(bar,s=>at(bar,s));};

    // 0-10 intro: water-ripple feel, light and spacious.
    sec(0,10,(bar,t)=>{
      const k=bar%5;
      const subs=[[0,4,8,12],[0,3,7,11,15],[0,5,9,14],[0,2,6,10,14],[0,4,7,12,15]][k];
      const lanes=[[1,3,5,7],[7,5,3,1,4],[2,4,6,3],[6,4,2,5,7],[0,3,5,8,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
    });

    // 10-38 A melody: flowing, many asymmetrical phrases.
    sec(10,38,(bar,t)=>{
      const k=(bar-10)%7;
      const subs=[[0,3,6,8,11,14],[0,2,5,9,12,15],[0,1,4,7,10,13,15],[0,3,5,8,12,14],[0,2,6,9,11,15],[0,1,5,8,10,13,15],[0,4,7,10,14]][k];
      const lanes=[[1,2,4,6,5,3],[7,6,4,2,3,5],[2,3,5,7,6,4,1],[6,5,3,1,2,4],[0,3,6,4,2,7],[8,5,2,4,6,3,1],[1,4,7,5,2]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));if(k===6)chord(t(15),1,7);
    });

    // 38-50 B melody / build: axis notes plus little star-like turns.
    sec(38,50,(bar,t)=>{
      const flip=bar&1,axis=flip?6:2;
      if(bar%3===0){add(t(0),axis);add(t(2),flip?5:3);add(t(4),axis);add(t(7),4);add(t(10),flip?7:1);add(t(14),axis);}
      else if(bar%3===1){chord(t(0),1,7);add(t(3),flip?6:2);add(t(6),4);add(t(9),flip?3:5);add(t(13),axis);}
      else {[0,2,5,8,11,13,15].forEach((s,i)=>add(t(s),flip?[7,5,6,3,2,3,1][i]:[1,3,2,5,6,5,7][i]));}
    });

    // 50-74 chorus: brighter and denser, wide-to-inner phrases.
    sec(50,74,(bar,t)=>{
      const k=(bar-50)%8;
      const P=[
        ()=>{chord(t(0),0,8);[3,5,8,10,13].forEach((s,i)=>add(t(s),[2,4,6,5,3][i]));chord(t(15),1,7);},
        ()=>{[0,2,4,7,9,12,15].forEach((s,i)=>add(t(s),[7,5,3,4,6,2,4][i]));},
        ()=>{chord(t(0),2,6);add(t(2),4);add(t(5),1);add(t(8),7);add(t(11),3);add(t(14),5);},
        ()=>{[0,1,3,6,8,10,13,15].forEach((s,i)=>add(t(s),[1,3,5,7,6,4,2,4][i]));},
        ()=>{chord(t(0),1,7);[2,5,7,10,12,15].forEach((s,i)=>add(t(s),[4,6,2,5,3,4][i]));},
        ()=>{[0,3,5,8,11,13,15].forEach((s,i)=>add(t(s),[8,6,4,1,3,5,7][i]));},
        ()=>{chord(t(0),3,5);add(t(3),1);add(t(6),7);add(t(9),4);add(t(12),2);add(t(15),6);},
        ()=>{[0,2,4,6,9,11,14].forEach((s,i)=>add(t(s),[2,4,7,5,3,1,6][i]));}
      ];P[k]();
    });

    // 74-88 instrumental: ripple / falling-star shapes, lighter density.
    sec(74,88,(bar,t)=>{
      const k=(bar-74)%4;
      const subs=[[0,4,8,12],[0,3,7,11,15],[0,5,10,15],[0,2,6,10,14]][k];
      const lanes=[[0,2,6,8],[8,6,4,2,0],[1,4,7,4],[7,5,3,1,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));
    });

    // 88-116 verse 2: different syncopation from verse 1.
    sec(88,116,(bar,t)=>{
      const k=(bar-88)%6;
      const subs=[[0,2,5,8,12,15],[0,1,4,7,11,14],[0,3,6,9,13,15],[0,2,4,8,10,13,15],[0,1,5,9,12,14],[0,3,7,10,15]][k];
      const lanes=[[2,5,7,4,1,6],[6,3,1,4,7,2],[0,4,6,3,5,8],[8,5,2,4,7,1,3],[1,4,7,5,2,6],[7,3,5,1,4]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));if(k===5)chord(t(14),1,7);
    });

    // 116-128 second build.
    sec(116,128,(bar,t)=>{
      const flip=bar&1;
      [0,2,4,6,9,11,13,15].forEach((s,i)=>add(t(s),flip?[7,5,3,1,4,6,2,4][i]:[1,3,5,7,4,2,6,4][i]));
      if(bar%4===3)chord(t(8),0,8);
    });

    // 128-154 final chorus: more hold-friendly sustained phrases and dense answers.
    sec(128,154,(bar,t)=>{
      const k=(bar-128)%9;
      const subs=[[0,2,4,6,9,12,15],[0,1,3,5,8,11,14],[0,3,6,9,12,15],[0,2,5,7,10,13,15],[0,1,4,8,11,14],[0,2,4,7,9,12,15],[0,3,5,8,10,13,15],[0,1,4,6,9,12,14],[0,3,6,10,13,15]][k];
      const lanes=[[0,2,4,6,5,3,8],[1,3,5,7,4,2,6],[8,6,4,2,3,5],[2,4,7,5,3,1,6],[7,5,3,1,4,6],[0,3,6,8,5,2,4],[1,4,7,5,2,6,3],[7,4,1,3,6,2,5],[2,6,3,5,1,7]][k];
      subs.forEach((s,i)=>add(t(s),lanes[i]));if(k===0||k===4||k===8)chord(t(15),1,7);
    });

    sec(154,161,(bar,t)=>{
      const seq=bar&1?[8,6,4,2,0,4]:[0,2,4,6,8,4];
      [0,2,5,8,11,14].forEach((s,i)=>add(t(s),seq[i]));
      if(bar===160)chord(t(15),0,8);
    });

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
        const recent=safe.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
        if(recent.length>=2)continue;
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

    const specs=[
      [8,0,8,8,1],[14,0,14,10,7],[20,0,20,8,2],[26,0,26,12,6],
      [32,0,32,8,1],[40,0,40,10,7],[46,0,46,8,2],[52,0,52,12,6],
      [58,0,58,8,1],[64,0,64,12,7],[70,0,70,8,2],[78,0,78,10,6],
      [85,0,85,8,1],[92,0,92,12,7],[99,0,99,8,2],[106,0,106,10,6],
      [113,0,113,8,1],[120,0,120,12,7],[126,0,126,8,2],
      [130,0,130,12,6],[134,0,134,12,1],[138,0,138,12,7],[142,0,142,12,2],
      [146,0,146,12,6],[150,0,150,10,1],[155,0,155,8,7]
    ].map(([b,s,eb,es,l])=>({start:at(b,s),end:at(eb,es),lane:l}));
    const fin=finalizeWithHolds(notes,specs);
    return {title:TITLE,artist:ARTIST,difficulty:'MASTER / 蓮ノ空・二本指上級',bpm:BPM,offsetMs:0,noteCount:fin.notes.length,holdCount:fin.holdCount,notes:fin.notes};
  }

  function applyGenyoChart(){
    const next=makeChart();
    if(typeof window.setActiveRhythmChart==='function'){
      window.setActiveRhythmChart(next,`${TITLE}（${next.notes.length} notes）`,AUDIO_KEY);
    }else{
      next.audioKey=AUDIO_KEY;chart=next;validateChart(chart);
      chartName.textContent=`${TITLE}（${chart.notes.length} notes）`;
      offsetInput.value=String(getSavedTimingOffset());
      canStart();
    }
    return next;
  }

  function prepare(){
    applyGenyoChart();
    document.body.classList.add('hasunosora-live-active');
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    if(typeof window.preparePresetAudio==='function'){
      window.preparePresetAudio(AUDIO_KEY,TITLE).then(()=>canStart());
    }else{
      awaitingPresetAudioKey=AUDIO_KEY;
      songName.textContent=`${TITLE}（音源ファイルを選択してください）`;
      try{audioFile.click();}catch(_){}
      canStart();
    }
  }

  function ensureHasuPage(){
    let page=document.getElementById('hasunosoraSongScreen');
    if(!page){
      page=document.createElement('section');page.id='hasunosoraSongScreen';page.className='app-screen hasunosora-song-screen';page.hidden=true;
      page.innerHTML=`<div class="hasu-page-stars" aria-hidden="true"></div><div class="screen-header hasu-page-header"><button id="hasuBackBtn" class="home-back-btn" type="button">楽曲選択</button><div><span class="hasu-kicker">HASUNOSORA</span><h1>蓮ノ空</h1></div><span class="hasu-page-mark">102期</span></div><div class="hasu-page-content"><div class="hasu-jacket"><img class="hasu-jacket-img" src="${JACKET}" alt="眩耀夜行 ジャケット"></div><div class="hasu-song-detail"><div class="hasu-series-label">蓮ノ空女学院スクールアイドルクラブ</div><h2>${TITLE}</h2><p>${ARTIST}</p><div class="hasu-stats"><span>MASTER</span><span>★11</span><span>BPM ${BPM}</span><span>1500 NOTES</span></div><p class="hasu-description">水面のきらめきと夜の疾走感を、細かな交互連打・左右の大移動・高密度サビで表現した上級譜面です。</p><button id="hasuLiveStartBtn" class="hasu-live-start" type="button">LIVE START</button></div></div>`;
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
    const card=document.createElement('div');card.className='song-library-card hasunosora-song-card';card.dataset.song075='genyo-yako';card.dataset.series='hasunosora';card.dataset.jacket=JACKET;
    const h=document.createElement('h3');h.textContent=TITLE;const a=document.createElement('p');a.textContent=ARTIST+' / 蓮ノ空女学院スクールアイドルクラブ';
    const m=document.createElement('p');m.textContent=`MASTER 二本指上級 / BPM ${BPM}`;const b=document.createElement('span');b.className='song-library-badge';b.textContent='蓮ノ空';
    const btn=document.createElement('button');btn.type='button';btn.textContent='この曲をプレイ';btn.addEventListener('click',prepare);card.append(h,a,m,b,btn);return card;
  }

  function install(){
    const grid=document.getElementById('songLibraryGrid');if(!grid)return;
    if(!grid.querySelector('[data-song075="genyo-yako"]'))grid.appendChild(makeCard());
    ensureHasuPage();
  }
  const library=document.getElementById('songLibraryScreen');
  if(library){new MutationObserver(()=>{if(!library.hidden)requestAnimationFrame(install);}).observe(library,{attributes:true,attributeFilter:['hidden']});if(!library.hidden)install();}
  document.querySelectorAll('[data-home],#backBtn,#resultHomeBtn').forEach(el=>el.addEventListener('click',()=>document.body.classList.remove('hasunosora-live-active')));
  window.makeGenyoYakoChartV0839=makeChart;
})();