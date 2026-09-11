const spicaPresetBtn = document.getElementById('spicaPresetBtn');

const PRESET_AUDIO_DB = 'rhythmGamePresetAudio';
const PRESET_AUDIO_STORE = 'audio';
const SPICA_AUDIO_KEY = 'spica-terrible';
let awaitingPresetAudioKey = null;
let presetAudioObjectUrl = null;

function openPresetAudioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PRESET_AUDIO_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PRESET_AUDIO_STORE)) {
        db.createObjectStore(PRESET_AUDIO_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePresetAudio(key, file) {
  const db = await openPresetAudioDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PRESET_AUDIO_STORE, 'readwrite');
    tx.objectStore(PRESET_AUDIO_STORE).put({
      key,
      blob: file,
      name: file.name || '音源',
      type: file.type || '',
      size: file.size || 0,
      savedAt: Date.now()
    });
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
  if (audio.src && audio.src.startsWith('blob:')) {
    try { URL.revokeObjectURL(audio.src); } catch (_) {}
  }
  audio.src = presetAudioObjectUrl;
  audioMode.value = 'file';
  songName.textContent = `${title}（保存済み音源）`;
  canStart();
  return true;
}

async function loadBuiltInChart(path, fallbackTitle) {
  try {
    const response = await fetch(`${path}?v=${window.APP_VERSION}&t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    validateChart(parsed);
    chart = parsed;
    chartName.textContent = parsed.title || fallbackTitle || path;
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
  const parsed = await loadBuiltInChart('charts/spica-terrible.json', 'スピカテリブル');
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
    if (key === SPICA_AUDIO_KEY) {
      songName.textContent = 'スピカテリブル（音源をこの端末に保存しました）';
    }
  } catch (e) {
    console.warn('音源を端末に保存できませんでした', e);
    if (key === SPICA_AUDIO_KEY) {
      songName.textContent = 'スピカテリブル（今回はこのファイルで再生します）';
    }
  }
  canStart();
});
