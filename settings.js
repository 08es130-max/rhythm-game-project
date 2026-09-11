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
  const savedSpeed = clampNumber(localStorage.getItem(SETTINGS_KEYS.speed), 0.7, 2.0, 1.0);
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

restoreDeviceSettings();