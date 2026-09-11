// Ver.0.2.7: internal + per-device selectable voice bank
const VOICE_BANK_DB = 'rhythmGameVoiceBank';
const VOICE_BANK_STORE = 'voices';
const VOICE_ENABLED_KEY = 'rhythmGame.enabledVoices';
const INTERNAL_VOICE_IDS = TEN_HIT_VOICE_SEGMENTS.map((_, i) => `builtin-${i}`);
const localVoiceBufferCache = new Map();
let lastManagedVoiceId = null;
let currentManagedVoiceSource = null;

function openManagedVoiceDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(VOICE_BANK_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(VOICE_BANK_STORE)) {
        db.createObjectStore(VOICE_BANK_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getManagedLocalVoices() {
  const db = await openManagedVoiceDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(VOICE_BANK_STORE, 'readonly');
    const req = tx.objectStore(VOICE_BANK_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}

function getEnabledManagedVoiceIds() {
  try {
    const raw = localStorage.getItem(VOICE_ENABLED_KEY);
    if (!raw) return new Set(INTERNAL_VOICE_IDS);
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : INTERNAL_VOICE_IDS);
  } catch (_) {
    return new Set(INTERNAL_VOICE_IDS);
  }
}

function saveEnabledManagedVoiceIds(ids) {
  localStorage.setItem(VOICE_ENABLED_KEY, JSON.stringify([...ids]));
}

async function addManagedLocalVoice(file) {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const db = await openManagedVoiceDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(VOICE_BANK_STORE, 'readwrite');
    tx.objectStore(VOICE_BANK_STORE).put({ id, name: file.name, blob: file, savedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  const enabled = getEnabledManagedVoiceIds();
  enabled.add(id);
  saveEnabledManagedVoiceIds(enabled);
}

async function deleteManagedLocalVoice(id) {
  const db = await openManagedVoiceDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(VOICE_BANK_STORE, 'readwrite');
    tx.objectStore(VOICE_BANK_STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  localVoiceBufferCache.delete(id);
  const enabled = getEnabledManagedVoiceIds();
  enabled.delete(id);
  saveEnabledManagedVoiceIds(enabled);
}

async function decodeManagedLocalVoice(item) {
  if (localVoiceBufferCache.has(item.id)) return localVoiceBufferCache.get(item.id);
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const ab = await item.blob.arrayBuffer();
  const buffer = await audioCtx.decodeAudioData(ab.slice(0));
  localVoiceBufferCache.set(item.id, buffer);
  return buffer;
}

async function getManagedVoiceCandidates() {
  const enabled = getEnabledManagedVoiceIds();
  const locals = await getManagedLocalVoices().catch(() => []);
  const internal = TEN_HIT_VOICE_SEGMENTS
    .map((segment, index) => ({ id: `builtin-${index}`, kind: 'builtin', index, name: segment.name, segment }))
    .filter(v => enabled.has(v.id));
  const local = locals
    .map(v => ({ ...v, kind: 'local' }))
    .filter(v => enabled.has(v.id));
  return [...internal, ...local];
}

async function playManagedVoice(item) {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') await audioCtx.resume().catch(() => {});
  try { currentManagedVoiceSource?.stop(); } catch (_) {}
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  gain.gain.value = 1.0;
  if (item.kind === 'builtin') {
    const buffer = await preloadTenHitVoice();
    if (!buffer) return;
    source.buffer = buffer;
    source.connect(gain).connect(audioCtx.destination);
    source.start(0, item.segment.offset, item.segment.duration);
  } else {
    source.buffer = await decodeManagedLocalVoice(item);
    source.connect(gain).connect(audioCtx.destination);
    source.start();
  }
  currentManagedVoiceSource = source;
  source.onended = () => { if (currentManagedVoiceSource === source) currentManagedVoiceSource = null; };
}

playRandomTenHitVoice = async function() {
  const candidates = await getManagedVoiceCandidates();
  if (!candidates.length) return;
  let pool = candidates;
  if (candidates.length > 1 && lastManagedVoiceId) {
    pool = candidates.filter(v => v.id !== lastManagedVoiceId);
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  lastManagedVoiceId = item.id;
  await playManagedVoice(item);
};

function managedVoiceRow(item, checked, isLocal) {
  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.10)';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  const label = document.createElement('span');
  label.textContent = item.name;
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.textContent = '試聴';
  preview.style.cssText = 'padding:5px 9px;font-size:12px';
  preview.addEventListener('click', () => playManagedVoice(item).catch(() => {}));
  row.append(checkbox, label, preview);

  if (isLocal) {
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '削除';
    del.style.cssText = 'padding:5px 9px;font-size:12px';
    del.addEventListener('click', async () => {
      await deleteManagedLocalVoice(item.id);
      await renderManagedVoiceSetting();
    });
    row.append(del);
  } else {
    row.append(document.createElement('span'));
  }

  checkbox.addEventListener('change', () => {
    const enabled = getEnabledManagedVoiceIds();
    if (checkbox.checked) enabled.add(item.id); else enabled.delete(item.id);
    saveEnabledManagedVoiceIds(enabled);
  });
  return row;
}

async function renderManagedVoiceSetting() {
  const grid = document.querySelector('#settingsScreen .settings-grid');
  if (!grid) return;
  let card = document.getElementById('managedVoiceCard');
  if (!card) {
    card = document.createElement('div');
    card.id = 'managedVoiceCard';
    card.className = 'setting-card';
    card.style.gridColumn = '1 / -1';
    grid.appendChild(card);
  }
  card.innerHTML = `
    <div style="font-weight:700;margin-bottom:5px">10タップごとの音声</div>
    <small>チェックした音声から10回成功ごとに1つランダム再生します。内部音声と、この端末だけに追加した音声を混ぜられます。</small>
    <div style="margin-top:10px;font-weight:600">内部音声</div>
    <div id="managedBuiltinRows"></div>
    <div style="margin-top:12px;font-weight:600">端末追加音声</div>
    <input id="managedVoiceFiles" type="file" accept="audio/*,.mp3,.m4a,.wav" multiple style="margin-top:7px;max-width:100%" />
    <div id="managedLocalRows" style="margin-top:5px"></div>
  `;
  const enabled = getEnabledManagedVoiceIds();
  const builtinRows = card.querySelector('#managedBuiltinRows');
  TEN_HIT_VOICE_SEGMENTS.forEach((segment, index) => {
    const item = { id: `builtin-${index}`, kind: 'builtin', index, name: segment.name, segment };
    builtinRows.appendChild(managedVoiceRow(item, enabled.has(item.id), false));
  });
  const localRows = card.querySelector('#managedLocalRows');
  const locals = await getManagedLocalVoices().catch(() => []);
  if (!locals.length) {
    const empty = document.createElement('small');
    empty.textContent = '追加音声はまだありません。';
    localRows.appendChild(empty);
  } else {
    locals.forEach(v => localRows.appendChild(managedVoiceRow({ ...v, kind: 'local' }, enabled.has(v.id), true)));
  }
  card.querySelector('#managedVoiceFiles').addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])];
    for (const file of files) await addManagedLocalVoice(file);
    await renderManagedVoiceSetting();
  });
}

const resetGameBeforeVoiceManager = resetGame;
resetGame = function() {
  lastManagedVoiceId = null;
  resetGameBeforeVoiceManager();
};

document.addEventListener('pointerdown', () => {
  preloadTenHitVoice().catch(() => {});
  getManagedLocalVoices().then(rows => Promise.allSettled(rows.map(v => decodeManagedLocalVoice({ ...v, kind: 'local' })))).catch(() => {});
}, { once: true, capture: true });

renderManagedVoiceSetting().catch(() => {});
