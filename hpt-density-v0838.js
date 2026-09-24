// Ver.0.8.38: keep the HPT full-song chart near the reference EXPERT note density.
(function(){
  const TARGET=1220;
  const AUDIO_KEY='happy-party-train';
  const SIF_FIRST_END_MS=102353;

  function makeChart(){
    const source=window.makeHappyPartyTrainChartV0838?.();
    if(!source?.notes?.length||source.notes.length<=TARGET)return source;

    const groups=new Map();
    source.notes.forEach((n,i)=>{
      if(!groups.has(n.timeMs))groups.set(n.timeMs,[]);
      groups.get(n.timeMs).push(i);
    });

    // Preserve every two-note chord. Remove only evenly distributed single notes,
    // which keeps the characteristic simultaneous hits and avoids creating odd half-chords.
    const removable=[];
    source.notes.forEach((n,i)=>{
      if(n.timeMs>SIF_FIRST_END_MS&&groups.get(n.timeMs)?.length===1)removable.push(i);
    });
    const excess=Math.min(source.notes.length-TARGET,removable.length);
    const remove=new Set();
    for(let k=0;k<excess;k++){
      const pos=Math.min(removable.length-1,Math.floor((k+0.5)*removable.length/excess));
      remove.add(removable[pos]);
    }

    // Rounding can theoretically select the same index twice; fill any shortfall deterministically.
    if(remove.size<excess){
      for(const idx of removable){
        if(remove.size>=excess)break;
        remove.add(idx);
      }
    }

    const notes=source.notes.filter((_,i)=>!remove.has(i));
    return {...source,difficulty:'EXPERT / SIF本家1番再現・二本指向け',noteCount:notes.length,notes};
  }

  async function prepare(){
    const title='HAPPY PARTY TRAIN';
    chart=makeChart();
    validateChart(chart);
    chartName.textContent=`${title}（${chart.notes.length} notes）`;
    offsetInput.value=String(getSavedTimingOffset());
    audioMode.value='file';
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!=='liveScreen';});
    try{resultPanel.hidden=true;}catch(_){}
    window.scrollTo({top:0,behavior:'auto'});
    try{
      const cached=await getPresetAudio(AUDIO_KEY);
      if(cached&&usePresetAudio(cached,title)){canStart();return;}
    }catch(e){console.warn(e);}
    awaitingPresetAudioKey=AUDIO_KEY;
    songName.textContent=`${title}（初回のみ音源ファイルを選択してください）`;
    audioFile.click();
    canStart();
  }

  function patch(){
    const grid=document.getElementById('songLibraryGrid');
    if(!grid)return;
    [...grid.querySelectorAll('.song-library-card')].forEach(card=>{
      if(card.querySelector('h3')?.textContent?.trim()!=='HAPPY PARTY TRAIN')return;
      const old=card.querySelector('button');
      if(!old||old.dataset.hptDensity0838==='1')return;
      const btn=old.cloneNode(true);
      btn.dataset.v077='1';
      btn.dataset.hpt0838='1';
      btn.dataset.hptDensity0838='1';
      old.replaceWith(btn);
      btn.addEventListener('click',prepare);
    });
  }

  const library=document.getElementById('songLibraryScreen');
  if(library)new MutationObserver(()=>requestAnimationFrame(patch)).observe(library,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  requestAnimationFrame(()=>requestAnimationFrame(patch));
  window.makeHappyPartyTrainChartV0838Final=makeChart;
})();
