const calibrationScreen = document.getElementById('timingCalibration');
const calibrationOpenBtn = document.getElementById('timingAdjustBtn');
const calibrationStage = document.getElementById('calibrationStage');
const calibrationNote = document.getElementById('calibrationNote');
const calibrationStatus = document.getElementById('calibrationStatus');
const calibrationProgress = document.getElementById('calibrationProgress');
const calibrationCurrent = document.getElementById('calibrationCurrent');
const calibrationRecommended = document.getElementById('calibrationRecommended');
const calibrationStartBtn = document.getElementById('calibrationStartBtn');
const calibrationSaveBtn = document.getElementById('calibrationSaveBtn');
const calibrationRetryBtn = document.getElementById('calibrationRetryBtn');
const calibrationBackBtn = document.getElementById('calibrationBackBtn');

const CAL_COUNT = 12;
const CAL_TAP_WINDOW = 320;
const CAL_GAP_AFTER_TARGET = 450;
let calRunning = false;
let calRaf = null;
let calStartAt = 0;
let calExpected = [];
let calResults = [];
let calNextIndex = 0;
let calSuggestedOffset = null;
let calLeadMs = 1600;

function getCalibrationLeadMs() {
  return 1600 / Number(speed.value || 1);
}

function showCalibration() {
  if (playing) return;
  calibrationScreen.hidden = false;
  calibrationCurrent.textContent = `${getSavedTimingOffset()} ms`;
  calibrationRecommended.textContent = '未測定';
  calibrationProgress.textContent = `0 / ${CAL_COUNT}`;
  calibrationStatus.textContent = `現在のノーツ速度 ${Number(speed.value || 1).toFixed(1)}x で測定します。STARTを押してください。`;
  calibrationSaveBtn.disabled = true;
  calibrationRetryBtn.disabled = true;
  stopCalibration();
}

function hideCalibration() {
  stopCalibration();
  calibrationScreen.hidden = true;
}

function startCalibration() {
  stopCalibration();
  calRunning = true;
  calResults = [];
  calNextIndex = 0;
  calSuggestedOffset = null;
  calibrationSaveBtn.disabled = true;
  calibrationRetryBtn.disabled = true;
  calibrationRecommended.textContent = '測定中';
  calibrationProgress.textContent = `0 / ${CAL_COUNT}`;

  calLeadMs = getCalibrationLeadMs();
  const interval = calLeadMs + CAL_GAP_AFTER_TARGET;
  calStartAt = performance.now() + 700;
  calExpected = Array.from({length: CAL_COUNT}, (_, i) => calStartAt + calLeadMs + i * interval);

  calibrationStatus.textContent = `ノーツ速度 ${Number(speed.value || 1).toFixed(1)}x。上から降ってくるノーツが中央の丸に重なった瞬間にタップしてください。`;
  calRaf = requestAnimationFrame(calibrationLoop);
}

function stopCalibration() {
  calRunning = false;
  cancelAnimationFrame(calRaf);
  calibrationNote.hidden = true;
}

function calibrationLoop(now) {
  if (!calRunning) return;

  while (calNextIndex < CAL_COUNT && now > calExpected[calNextIndex] + CAL_TAP_WINDOW) {
    calResults.push(null);
    calNextIndex++;
    calibrationProgress.textContent = `${calNextIndex} / ${CAL_COUNT}`;
  }

  if (calNextIndex >= CAL_COUNT) {
    finishCalibration();
    return;
  }

  const expected = calExpected[calNextIndex];
  const dt = expected - now;
  const progress = 1 - dt / calLeadMs;

  if (progress >= 0 && progress <= 1.22) {
    const stageH = calibrationStage.clientHeight;
    const startY = stageH * 0.07;
    const targetY = stageH * 0.88;
    const y = startY + (targetY - startY) * progress;
    calibrationNote.hidden = false;
    calibrationNote.style.top = `${y}px`;
  } else {
    calibrationNote.hidden = true;
  }

  calRaf = requestAnimationFrame(calibrationLoop);
}

function tapCalibration(e) {
  e.preventDefault();
  if (!calRunning || calNextIndex >= CAL_COUNT) return;
  const now = performance.now();
  const delta = now - calExpected[calNextIndex];
  if (Math.abs(delta) > CAL_TAP_WINDOW) return;

  calResults.push(delta);
  calNextIndex++;
  calibrationProgress.textContent = `${calNextIndex} / ${CAL_COUNT}`;
  calibrationStatus.textContent = delta >= 0 ? `${Math.round(delta)}ms 遅め` : `${Math.abs(Math.round(delta))}ms 早め`;
  calibrationNote.hidden = true;

  if (calNextIndex >= CAL_COUNT) finishCalibration();
}

function finishCalibration() {
  stopCalibration();
  const valid = calResults.filter(v => Number.isFinite(v));
  if (valid.length < 6) {
    calibrationStatus.textContent = '有効なタップが少なかったため、もう一度測定してください。';
    calibrationRecommended.textContent = '測定失敗';
    calibrationRetryBtn.disabled = false;
    return;
  }

  const sorted = [...valid].sort((a,b) => a-b);
  const trim = sorted.length >= 10 ? 2 : 1;
  const trimmed = sorted.slice(trim, sorted.length - trim);
  const avg = trimmed.reduce((a,b) => a+b, 0) / trimmed.length;
  calSuggestedOffset = Math.max(-500, Math.min(500, Math.round(-avg / 10) * 10));

  calibrationRecommended.textContent = `${calSuggestedOffset} ms`;
  calibrationStatus.textContent = `平均のズレを補正すると ${calSuggestedOffset}ms が目安です。`;
  calibrationSaveBtn.disabled = false;
  calibrationRetryBtn.disabled = false;
}

function saveCalibration() {
  if (!Number.isFinite(calSuggestedOffset)) return;
  setSavedTimingOffset(calSuggestedOffset);
  offsetInput.value = String(calSuggestedOffset);
  calibrationCurrent.textContent = `${calSuggestedOffset} ms`;
  calibrationStatus.textContent = 'この端末の判定タイミングとして保存しました。';
}

calibrationOpenBtn.addEventListener('click', showCalibration);
calibrationStartBtn.addEventListener('click', startCalibration);
calibrationRetryBtn.addEventListener('click', startCalibration);
calibrationSaveBtn.addEventListener('click', saveCalibration);
calibrationBackBtn.addEventListener('click', hideCalibration);
calibrationStage.addEventListener('pointerdown', tapCalibration);
