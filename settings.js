const SETTINGS_KEYS = {
  speed: 'rhythmGame.noteSpeed',
  timingOffset: 'rhythmGame.timingOffsetMs',
  perfectAssist: 'rhythmGame.perfectAssist'
};

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getSavedTimingOffset() {
  return clampNumber(localStorage.getItem(SETTINGS_KEYS.timingOffset), -500, 500, 0);
}

function setSavedTimingOffset(value) {
  const normalized = clampNumber(value, -500, 500, 0);
  localStorage.setItem(SETTINGS_KEYS.timingOffset, String(normalized));
  return normalized;
}

function isPerfectAssistEnabled() {
  return localStorage.getItem(SETTINGS_KEYS.perfectAssist) === 'true';
}

function getPerfectWindow() {
  return isPerfectAssistEnabled() ? 70 : HIT_WINDOWS.perfect;
}

window.getPerfectWindow = getPerfectWindow;

function restoreDeviceSettings() {
  const savedSpeed = clampNumber(localStorage.getItem(SETTINGS_KEYS.speed), 0.7, 4.0, 1.0);
  const savedTiming = getSavedTimingOffset();

  speed.value = savedSpeed.toFixed(1);
  speedValue.textContent = `${savedSpeed.toFixed(1)}x`;
  offsetInput.value = String(savedTiming);

  const assist = document.getElementById('perfectAssist');
  if (assist) assist.checked = isPerfectAssistEnabled();
}

speed.addEventListener('input', () => {
  localStorage.setItem(SETTINGS_KEYS.speed, Number(speed.value).toFixed(1));
});

offsetInput.addEventListener('input', () => {
  setSavedTimingOffset(offsetInput.value);
});

const perfectAssist = document.getElementById('perfectAssist');
if (perfectAssist) {
  perfectAssist.addEventListener('change', () => {
    localStorage.setItem(SETTINGS_KEYS.perfectAssist, String(perfectAssist.checked));
  });
}

// 端末内にカスタムのタップ音を保存する。
const TAP_SOUND_DB = 'rhythmGameTapSound';
const TAP_SOUND_STORE = 'audio';
const TAP_SOUND_KEY = 'custom-tap';
const BUILTIN_TAP_BASE64 = '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';
let customTapBuffer = null;
let customTapLoadPromise = null;
const fallbackPlayTapSound = playTapSound;

function openTapSoundDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TAP_SOUND_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TAP_SOUND_STORE)) {
        db.createObjectStore(TAP_SOUND_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveTapSoundFile(file) {
  const db = await openTapSoundDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(TAP_SOUND_STORE, 'readwrite');
    tx.objectStore(TAP_SOUND_STORE).put({
      key: TAP_SOUND_KEY,
      blob: file,
      name: file.name || 'カスタムタップ音',
      savedAt: Date.now()
    });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

async function getSavedTapSound() {
  const db = await openTapSoundDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(TAP_SOUND_STORE, 'readonly');
    const req = tx.objectStore(TAP_SOUND_STORE).get(TAP_SOUND_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return record;
}

async function decodeTapSound(blob) {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') {
    try { await audioCtx.resume(); } catch (_) {}
  }
  const arrayBuffer = await blob.arrayBuffer();
  customTapBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  return customTapBuffer;
}

async function decodeBuiltInTapSound() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const binary = atob(BUILTIN_TAP_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  customTapBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
  return customTapBuffer;
}

async function prepareSavedTapSound() {
  if (customTapBuffer) return customTapBuffer;
  if (customTapLoadPromise) return customTapLoadPromise;
  customTapLoadPromise = (async () => {
    try {
      const record = await getSavedTapSound();
      if (record?.blob) return await decodeTapSound(record.blob);
      return await decodeBuiltInTapSound();
    } catch (e) {
      console.warn('タップ音を読み込めませんでした', e);
      return null;
    } finally {
      customTapLoadPromise = null;
    }
  })();
  return customTapLoadPromise;
}

function injectTapSoundSetting() {
  const grid = document.querySelector('#settingsScreen .settings-grid');
  if (!grid || document.getElementById('tapSoundFile')) return;

  const card = document.createElement('div');
  card.className = 'setting-card';
  card.innerHTML = `
    <label>タップ音
      <input id="tapSoundFile" type="file" accept="audio/*,.mp3,.m4a,.wav" />
    </label>
    <div id="tapSoundStatus" class="settings-value">標準: シャン</div>
    <small>標準は今回の「シャン」音です。別の音に変える場合だけファイルを選んでください。</small>
  `;
  grid.appendChild(card);

  const input = document.getElementById('tapSoundFile');
  const status = document.getElementById('tapSoundStatus');

  getSavedTapSound().then((record) => {
    if (record?.blob) status.textContent = `登録済み: ${record.name || 'タップ音'}`;
  }).catch(() => {});

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    status.textContent = '登録中…';
    try {
      await saveTapSoundFile(file);
      customTapBuffer = null;
      await decodeTapSound(file);
      status.textContent = `登録済み: ${file.name}`;
    } catch (e) {
      console.warn('タップ音を保存できませんでした', e);
      status.textContent = '登録に失敗しました';
    }
  });
}

// 最初のユーザー操作で先読みして、プレイ中の遅延を避ける。
document.addEventListener('pointerdown', () => {
  prepareSavedTapSound().catch(() => {});
}, { once: true, capture: true });

document.addEventListener('keydown', () => {
  prepareSavedTapSound().catch(() => {});
}, { once: true, capture: true });

playTapSound = function(grade) {
  if (!customTapBuffer || !audioCtx) {
    prepareSavedTapSound().catch(() => {});
    fallbackPlayTapSound(grade);
    return;
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = customTapBuffer;
  gain.gain.value = 0.82;
  source.connect(gain).connect(audioCtx.destination);
  source.start();
};

// 譜面側のoffsetMsとは別に、端末ごとの判定タイミング補正を加える。
currentMs = function() {
  const baseMs = isSilentMode()
    ? performance.now() - silentStartAt
    : audio.currentTime * 1000;
  const chartOffset = Number(chart?.offsetMs || 0);
  const deviceOffset = getSavedTimingOffset();
  return baseMs + chartOffset + deviceOffset;
};

// 判定円の直前で減速しないよう、出現から通過まで等速にする。
getNoteProgress = function(dt, leadMs) {
  if (dt >= 0) {
    return 1 - Math.max(0, dt) / leadMs;
  }
  return 1 + Math.min(0.24, (-dt / TRAIL_MS) * 0.24);
};

// PERFECT判定だけを端末設定に応じて広げる。
hitLane = function(lane) {
  flashTarget(lane);
  if (!playing) return;
  const now = currentMs();
  let candidate = null;
  let bestAbs = Infinity;

  for (const n of activeNotes) {
    if (n.lane !== lane || n.hit || n.missRegistered || n.finished) continue;
    const abs = Math.abs(now - n.timeMs);
    if (abs < bestAbs && abs <= HIT_WINDOWS.good) {
      bestAbs = abs;
      candidate = n;
    }
  }
  if (!candidate) return;

  let grade = 'good';
  if (bestAbs <= getPerfectWindow()) grade = 'perfect';
  else if (bestAbs <= HIT_WINDOWS.great) grade = 'great';

  registerHit(candidate, grade);
  playTapSound(grade);
};

// app.js が譜面読み込み時に入力欄を書き換えても、端末設定表示へ戻す。
demoBtn.addEventListener('click', () => {
  queueMicrotask(() => {
    offsetInput.value = String(getSavedTimingOffset());
  });
});

chartFile.addEventListener('change', async () => {
  const file = chartFile.files?.[0];
  if (!file) return;
  try {
    await file.text();
  } catch (_) {}
  offsetInput.value = String(getSavedTimingOffset());
});

injectTapSoundSetting();
prepareSavedTapSound().catch(() => {});
restoreDeviceSettings();
