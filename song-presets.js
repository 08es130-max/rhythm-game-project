const spicaPresetBtn = document.getElementById('spicaPresetBtn');

const PRESET_AUDIO_DB = 'rhythmGamePresetAudio';
const PRESET_AUDIO_STORE = 'audio';
const SPICA_AUDIO_KEY = 'spica-terrible';
const SPICA_TARGET_NOTE_COUNT = 1350;
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

function usePresetAudio(record, title) {
  if (!record?.blob) return false;
  if (presetAudioObjectUrl) URL.revokeObjectURL(presetAudioObjectUrl);
  presetAudioObjectUrl = URL.createObjectURL(record.blob);
  if (audio.src && audio.src.startsWith('blob:')) { try { URL.revokeObjectURL(audio.src); } catch (_) {} }
  audio.src = presetAudioObjectUrl;
  audioMode.value = 'file';
  songName.textContent = `${title}（保存済み音源）`;
  canStart();
  return true;
}

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

function makeSpicaHighDensityChart(source) {
  if (!source?.notes?.length) return source;

  // Two-thumb play only: no hold notes and never more than two notes at one instant.
  const notes = limitEventsToTwo(source.notes);
  const lanesByTime = new Map();
  notes.forEach(n => {
    if (!lanesByTime.has(n.timeMs)) lanesByTime.set(n.timeMs, new Set());
    lanesByTime.get(n.timeMs).add(n.lane);
  });

  const eventTimes = [...lanesByTime.keys()].sort((a,b) => a-b);
  const start = eventTimes.find(t => t >= 10000) ?? eventTimes[0];
  const end = eventTimes[eventTimes.length - 1];
  const step = 186;
  const candidates = [];

  for (let t = start; t <= end; t += step) {
    const d = nearestEventDistance(eventTimes, t);
    if (d >= 95 && d <= 900 && !lanesByTime.has(t)) candidates.push(t);
  }

  let need = Math.max(0, SPICA_TARGET_NOTE_COUNT - notes.length);
  const take = Math.min(need, candidates.length);
  for (let i = 0; i < take; i++) {
    const idx = Math.min(candidates.length - 1, Math.floor((i + 0.5) * candidates.length / take));
    const t = candidates[idx];
    if (lanesByTime.has(t)) continue;
    const phase = Math.floor((t - start) / step) % 16;
    const lane = phase <= 8 ? phase : 16 - phase;
    lanesByTime.set(t, new Set([lane]));
    notes.push({timeMs:t, lane});
    need--;
  }

  // If single-note additions are not enough, turn selected single events into two-note chords.
  // Existing two-note chords stay untouched, so three-finger input is never required.
  if (need > 0) {
    const singles = [...lanesByTime.entries()]
      .filter(([t, lanes]) => t >= start && lanes.size === 1)
      .map(([t]) => t)
      .sort((a,b) => a-b);
    const selected = Math.min(need, singles.length);
    for (let i = 0; i < selected; i++) {
      const idx = Math.min(singles.length - 1, Math.floor((i + 0.5) * singles.length / selected));
      const t = singles[idx];
      const used = lanesByTime.get(t);
      if (!used || used.size !== 1) continue;
      const first = [...used][0];
      let lane = 8 - first;
      if (lane === first || used.has(lane)) lane = first < 4 ? 8 : 0;
      if (used.has(lane)) continue;
      used.add(lane);
      notes.push({timeMs:t, lane});
      need--;
      if (need <= 0) break;
    }
  }

  notes.sort((a,b) => a.timeMs - b.timeMs || a.lane - b.lane);
  return {
    ...source,
    difficulty:'EXPERT 二本指向け',
    noteCount:notes.length,
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

async function prepareSpicaAudio() {
  try {
    const cached = await getPresetAudio(SPICA_AUDIO_KEY);
    if (cached && usePresetAudio(cached, 'スピカテリブル')) return true;
  } catch (e) {
    console.warn('保存済み音源を読み込めませんでした', e);
  }
  awaitingPresetAudioKey = SPICA_AUDIO_KEY;
  songName.textContent = 'スピカテリブル（初回のみ音源ファイルを選択してください）';
  audioFile.click();
  return false;
}

spicaPresetBtn?.addEventListener('click', async () => {
  const parsed = await loadBuiltInChart('charts/spica-terrible.json', 'スピカテリブル', makeSpicaHighDensityChart);
  if (!parsed) return;
  audioMode.value = 'file';
  await prepareSpicaAudio();
  canStart();
});

audioFile.addEventListener('change', async () => {
  const file = audioFile.files?.[0];
  if (!file || !awaitingPresetAudioKey) return;
  const key = awaitingPresetAudioKey;
  awaitingPresetAudioKey = null;
  try {
    await savePresetAudio(key, file);
    if (key === SPICA_AUDIO_KEY) songName.textContent = 'スピカテリブル（音源をこの端末に保存しました）';
  } catch (e) {
    console.warn('音源を端末に保存できませんでした', e);
    if (key === SPICA_AUDIO_KEY) songName.textContent = 'スピカテリブル（今回はこのファイルで再生します）';
  }
  canStart();
});
