const PRESET_AUDIO_DB = 'rhythmGamePresetAudio';
const PRESET_AUDIO_STORE = 'audio';
const SPICA_AUDIO_KEY = 'spica-terrible';
const SPICA_TARGET_JUDGMENT_COUNT = 675;
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

  // Rebuild Spica Terrible around the SIF MASTER reference:
  // stairs / alternating bursts / one-hand restraint with holds / denser chorus.
  // A hold is one chart object but two combo judgments (start + release).
  const base = limitEventsToTwo(source.notes);
  const notes = base.map(n=>({...n}));
  const first = notes[0]?.timeMs || 0;
  const last = notes[notes.length-1]?.timeMs || first;
  const duration = Math.max(1,last-first);

  // Convert selected musical accents into holds. Keep them short enough for two-thumb play,
  // and reserve only one side for ordinary notes while a thumb is fixed.
  const holdFractions=[.16,.205,.255,.39,.445,.505,.615,.675,.735,.82,.875,.925];
  const usedHoldStarts=new Set();
  for(let h=0;h<holdFractions.length;h++){
    const target=first+duration*holdFractions[h];
    let bestIndex=-1,bestDist=Infinity;
    for(let i=0;i<notes.length;i++){
      const n=notes[i];
      if(n.holdEndMs||usedHoldStarts.has(n.timeMs))continue;
      const d=Math.abs(n.timeMs-target);
      if(d<bestDist){bestDist=d;bestIndex=i;}
    }
    if(bestIndex<0)continue;
    const hold=notes[bestIndex];
    const holdLen=h%3===0?1115:h%3===1?743:929;
    hold.holdEndMs=Math.min(last-200,hold.timeMs+holdLen);
    hold.holdVisualOnly=true;
    usedHoldStarts.add(hold.timeMs);

    const holdOnLeft=hold.lane<=4;
    for(let i=notes.length-1;i>=0;i--){
      const n=notes[i];
      if(n===hold||n.timeMs<=hold.timeMs||n.timeMs>=hold.holdEndMs)continue;
      // Never put a normal note on the held lane. While holding, keep free-hand notes
      // on the opposite side so the player is never asked to cross fingers.
      const wrongSide=n.lane===hold.lane||(holdOnLeft?n.lane<5:n.lane>3);
      if(wrongSide)notes.splice(i,1);
    }
  }

  // MASTER reference has 675 combo. Since every hold contributes two judgments,
  // fill ordinary notes only until the total judgment count approaches 675.
  const judgmentCount=()=>notes.length+notes.filter(n=>Number.isFinite(n.holdEndMs)).length;
  const occupied=new Map();
  notes.forEach(n=>{
    if(!occupied.has(n.timeMs))occupied.set(n.timeMs,new Set());
    occupied.get(n.timeMs).add(n.lane);
  });
  const beat=60000/165;
  const half=beat/2;
  const quarter=beat/4;
  const candidates=[];
  for(let t=first+beat*4;t<last-beat*2;t+=quarter){
    const time=Math.round(t);
    if(nearestEventDistance([...occupied.keys()].sort((a,b)=>a-b),time)<82)continue;
    candidates.push(time);
  }

  let ci=0;
  while(judgmentCount()<SPICA_TARGET_JUDGMENT_COUNT&&ci<candidates.length){
    const t=candidates[ci++];
    // Do not add a note that violates an active hold's one-side rule.
    const activeHold=notes.find(n=>Number.isFinite(n.holdEndMs)&&t>n.timeMs&&t<n.holdEndMs);
    let phase=Math.floor((t-first)/half)%16;
    let lane=phase<=8?phase:16-phase;
    if(activeHold){
      if(activeHold.lane<=4) lane=Math.max(5,lane);
      else lane=Math.min(3,lane);
      if(lane===activeHold.lane)continue;
    }
    const lanes=occupied.get(t)||new Set();
    if(lanes.size>=2||lanes.has(lane))continue;
    lanes.add(lane);occupied.set(t,lanes);
    notes.push({timeMs:t,lane});
  }

  notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);
  return {
    ...source,
    bpm:165,
    difficulty:'MASTER参考 / 二本指向け / 長押しあり',
    noteCount:notes.length,
    judgmentCount:judgmentCount(),
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
