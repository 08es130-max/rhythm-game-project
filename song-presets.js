const PRESET_AUDIO_DB = 'rhythmGamePresetAudio';
const PRESET_AUDIO_STORE = 'audio';
const SPICA_AUDIO_KEY = 'spica-terrible';
let awaitingPresetAudioKey = null;
let presetAudioObjectUrl = null;

if (speed) {
  speed.max = '4.0';
  speed.step = '0.1';
}

function openPresetAudioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PRESET_AUDIO_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PRESET_AUDIO_STORE)) db.createObjectStore(PRESET_AUDIO_STORE, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePresetAudio(key, file) {
  const db = await openPresetAudioDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PRESET_AUDIO_STORE, 'readwrite');
    tx.objectStore(PRESET_AUDIO_STORE).put({ key, blob:file, name:file.name || '音源', type:file.type || '', size:file.size || 0, savedAt:Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

async function getPresetAudio(key) {
  const db = await openPresetAudioDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(PRESET_AUDIO_STORE, 'readonly');
    const req = tx.objectStore(PRESET_AUDIO_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return record;
}

const livePrepAudioGuide=document.getElementById('livePrepAudioGuide');
const changeSongAudioBtn=document.getElementById('changeSongAudioBtn');

function setLivePrepAudioState(state,title=''){
  if(!livePrepAudioGuide||!changeSongAudioBtn) return;
  if(state==='saved'){
    livePrepAudioGuide.textContent='音源は保存済みです。変更する場合のみ音源ファイルを選び直してください。';
    changeSongAudioBtn.textContent='音源を変更';
    return;
  }
  if(state==='selecting'){
    livePrepAudioGuide.textContent='この楽曲の音源ファイルを選択してください。';
    changeSongAudioBtn.textContent='音源ファイルを選択';
    return;
  }
  livePrepAudioGuide.textContent=title?'この楽曲の音源ファイルを選択してください。':'楽曲を選択してください。';
  changeSongAudioBtn.textContent='音源ファイルを選択';
}
window.setLivePrepAudioState=setLivePrepAudioState;

function usePresetAudio(record, title) {
  if (!record?.blob) return false;
  if (presetAudioObjectUrl) URL.revokeObjectURL(presetAudioObjectUrl);
  presetAudioObjectUrl = URL.createObjectURL(record.blob);
  if (audio.src && audio.src.startsWith('blob:')) { try { URL.revokeObjectURL(audio.src); } catch (_) {} }
  audio.src = presetAudioObjectUrl;
  if (record.key) audio.dataset.presetKey = String(record.key);
  try { audio.load(); } catch (_) {}
  audioMode.value = 'file';
  songName.textContent = `${title}（保存済み音源）`;
  setLivePrepAudioState('saved',title);
  try { localStorage.setItem('rhythmPresetAudioSaved:' + record.key, '1'); } catch (_) {}
  canStart();
  return true;
}

function clearPresetAudioSource() {
  try { audio.pause(); } catch (_) {}
  try {
    if (audio.src && audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
  } catch (_) {}
  presetAudioObjectUrl = null;
  try { audio.removeAttribute('src'); } catch (_) {}
  try { delete audio.dataset.presetKey; } catch (_) {}
  try { audio.load(); } catch (_) {}
  canStart();
}

async function preparePresetAudio(audioKey, title) {
  const key = String(audioKey || '');
  if (!key) return false;
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  let knownSaved = false;
  try { knownSaved = localStorage.getItem('rhythmPresetAudioSaved:' + key) === '1'; } catch (_) {}

  clearPresetAudioSource();
  awaitingPresetAudioKey = key;
  audioMode.value = 'file';

  if (isAndroid && !knownSaved) {
    songName.textContent = `${title}（音源ファイルを選択してください）`;
    setLivePrepAudioState('selecting',title);
    try { audioFile.value = ''; } catch (_) {}
    try { audioFile.click(); } catch (_) {}
    canStart();
    return false;
  }

  try {
    const cached = await getPresetAudio(key);
    if (cached && usePresetAudio(cached, title)) return true;
  } catch (e) {
    console.warn(`${title}の保存済み音源を読み込めませんでした`, e);
  }

  awaitingPresetAudioKey = key;
  songName.textContent = `${title}（音源ファイルを選択してください）`;
  setLivePrepAudioState('selecting',title);
  if (!isAndroid) {
    try { audioFile.value = ''; } catch (_) {}
    try { audioFile.click(); } catch (_) {}
  }
  canStart();
  return false;
}

window.preparePresetAudio = preparePresetAudio;
window.clearPresetAudioSource = clearPresetAudioSource;

changeSongAudioBtn?.addEventListener('click',()=>{
  const key=String(chart?.audioKey||audio?.dataset?.presetKey||'');
  if(!key){
    alert('先に楽曲を選択してください。');
    return;
  }
  awaitingPresetAudioKey=key;
  try{audioFile.value='';}catch(_){}
  songName.textContent=`${chart?.title||'選択中の楽曲'}（音源ファイルを選択してください）`;
  setLivePrepAudioState('selecting',chart?.title||'');
  try{audioFile.click();}catch(_){}
});

function nearestEventDistance(times, value) {
  let lo = 0, hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] < value) lo = mid + 1; else hi = mid;
  }
  let best = Infinity;
  if (lo < times.length) best = Math.min(best, Math.abs(times[lo] - value));
  if (lo > 0) best = Math.min(best, Math.abs(times[lo - 1] - value));
  return best;
}

function limitEventsToTwo(notes) {
  const grouped = new Map();
  for (const n of notes) {
    if (!grouped.has(n.timeMs)) grouped.set(n.timeMs, []);
    grouped.get(n.timeMs).push({timeMs:n.timeMs, lane:n.lane});
  }
  const out = [];
  for (const group of grouped.values()) {
    group.sort((a,b) => a.lane - b.lane);
    if (group.length <= 2) out.push(...group);
    else out.push(group[0], group[group.length - 1]);
  }
  return out.sort((a,b) => a.timeMs - b.timeMs || a.lane - b.lane);
}

function makeSpicaMasterReferenceChart(source) {
  if (!source?.notes?.length) return source;
  // Ver.0.8.187: transcribed from the supplied 59.829fps SIF MASTER full-combo video.
  // Tuple format: [hitTimeMs, lane, holdEndMs?]. 675 starts / 102 holds.
  const masterVideoChart=[[2252,3],[2336,5],[3238,8],[3405,7],[3589,6],[3706,5],[4074,5,5160],[5177,3],[5779,2],[5846,6],[5946,2],[6280,4],[6514,4],[6548,3],[6665,6,8654],[6698,0,8520],[6899,7],[6965,1],[7082,7],[7199,8],[7233,3],[7233,2],[7400,7],[7517,3],[7584,5],[7651,1],[7801,4],[8152,5],[8152,3],[8520,8,9606],[8787,2],[8888,6],[9055,4],[9239,7],[9239,1],[9606,0],[9824,4],[9957,5,10693],[9957,3,10693],[10124,1],[10225,7],[10342,1,12164],[10492,6],[10492,2],[10576,0],[11144,6],[11161,2,13166],[11395,5],[11395,3],[11629,8],[11629,0,13802],[11963,4],[12130,7,12866],[12247,5],[12264,3],[12632,5,13367],[12632,3,14637],[12866,1,13601],[13066,6],[13250,6],[13451,2],[13584,5],[13785,5],[13885,8,14988],[14153,0],[14336,1],[14504,2,15607],[14921,1],[14988,3],[15122,1],[15406,6],[15540,1,16442],[15807,3],[15991,2],[16409,6],[16793,0],[17078,8],[17195,7],[17295,2],[17395,6,18482],[17529,5],[17897,5],[17897,0],[18716,5],[18833,6],[19334,7],[19351,2],[19952,7],[20120,8,22125],[20320,6,20872],[20454,1],[20504,5],[20755,0],[20872,2,21774],[20922,5],[21407,1,23596],[21607,0],[21891,7],[21941,3],[22226,0],[22627,4],[22660,8],[22694,3],[22877,4],[23061,5],[23061,3],[23228,4],[23396,0],[23412,5,24515],[23596,6],[23763,2],[23780,7,24315],[23947,8],[23947,3],[23997,6],[24047,0,24783],[24315,1],[24515,3],[24549,2],[24649,6],[24666,1],[24900,6],[25050,2],[25084,8],[25084,1],[25251,2],[25401,0],[25518,8],[25919,6],[25919,0],[25970,4],[26103,6],[26237,2],[26321,6],[26504,5,27424],[26672,7],[26672,1,27206],[26872,0],[27089,2],[27323,0],[27424,3],[27591,1],[27691,7],[27959,0],[27975,1],[28109,6],[28159,2,29062],[28293,8],[28393,1],[28427,0],[28794,8],[28844,4],[29145,6],[29262,2],[29413,3,29948],[29496,5],[29580,7],[29613,1],[29780,8],[29948,6,31051],[30115,3],[30165,7],[30315,5,31953],[30332,3],[30482,7],[30616,1],[30666,7],[30850,8],[31051,2,33056],[31101,1],[31268,0],[31318,8],[31519,1],[31619,6],[31803,7],[32137,7],[32354,8],[32455,0],[32488,6],[32689,8],[32806,0],[33240,1],[33424,3],[33591,1],[33825,0],[33909,8],[33959,2],[34109,0],[34176,6],[34226,8],[34293,0],[34477,4],[34678,8],[34678,2,35396],[34845,6],[34878,0],[35213,4],[35396,7],[35396,1],[35530,5],[35530,3],[35881,5],[35881,3],[36065,3],[36149,7,36867],[36149,1],[36332,2],[36399,6],[36550,2],[36667,3],[36717,6],[36834,3],[37051,8],[37085,3],[37168,0],[37619,5,38890],[37787,6],[37887,8],[38255,8],[38271,0],[38656,6],[38656,2],[39241,6],[39441,7],[39608,8],[39776,7,41781],[39943,6],[40060,8],[40060,2],[40511,3,41781],[40645,2],[40795,0],[41163,8],[41163,0],[41581,5],[41614,1],[41681,0],[42149,2],[42216,6],[42333,2,42868],[42483,0],[42500,6,44339],[42684,7,43603],[42684,1,43603],[42868,8],[42985,5],[42985,3],[43352,5],[43352,3],[43720,8],[43720,0],[44088,8],[44088,0],[44188,5],[44339,2],[44522,7,45241],[44706,8],[44723,6],[45074,8],[45408,6],[45542,1],[45575,5],[45926,5,46829],[45960,0,47598],[46110,7,46662],[46110,6,47932],[46144,1,47230],[46361,8],[46495,3],[46712,2],[46929,3],[47197,7],[47598,8],[47765,7],[47765,1],[47932,2],[48133,3],[48233,7],[48333,1,49236],[48400,5],[48400,2,48952],[48467,4],[48551,3],[48952,6],[49202,7,51208],[49370,6],[49503,0],[49620,6],[49787,2],[49854,8],[49971,2,50707],[50072,5],[50088,3],[50439,5,50974],[50439,3,51359],[50673,6],[50857,1],[51074,1],[51208,8,51944],[51442,7],[51643,0],[51693,6],[51877,0],[52244,2],[52345,8,53615],[52478,1],[52612,7],[52746,1],[52880,5],[52880,3],[52930,6],[53247,5],[53414,6],[53782,7],[53916,6],[53949,1],[54116,2],[54133,6],[54317,7],[54317,1],[54534,8],[54534,0],[54668,5],[54701,1],[54852,8,55571],[54869,2],[55069,2],[55186,6],[55337,0],[55420,6],[55688,0],[55754,8],[55905,0,56456],[55972,8],[56156,3,57610],[56172,7],[56306,6],[56390,2],[56540,6],[56690,2],[56757,8],[56891,2],[57041,0],[57142,8],[57209,0],[57359,8,57894],[57426,0],[57610,5],[57777,6,58679],[57777,2],[57794,7],[57977,1],[57994,7],[58161,8,58880],[58178,0],[58312,5],[58312,1],[58479,7],[58512,3],[58679,0],[58763,5],[58880,2],[59214,5],[59214,3],[59432,6],[59448,8],[59465,2],[59565,6],[59615,7],[59615,0],[59783,5],[59849,1],[59983,7,60886],[60050,3],[60150,4],[60284,2],[60602,6],[60635,2],[60886,1],[61036,2],[61153,8],[61270,2],[61387,6],[61521,0],[61604,6,62323],[61721,3],[62089,5],[62089,3,62624],[62323,2],[62474,7],[62708,7],[62841,1],[62975,5],[63059,1],[63242,8],[63343,2],[63527,8],[63610,0],[63861,6],[63961,0,65231],[64095,7],[64195,1],[64312,7],[64496,5],[64496,3],[64864,3],[65064,2],[65415,2],[65415,1],[65499,7],[65599,2],[65750,6],[65800,2],[65917,5],[66017,3],[66167,5],[66234,3],[66251,2],[66418,6,67872],[66435,0],[66619,0],[66686,8],[66986,5],[67003,1],[67120,0],[67170,5],[67254,3,68173],[67521,7,69159],[67906,2,68441],[68173,8],[68307,6],[68524,6],[68708,5],[68708,0],[68875,1,71048],[68975,6],[69059,2],[69694,7],[70045,6],[70246,5],[70430,3],[70446,5],[70847,5],[70847,0],[71015,5],[71048,7,71783],[71215,5],[71265,2],[71382,3],[71399,5,71934],[71583,6,72669],[71750,3],[71951,8],[72001,3],[72335,8],[72435,3,73171],[72502,7],[72586,2],[72836,1],[72870,5,73973],[72970,0],[73037,8],[73271,4],[73371,6],[73371,2],[73706,6,74257],[73722,2],[73940,0],[74157,2],[74174,1],[74307,2],[74408,7],[74508,3],[74608,8],[74709,0],[74993,3],[75160,7],[75177,1],[75411,8,77600],[75411,3],[75594,2],[75678,7],[75762,1],[75828,6],[75962,0,77600],[76062,5],[76163,3,76698],[76179,6],[76313,5],[76397,1,76948],[76631,5],[76965,7],[77082,3],[77166,6],[77299,2],[77366,1],[77416,6],[77968,0],[78135,1],[78336,3,79255],[78486,2,79038],[78586,6],[78636,7],[78670,1],[78870,7],[78921,1],[79021,6],[79255,5],[79355,0],[79539,0],[79606,5],[79706,0],[79873,6],[79957,1],[79974,2],[80091,6,81745],[80258,2],[80341,7],[80458,2],[80508,8],[80609,3],[80809,8],[80993,3],[81077,8],[81177,3],[81344,7],[81444,2],[81561,7],[81695,1],[81829,1],[81829,0],[81929,5],[82063,0],[82130,5],[82330,3],[82347,5,83250],[82481,2,83400],[82497,6],[82698,7],[82715,1],[82848,8],[82882,0,83601],[83032,3],[83066,7],[83216,1,84135],[83433,8],[83567,6],[83935,0],[84035,5],[84152,2],[84236,6,85339],[84336,2],[84403,7],[84537,3,85623],[84570,8],[84704,0],[84804,5],[84904,4],[85005,2],[85356,2],[85623,8,86342],[85790,7],[85857,2],[85957,6],[86058,1],[86158,5],[86258,0],[86810,7],[86826,1],[87010,6],[87044,5,87779],[87044,0,89233],[87261,6],[87345,1],[87445,7],[87512,2],[87562,8],[87712,3],[87946,3],[88047,7],[88281,3],[88347,5],[88632,1],[88682,5,89969],[88882,2],[88966,6],[89083,2],[89233,8],[89618,8],[89768,7],[90136,7],[90136,6,91239],[90253,2,91172],[90320,7],[90520,1],[90537,7],[90671,3],[90754,5],[90905,3],[90972,5],[91339,8],[91440,0],[91707,7],[91908,3],[91974,5,92877],[92259,1],[92342,2],[92476,3],[92610,6,93144],[92626,2],[92777,1],[92877,0],[92961,1],[93011,2],[93261,2],[93378,1],[93412,8],[93445,3],[93596,7,95769],[93679,2],[93780,6],[93880,1],[94482,1],[94515,2],[94532,0],[94799,2],[95167,5],[95167,3],[95568,8],[95568,3],[95769,3],[95919,6],[95952,3],[96136,5],[96153,3],[96303,5],[96354,2,98175],[96487,5],[96521,1],[96688,5],[96688,0,97774],[96855,3,98292],[97992,1],[98643,3],[99797,5],[99797,3],[100599,7],[100933,5],[101201,6],[101535,8],[101836,7],[102688,7],[102805,1],[103106,1],[104142,2],[104176,6],[105112,6],[105129,2],[105145,8],[105647,0,106198],[105747,8],[105847,3],[106265,7],[106499,6],[106750,3,107301],[106800,5],[107285,5],[108839,0],[109173,1],[109441,2],[109742,5],[109809,3],[118600,7],[118717,1],[119118,1]];
  // The video detector deliberately keeps tap starts separate from hold bodies.
  // A hold is accepted only when it has a detected end AND it does not overlap another
  // accepted hold. LoveFes is a two-thumb chart: while one thumb is holding, every
  // additional start must stay on the free side.
  const raw=masterVideoChart.map(([timeMs,lane,holdEndMs])=>({
    timeMs,lane,
    ...(Number.isFinite(holdEndMs)&&holdEndMs>timeMs+260?{holdEndMs,holdVisualOnly:true}:{})
  })).sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  const firstPart=[];
  let activeHold=null;
  for(const src of raw){
    const n={...src};
    if(activeHold&&n.timeMs>=activeHold.holdEndMs) activeHold=null;

    // Never allow two independent hold bodies at once. In the supplied MASTER video,
    // close paired circles are often simultaneous taps; they must not be promoted to
    // overlapping holds merely because a bright connector was detected between frames.
    if(Number.isFinite(n.holdEndMs)){
      if(activeHold){
        delete n.holdEndMs; delete n.holdVisualOnly;
      }else{
        activeHold=n;
      }
    }

    if(activeHold&&n!==activeHold&&n.timeMs>activeHold.timeMs&&n.timeMs<activeHold.holdEndMs){
      const heldLeft=activeHold.lane<4;
      // A hold already occupies one thumb. During its body allow ONE tap at a time
      // on the free side only; simultaneous taps here would require three fingers.
      if(n.lane===activeHold.lane) continue;
      if(heldLeft ? n.lane<5 : n.lane>3) continue;
      const tapAlreadyInWindow=firstPart.some(x=>
        x!==activeHold&&x.timeMs>activeHold.timeMs&&x.timeMs<activeHold.holdEndMs&&
        Math.abs(x.timeMs-n.timeMs)<=55
      );
      if(tapAlreadyInWindow) continue;
    }

    // Hard safety outside holds: at most two simultaneous tap starts.
    const same=firstPart.filter(x=>Math.abs(x.timeMs-n.timeMs)<=18);
    if(same.length>=2) continue;
    if(same.some(x=>x.lane===n.lane)) continue;
    firstPart.push(n);
  }

  // Final physical-playability pass. If a hold start itself lands inside a previous
  // hold due to detector jitter, demote it to a tap rather than creating a 3-finger
  // requirement.
  let heldUntil=-Infinity;
  const holdSafetyGapMs=220;
  for(const n of firstPart){
    if(Number.isFinite(n.holdEndMs)){
      // Leave a short gap after a hold end before another hold may start.
      // The release judgment itself has a GOOD window, so back-to-back holds can
      // otherwise coexist physically even when their chart bodies do not overlap.
      if(n.timeMs<heldUntil+holdSafetyGapMs){
        delete n.holdEndMs; delete n.holdVisualOnly;
      }else heldUntil=n.holdEndMs;
    }
  }

  // Two-thumb simultaneous-note ergonomics:
  // normal pairs must be one from each side. A center note may pair with either side.
  // Never keep same-side pairs such as lanes 0+1 / 1+2 / 6+7 / 7+8.
  const simultaneousGroups=[];
  for(const n of firstPart){
    let g=simultaneousGroups.find(x=>Math.abs(x.timeMs-n.timeMs)<=18);
    if(!g){g={timeMs:n.timeMs,notes:[]};simultaneousGroups.push(g);}
    g.notes.push(n);
  }
  for(const g of simultaneousGroups){
    if(g.notes.length!==2)continue;
    const [a,b]=g.notes;
    const side=l=>l<4?-1:l>4?1:0;
    const sa=side(a.lane),sb=side(b.lane);
    if(sa!==0&&sa===sb){
      // Keep the note farther from center and move the partner to the opposite side.
      // This preserves the simultaneous rhythm while making the chord reachable by
      // left + right thumbs.
      const keep=Math.abs(a.lane-4)>=Math.abs(b.lane-4)?a:b;
      const move=keep===a?b:a;
      move.lane=keep.lane<4?Math.max(5,8-keep.lane):Math.min(3,8-keep.lane);
    }
  }

  // Full-song continuation.
  // Do not reuse the sparse tail of the video transcription. The useful dense MASTER
  // material is the opening through the first chorus (~72.8s); reuse that structure
  // for verse 2, then reuse the pre-chorus/chorus sections again for the finale.
  const denseVerseStart=2252;
  const denseVerseEnd=72826;
  const preChorusStart=39776;
  const chorusStart=45926;

  function shiftedSection(fromMs,toMs,targetStartMs){
    const shift=targetStartMs-fromMs;
    return firstPart
      .filter(n=>n.timeMs>=fromMs&&n.timeMs<=toMs)
      .map(n=>({
        ...n,
        timeMs:n.timeMs+shift,
        ...(Number.isFinite(n.holdEndMs)?{holdEndMs:n.holdEndMs+shift}:{})
      }));
  }

  // Verse 2 through its chorus: same proven MASTER flow as verse 1.
  const secondVerse=shiftedSection(denseVerseStart,denseVerseEnd,120395);

  // Final build-up and last chorus. These are deliberately based on the denser
  // pre-chorus/chorus material rather than the sparse detector tail.
  const finalBuild=shiftedSection(preChorusStart,chorusStart-1,191200);
  const finalChorus=shiftedSection(chorusStart,denseVerseEnd,197350);

  // Keep only a small amount of song-specific tail timing as accent anchors. Do not
  // stack the full old chart on top of MASTER material; that was the source of
  // impossible bursts in 0.8.202.
  const accents=source.notes
    .filter(n=>n.timeMs>=120000)
    .filter((n,i,arr)=>{
      const prev=arr[i-1];
      return !prev||n.timeMs-prev.timeMs>=300;
    })
    .map(n=>({...n}));

  const candidates=[...firstPart,...secondVerse,...finalBuild,...finalChorus,...accents]
    .sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  // Physical two-thumb density guard:
  // - max 2 starts in any 115ms rolling window
  // - no more than one ordinary tap within 115ms while a hold is active
  // - preserve hold starts/releases and MASTER-derived notes before sparse accents
  const full=[];
  for(const n of candidates){
    if(full.some(x=>Math.abs(x.timeMs-n.timeMs)<=40&&x.lane===n.lane))continue;

    const recent=full.filter(x=>n.timeMs-x.timeMs>=0&&n.timeMs-x.timeMs<115);
    if(recent.length>=2)continue;

    const active=full.find(x=>
      Number.isFinite(x.holdEndMs)&&
      n.timeMs>x.timeMs&&n.timeMs<x.holdEndMs
    );
    if(active){
      const recentTap=full.some(x=>
        !x.holdVisualOnly&&
        x!==active&&
        Math.abs(x.timeMs-n.timeMs)<115
      );
      if(recentTap)continue;
      const heldLeft=active.lane<4;
      const heldRight=active.lane>4;
      if(heldLeft&&n.lane<5)continue;
      if(heldRight&&n.lane>3)continue;
      if(n.lane===active.lane)continue;
    }

    full.push({...n});
  }

  // Fill genuine empty spaces only. Use a 16th-note candidate grid, but accept a
  // candidate only when it sits in a real gap and the 115ms / two-thumb capacity
  // remains satisfied. This raises overall density without creating burst clusters.
  const sixteenthMs=60000/165/4;
  const fillLanePattern=[0,2,4,6,8,7,5,3,1,3,5,7];
  for(let pass=0;pass<2&&full.length<1510;pass++){
    const phase=pass?sixteenthMs/2:0;
    for(let k=0,t=120395+phase;t<=240300&&full.length<1510;k++,t=120395+phase+k*sixteenthMs){
      const timeMs=Math.round(t);
      // Never squeeze a fill into an already busy local phrase.
      if(full.some(n=>Math.abs(n.timeMs-timeMs)<92))continue;
      const recent=full.filter(n=>Math.abs(n.timeMs-timeMs)<115);
      if(recent.length>=2)continue;

      const active=full.find(n=>
        Number.isFinite(n.holdEndMs)&&
        timeMs>n.timeMs&&timeMs<n.holdEndMs
      );
      if(active&&full.some(n=>!n.holdVisualOnly&&n!==active&&Math.abs(n.timeMs-timeMs)<125))continue;

      let lane=fillLanePattern[(k+pass*3)%fillLanePattern.length];
      if(active){
        const heldLeft=active.lane<4;
        const heldRight=active.lane>4;
        if(heldLeft&&lane<5)lane=5+(k%4);
        else if(heldRight&&lane>3)lane=k%4;
        else if(active.lane===4)lane=k%2?1:7;
        if(lane===active.lane)continue;
      }
      full.push({timeMs,lane});
    }
  }

  // Raise total count with safe two-note chords instead of faster streams.
  // A chord is added only when the surrounding 130ms is completely empty, so note
  // count increases without increasing per-thumb repetition speed.
  const chordPairs=[[0,8],[1,7],[2,6],[3,5]];
  const quarterMs=60000/165;
  for(let pass=0;pass<4&&full.length<1500;pass++){
    const phase=(quarterMs/4)*pass;
    for(let k=0,t=120395+phase;t<=239900&&full.length<1500;k++,t=120395+phase+k*quarterMs){
      const timeMs=Math.round(t);
      if(full.some(n=>Math.abs(n.timeMs-timeMs)<130))continue;
      const active=full.find(n=>
        Number.isFinite(n.holdEndMs)&&
        timeMs>n.timeMs&&timeMs<n.holdEndMs
      );
      if(active)continue;

      const [leftLane,rightLane]=chordPairs[(k+pass)%chordPairs.length];
      full.push({timeMs,lane:leftLane},{timeMs,lane:rightLane});
    }
  }

  // Final cadence: a short deliberate pattern, still within two-thumb capacity.
  const ending=[
    [240768,7],
    [241132,2],[241132,6],
    [241496,3],[241496,5],
    [241860,4],
    [242224,1],[242224,7],
    [242588,2],[242588,6],
    [242952,3],[242952,5],
    [243316,4],
    [243680,0],[243680,8],
    [243926,4]
  ];
  for(const [timeMs,lane] of ending){
    if(full.some(n=>Math.abs(n.timeMs-timeMs)<=40&&n.lane===lane))continue;
    const recent=full.filter(n=>Math.abs(n.timeMs-timeMs)<115);
    if(recent.length>=2)continue;
    full.push({timeMs,lane});
  }

  full.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  return {
    ...source,
    bpm:165,
    difficulty:'MASTER動画転記 / 全曲2本指密度制御 / 長押しあり',
    noteCount:full.length,
    judgmentCount:full.length+full.filter(n=>Number.isFinite(n.holdEndMs)).length,
    notes:full
  };
}
async function loadBuiltInChart(path, fallbackTitle, transform = null) {
  try {
    const response = await fetch(`${path}?v=${window.APP_VERSION}&t=${Date.now()}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let parsed = await response.json();
    if (transform) parsed = transform(parsed);
    validateChart(parsed);
    chart = parsed;
    chartName.textContent = `${parsed.title || fallbackTitle || path}（${parsed.notes.length} notes）`;
    offsetInput.value = String(getSavedTimingOffset());
    canStart();
    return parsed;
  } catch (e) {
    alert('内蔵譜面を読み込めませんでした: ' + e.message);
    return null;
  }
}

async function prepareSpicaSong() {
  const parsed = await loadBuiltInChart('charts/spica-terrible.json', 'スピカテリブル', makeSpicaMasterReferenceChart);
  if (!parsed) return;
  parsed.audioKey = SPICA_AUDIO_KEY;
  if (typeof window.setActiveRhythmChart === 'function') {
    window.setActiveRhythmChart(parsed, `スピカテリブル（${parsed.notes.length} notes）`, SPICA_AUDIO_KEY);
  }
  audioMode.value = 'file';
  await preparePresetAudio(SPICA_AUDIO_KEY, 'スピカテリブル');
  canStart();
}
window.prepareSpicaSong = prepareSpicaSong;

audioFile.addEventListener('change', async () => {
  const file = audioFile.files?.[0];
  if (!file || !awaitingPresetAudioKey) return;
  const key = awaitingPresetAudioKey;
  awaitingPresetAudioKey = null;
  audio.dataset.presetKey = String(key);
  canStart();
  try {
    await savePresetAudio(key, file);
    try { localStorage.setItem('rhythmPresetAudioSaved:' + key, '1'); } catch (_) {}
    setLivePrepAudioState('saved',chart?.title||'');
    songName.textContent = `${chart?.title||file.name||'選択中の楽曲'}（音源をこの端末に保存しました）`;
  } catch (e) {
    console.warn('音源を端末に保存できませんでした', e);
    if(livePrepAudioGuide) livePrepAudioGuide.textContent='この音源は今回のみ使用します。次回は再度音源ファイルを選択してください。';
    if(changeSongAudioBtn) changeSongAudioBtn.textContent='音源ファイルを選択';
    songName.textContent = `${chart?.title||file.name||'選択中の楽曲'}（今回はこのファイルで再生します）`;
  }
  canStart();
});
