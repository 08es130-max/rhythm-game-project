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

async function prepareSavedTapSound() {
  if (customTapBuffer) return customTapBuffer;
  if (customTapLoadPromise) return customTapLoadPromise;
  customTapLoadPromise = (async () => {
    try {
      const record = await getSavedTapSound();
      if (!record?.blob) return null;
      return await decodeTapSound(record.blob);
    } catch (e) {
      console.warn('保存済みタップ音を読み込めませんでした', e);
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
    <div id="tapSoundStatus" class="settings-value">未登録</div>
    <small>一度登録すると、この端末に保存されます。</small>
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

// 最初のユーザー操作で保存済み音源を先読みして、プレイ中の遅延を避ける。
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
  gain.gain.value = 0.75;
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
restoreDeviceSettings();
