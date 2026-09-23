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

  // SIF MASTER first-section reconstruction.
  // Use the published MASTER density curve (675 note starts, 102 holds) instead of
  // adding generic "MASTER-like" filler to the old chart.
  const first=source.notes[0]?.timeMs||2252;
  const last=source.notes[source.notes.length-1]?.timeMs||first;
  const masterDuration=110000;

  // Published cumulative MASTER note-start counts by second (chart display).
  // This preserves the real density changes: sparse opening, restrained verses,
  // then the much busier chorus/ending instead of artificial constant 16th spam.
  const cumulative=[
    0,0,0,2,5,7,11,19,26,34,41,48,55,62,69,73,76,80,83,86,90,95,102,108,
    116,126,133,140,148,155,163,172,177,184,191,198,204,213,215,220,225,229,
    235,242,248,254,261,270,278,285,291,299,305,313,320,330,339,348,358,368,
    377,384,389,398,405,411,420,426,431,440,442,450,458,469,475,482,491,498,
    504,514,520,529,538,550,558,565,575,581,589,598,602,611,616,624,630,634,
    642,649,652,653,655,658,660,662,662,664,665,669,670,672,675
  ];

  const notes=[];
  const laneTotals=[72,77,90,83,17,85,93,82,76];
  const holdTotals=[10,12,15,15,0,14,14,11,11];
  const laneUsed=Array(9).fill(0);
  const holdUsed=Array(9).fill(0);
  let seq=0;

  // Short pattern vocabulary mirrors the documented MASTER motions:
  // stairs, one-hand axes, alternating bursts, inward/outward runs and double stairs.
  const patterns=[
    [1,2,3,5,6,7],[7,6,5,3,2,1],[2,4,6,3,5,7],[6,4,2,5,3,1],
    [0,2,4,6,8,6,4,2],[8,6,4,2,0,2,4,6],[1,3,2,6,5,7],[7,5,6,2,3,1],
    [3,5,2,6,1,7],[5,3,6,2,7,1]
  ];
  const chooseLane=(preferred)=>{
    if(laneUsed[preferred]<laneTotals[preferred])return preferred;
    let best=0,bestNeed=-Infinity;
    for(let l=0;l<9;l++){
      const need=laneTotals[l]-laneUsed[l];
      if(need>bestNeed){bestNeed=need;best=l;}
    }
    return best;
  };

  for(let sec=1;sec<cumulative.length;sec++){
    const count=cumulative[sec]-cumulative[sec-1];
    if(count<=0)continue;
    const p=patterns[Math.floor(sec/4)%patterns.length];
    for(let k=0;k<count;k++){
      // Spread notes through the second; simultaneous pairs appear at selected accents.
      const pairAccent=count>=7&&k>=count-2&&sec%4===1;
      const slot=pairAccent?count-2:k;
      const frac=(slot+1)/(Math.max(1,count)+(pairAccent?0:1));
      const timeMs=Math.round(first+(sec-1+frac)*1000);
      let preferred=p[seq%p.length];
      if(pairAccent&&k===count-1)preferred=8-p[(seq-1+p.length)%p.length];
      const lane=chooseLane(preferred);
      notes.push({timeMs,lane});
      laneUsed[lane]++;seq++;
    }
  }

  // If quota balancing left a tiny lane-count mismatch, rebalance only lane identity;
  // timing/density remains untouched.
  for(let guard=0;guard<2000;guard++){
    const over=laneUsed.findIndex((v,i)=>v>laneTotals[i]);
    const under=laneUsed.findIndex((v,i)=>v<laneTotals[i]);
    if(over<0||under<0)break;
    const n=[...notes].reverse().find(x=>x.lane===over&&!notes.some(y=>y!==x&&y.timeMs===x.timeMs&&y.lane===under));
    if(!n)break;
    n.lane=under;laneUsed[over]--;laneUsed[under]++;
  }

  notes.sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  // 102 holds, with the exact published per-lane distribution.
  // Select musical phrase-ending notes and keep center free of holds.
  for(let lane=0;lane<9;lane++){
    const quota=holdTotals[lane];
    if(!quota)continue;
    const candidates=notes.filter(n=>n.lane===lane);
    for(let h=0;h<quota;h++){
      const idx=Math.min(candidates.length-1,Math.floor((h+.65)*candidates.length/quota));
      let n=candidates[idx];
      while(n&&Number.isFinite(n.holdEndMs)) n=candidates[Math.min(candidates.length-1,idx+1)];
      if(!n)continue;
      const duration=[545,727,909,1091][(h+lane)%4];
      n.holdEndMs=Math.min(first+masterDuration-250,n.timeMs+duration);
      n.holdVisualOnly=true;
      holdUsed[lane]++;
    }
  }

  // Remove notes that would make the established LoveFes hold control physically
  // impossible: no same-lane hit during a hold and no finger-crossing requirement.
  // Keep this surgical; do not touch hold starts/ends themselves.
  for(const hold of notes.filter(n=>Number.isFinite(n.holdEndMs))){
    const heldLeft=hold.lane<4;
    for(let i=notes.length-1;i>=0;i--){
      const n=notes[i];
      if(n===hold||Number.isFinite(n.holdEndMs)||n.timeMs<=hold.timeMs||n.timeMs>=hold.holdEndMs)continue;
      if(n.lane===hold.lane||(heldLeft?n.lane<5:n.lane>3))notes.splice(i,1);
    }
  }

  // After the copied MASTER-sized first section, keep the existing full-song source
  // temporarily. Verse 2 will be replaced only after the first section is approved.
  const tail=source.notes
    .filter(n=>n.timeMs>first+masterDuration+500)
    .map(n=>({...n}));
  const out=[...notes,...tail].sort((a,b)=>a.timeMs-b.timeMs||a.lane-b.lane);

  return {
    ...source,
    bpm:165,
    difficulty:'MASTER 1番再現 / フル版 / 長押しあり',
    noteCount:out.length,
    judgmentCount:out.length+out.filter(n=>Number.isFinite(n.holdEndMs)).length,
    notes:out
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
