const audioFile = document.getElementById('audioFile');
const chartFile = document.getElementById('chartFile');
const audio = document.getElementById('audio');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const demoBtn = document.getElementById('demoBtn');
const speed = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const offsetInput = document.getElementById('offset');
const songName = document.getElementById('songName');
const chartName = document.getElementById('chartName');
const notesLayer = document.getElementById('notesLayer');
const laneLayer = document.getElementById('laneLayer');
const targets = document.getElementById('targets');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const judgeEl = document.getElementById('judge');
const resultPanel = document.getElementById('resultPanel');
const rPerfect = document.getElementById('rPerfect');
const rGreat = document.getElementById('rGreat');
const rGood = document.getElementById('rGood');
const rMiss = document.getElementById('rMiss');
const rMaxCombo = document.getElementById('rMaxCombo');
const rScore = document.getElementById('rScore');

const laneKeys = ['KeyA','KeyS','KeyD','KeyF','Space','KeyJ','KeyK','KeyL','Semicolon'];
let chart = null;
let playing = false;
let rafId = null;
let activeNotes = [];
let judged = new Set();
let score = 0;
let combo = 0;
let maxCombo = 0;
let counts = {perfect:0,great:0,good:0,miss:0};
let audioCtx = null;

for (let i = 0; i < 9; i++) {
  const lane = document.createElement('div');
  lane.className = 'lane';
  laneLayer.appendChild(lane);

  const target = document.createElement('button');
  target.className = 'target';
  target.type = 'button';
  target.dataset.lane = i;
  target.addEventListener('pointerdown', () => hitLane(i));
  targets.appendChild(target);
}

function canStart() {
  startBtn.disabled = !(audio.src && chart);
}

audioFile.addEventListener('change', () => {
  const file = audioFile.files?.[0];
  if (!file) return;
  if (audio.src) URL.revokeObjectURL(audio.src);
  audio.src = URL.createObjectURL(file);
  songName.textContent = file.name;
  canStart();
});

chartFile.addEventListener('change', async () => {
  const file = chartFile.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    validateChart(parsed);
    chart = parsed;
    chartName.textContent = parsed.title || file.name;
    offsetInput.value = parsed.offsetMs || 0;
    canStart();
  } catch (e) {
    alert('譜面JSONを読み込めませんでした: ' + e.message);
  }
});

demoBtn.addEventListener('click', () => {
  chart = {
    title: 'Demo Chart',
    offsetMs: 0,
    notes: [
      {timeMs:1000,lane:4},{timeMs:1500,lane:3},{timeMs:2000,lane:5},
      {timeMs:2500,lane:2},{timeMs:3000,lane:6},{timeMs:3500,lane:1},
      {timeMs:4000,lane:7},{timeMs:4500,lane:0},{timeMs:5000,lane:8},
      {timeMs:5500,lane:3},{timeMs:5500,lane:5},{timeMs:6250,lane:4},
      {timeMs:7000,lane:2},{timeMs:7250,lane:3},{timeMs:7500,lane:4},
      {timeMs:7750,lane:5},{timeMs:8000,lane:6}
    ]
  };
  chartName.textContent = chart.title;
  offsetInput.value = 0;
  canStart();
});

function validateChart(data) {
  if (!data || !Array.isArray(data.notes)) throw new Error('notes配列がありません');
  data.notes.forEach((n, idx) => {
    if (!Number.isFinite(n.timeMs) || !Number.isInteger(n.lane) || n.lane < 0 || n.lane > 8) {
      throw new Error(`notes[${idx}] の形式が不正です`);
    }
  });
  data.notes.sort((a,b) => a.timeMs - b.timeMs);
}

speed.addEventListener('input', () => speedValue.textContent = Number(speed.value).toFixed(1) + 'x');

startBtn.addEventListener('click', async () => {
  if (!chart || !audio.src) return;
  resetGame();
  resultPanel.hidden = true;
  await audio.play();
  playing = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  judgeEl.textContent = 'GO!';
  loop();
});

stopBtn.addEventListener('click', stopGame);
audio.addEventListener('ended', () => finishGame());

function resetGame() {
  cancelAnimationFrame(rafId);
  notesLayer.innerHTML = '';
  activeNotes = chart.notes.map((n, idx) => ({...n, idx, el:null}));
  judged = new Set();
  score = 0;
  combo = 0;
  maxCombo = 0;
  counts = {perfect:0,great:0,good:0,miss:0};
  scoreEl.textContent = '0';
  comboEl.textContent = '0';
  audio.currentTime = 0;
}

function stopGame() {
  if (!playing) return;
  playing = false;
  audio.pause();
  cancelAnimationFrame(rafId);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  judgeEl.textContent = 'STOP';
}

function finishGame() {
  playing = false;
  cancelAnimationFrame(rafId);
  activeNotes.forEach(n => {
    if (!judged.has(n.idx)) applyJudge(n, 'miss');
  });
  startBtn.disabled = false;
  stopBtn.disabled = true;
  judgeEl.textContent = 'FINISH';
  resultPanel.hidden = false;
  rPerfect.textContent = counts.perfect;
  rGreat.textContent = counts.great;
  rGood.textContent = counts.good;
  rMiss.textContent = counts.miss;
  rMaxCombo.textContent = maxCombo;
  rScore.textContent = score;
}

function currentMs() {
  return audio.currentTime * 1000 + Number(offsetInput.value || 0);
}

function loop() {
  if (!playing) return;
  const now = currentMs();
  const leadMs = 1600 / Number(speed.value);
  const gameHeight = document.getElementById('game').clientHeight;
  const judgeY = gameHeight - 92;

  for (const n of activeNotes) {
    if (judged.has(n.idx)) continue;
    const dt = n.timeMs - now;
    if (dt < -180) {
      applyJudge(n, 'miss');
      continue;
    }
    if (dt <= leadMs && dt >= -180) {
      if (!n.el) n.el = createNoteEl(n.lane);
      const progress = 1 - Math.max(0, dt) / leadMs;
      const y = 26 + progress * (judgeY - 26);
      n.el.style.top = `${y}px`;
    }
  }
  rafId = requestAnimationFrame(loop);
}

function createNoteEl(lane) {
  const el = document.createElement('div');
  el.className = 'note';
  el.style.left = `${((lane + 0.5) / 9) * 100}%`;
  notesLayer.appendChild(el);
  return el;
}

function hitLane(lane) {
  flashTarget(lane);
  if (!playing) return;
  const now = currentMs();
  let candidate = null;
  let bestAbs = Infinity;
  for (const n of activeNotes) {
    if (n.lane !== lane || judged.has(n.idx)) continue;
    const diff = now - n.timeMs;
    const abs = Math.abs(diff);
    if (abs < bestAbs && abs <= 150) {
      bestAbs = abs;
      candidate = n;
    }
  }
  if (!candidate) return;

  let grade;
  if (bestAbs <= 45) grade = 'perfect';
  else if (bestAbs <= 85) grade = 'great';
  else grade = 'good';
  applyJudge(candidate, grade);
  playTapSound(grade);
}

function applyJudge(note, grade) {
  if (judged.has(note.idx)) return;
  judged.add(note.idx);
  note.el?.remove();
  note.el = null;
  counts[grade]++;

  if (grade === 'miss') {
    combo = 0;
    judgeEl.textContent = 'MISS';
  } else {
    combo++;
    maxCombo = Math.max(maxCombo, combo);
    const add = grade === 'perfect' ? 1000 : grade === 'great' ? 700 : 400;
    score += add;
    judgeEl.textContent = grade.toUpperCase();
  }
  scoreEl.textContent = score;
  comboEl.textContent = combo;
}

function flashTarget(lane) {
  const el = targets.children[lane];
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 70);
}

function playTapSound(grade) {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(grade === 'perfect' ? 1450 : grade === 'great' ? 1250 : 1050, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const lane = laneKeys.indexOf(e.code);
  if (lane >= 0) {
    e.preventDefault();
    hitLane(lane);
  }
});
