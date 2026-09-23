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

  // Spica Terrible MASTER-inspired full chart.
  // The original MASTER is 675 combo / 2:03 at BPM165. LoveFes uses the full song,
  // so reproduce its density and pattern vocabulary rather than a fixed total count.
  const src=limitEventsToTwo(source.notes).map(n=>({...n}));
  const first=src[0]?.timeMs||0, last=src[src.length-1]?.timeMs||first;
  const beat=60000/165, eighth=beat/2, sixteenth=beat/4;
  const notes=[];
  const occupied=new Map();
  const add=(timeMs,lane,extra={})=>{
    const t=Math.round(timeMs);
    if(t<first||t>last||lane<0||lane>8)return false;
    let lanes=occupied.get(t);
    if(!lanes){lanes=new Set();occupied.set(t,lanes);}
    if(lanes.size>=2||lanes.has(lane))return false;
    lanes.add(lane);notes.push({timeMs:t,lane,...extra});return true;
  };

  // Keep the existing musical anchors first.
  src.forEach(n=>add(n.timeMs,n.lane));

  // Pattern vocabulary taken from the documented MASTER character:
  // stairs, alternating 3-note bursts, double-note stairs, one-hand anchors,
  // spiral direction changes and denser chorus alternation. Each phrase is short;
  // there is deliberately no endless lane sweep.
  const phraseStart=Math.max(first,10000);
  const phraseEnd=Math.min(last,123000);
  const templates=[
    [1,2,3,5,6,7],                 // separated alternating stair
    [7,6,5,3,2,1],                 // reverse
    [2,4,6,3,5,7],                 // center-crossing alternation
    [1,3,2,6,5,7],                 // 3-note trill groups
    [0,2,4,6,8,6,4,2],             // spiral/wiper-like turn
    [8,6,4,2,0,2,4,6],
    [2,3,4,6,5,4],                 // inward/outward stair
    [6,5,4,2,3,4]
  ];
  let phraseIndex=0;
  for(let base=phraseStart;base<phraseEnd-2000;base+=beat*4){
    const tpl=templates[phraseIndex%templates.length];
    const dense=(phraseIndex%4===2||phraseIndex%4===3);
    const step=dense?sixteenth:eighth;
    for(let j=0;j<tpl.length;j++){
      const t=base+j*step;
      if(nearestEventDistance([...occupied.keys()].sort((a,b)=>a-b),t)<70)continue;
      add(t,tpl[j]);
    }
    // Characteristic short double-note staircase / axis pattern, used only at phrase endings.
    if(phraseIndex%3===1){
      const t0=base+beat*2.75;
      [[1,7],[2,7],[3,7]].forEach((pair,k)=>{
        const t=t0+k*eighth;
        if(nearestEventDistance([...occupied.keys()].sort((a,b)=>a-b),t)>=70){
          add(t,pair[0]);add(t,pair[1]);
        }
      });
    }
    phraseIndex++;
  }

  // Verse 2 may reuse verse 1: copy the finished MASTER-style first-section events
  // into the later full-song section at the song's existing structural boundary.
  notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
  const masterPhrase=notes.filter(n=>n.timeMs>=phraseStart&&n.timeMs<phraseEnd).map(n=>({...n}));
  const secondStart=125225;
  const sourceStart=phraseStart;
  for(const n of masterPhrase){
    const t=secondStart+(n.timeMs-sourceStart);
    if(t>=last-1200)break;
    if(nearestEventDistance([...occupied.keys()].sort((a,b)=>a-b),t)<70)continue;
    add(t,n.lane);
  }

  notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  // Short holds are mixed into alternating passages, as in the MASTER chart.
  // Avoid center holds and enforce the established LoveFes two-thumb ergonomics.
  const holdFractions=[.12,.17,.235,.31,.39,.455,.54,.595,.66,.735,.81,.875,.93];
  for(let h=0;h<holdFractions.length;h++){
    const target=first+(last-first)*holdFractions[h];
    let best=null,bestDist=Infinity;
    for(const n of notes){
      if(n.holdEndMs||n.lane===4)continue;
      const d=Math.abs(n.timeMs-target);
      if(d<bestDist){best=n;bestDist=d;}
    }
    if(!best)continue;
    const len=[Math.round(beat),Math.round(beat*1.5),Math.round(beat*2)][h%3];
    best.holdEndMs=Math.min(last-300,best.timeMs+len);
    best.holdVisualOnly=true;
  }

  // While one thumb is held, leave the opposite side for the free thumb.
  for(const hold of notes.filter(n=>Number.isFinite(n.holdEndMs))){
    const heldLeft=hold.lane<4;
    for(let i=notes.length-1;i>=0;i--){
      const n=notes[i];
      if(n===hold||n.timeMs<=hold.timeMs||n.timeMs>=hold.holdEndMs)continue;
      if(n.lane===hold.lane||(heldLeft?n.lane<5:n.lane>3))notes.splice(i,1);
    }
  }

  notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
  return {
    ...source,
    bpm:165,
    difficulty:'MASTER参考 / フル版 / 長押しあり',
    noteCount:notes.length,
    judgmentCount:notes.length+notes.filter(n=>Number.isFinite(n.holdEndMs)).length,
    notes
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
