// Ver.0.8.40: keep every chart inside the music and leave a short opening breath.
(function(){
  const OPENING_REST_MS=1800;
  const END_MARGIN_MS=900;
  const originalValidate=window.validateChart||validateChart;

  function normalize(data,maxTimeMs=Infinity){
    if(!data||!Array.isArray(data.notes))return data;
    const ceiling=Number.isFinite(maxTimeMs)?Math.max(OPENING_REST_MS,maxTimeMs):Infinity;
    data.notes=data.notes
      .filter(n=>Number.isFinite(n.timeMs)&&n.timeMs>=OPENING_REST_MS&&n.timeMs<=ceiling)
      .sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
    data.noteCount=data.notes.length;
    return data;
  }

  window.validateChart=function(data){
    originalValidate(data);
    normalize(data);
  };

  function trimCurrentChartToAudio(){
    if(typeof chart==='undefined'||!chart||!Array.isArray(chart.notes))return;
    if(!audio||!Number.isFinite(audio.duration)||audio.duration<=0)return;
    normalize(chart,audio.duration*1000-END_MARGIN_MS);
    if(chartName)chartName.textContent=`${chart.title||'譜面'}（${chart.notes.length} notes）`;
  }

  audio?.addEventListener('loadedmetadata',trimCurrentChartToAudio);
  audio?.addEventListener('durationchange',trimCurrentChartToAudio);
  startBtn?.addEventListener('click',trimCurrentChartToAudio,{capture:true});
  retryBtn?.addEventListener('click',trimCurrentChartToAudio,{capture:true});

  window.rhythmGameNormalizeChart=normalize;
  window.rhythmGameTrimChartToAudio=trimCurrentChartToAudio;
})();
