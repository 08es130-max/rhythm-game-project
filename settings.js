const SETTINGS_KEYS = {
  speed: 'rhythmGame.noteSpeed',
  timingOffset: 'rhythmGame.timingOffsetMs'
};

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getSavedTimingOffset() {
  return clampNumber(localStorage.getItem(SETTINGS_KEYS.timingOffset), -500, 500, 0);
}

function restoreDeviceSettings() {
  const savedSpeed = clampNumber(localStorage.getItem(SETTINGS_KEYS.speed), 0.7, 2.0, 1.0);
  const savedTiming = getSavedTimingOffset();

  speed.value = savedSpeed.toFixed(1);
  speedValue.textContent = `${savedSpeed.toFixed(1)}x`;
  offsetInput.value = String(savedTiming);
}

speed.addEventListener('input', () => {
  localStorage.setItem(SETTINGS_KEYS.speed, Number(speed.value).toFixed(1));
});

offsetInput.addEventListener('input', () => {
  const value = clampNumber(offsetInput.value, -500, 500, 0);
  localStorage.setItem(SETTINGS_KEYS.timingOffset, String(value));
});

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