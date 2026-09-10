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
const game = document.getElementById('game');
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

function getGeometry() {
  const w = game.clientWidth;
  const h = game.clientHeight;
  const spawn = {x:w * 0.5, y:h * 0.07};
  const centerX = w * 0.5;
  const centerY = h * 1.02;
  const radiusX = w * 0.43;
  const radiusY = h * 0.28;
  const startAngle = Math.PI * 1.06;
  const endAngle = Math.PI * 1.94;
  const targetPoints = Array.from({length:9}, (_, i) => {
    const t = i / 8;
    const a = startAngle + (endAngle - startAngle) * t;
    return {
      x: centerX + Math.cos(a) * radiusX,
      y: centerY + Math.sin(a) * radiusY
    };
  });
  return {spawn,targetPoints};
}

function layoutPlayfield() {
  const {spawn,targetPoints} = getGeometry();
  laneLayer.innerHTML = '';
  targets.innerHTML = '';

  const glow = document.createElement('div');
  glow.className = 'spawn-glow';
  glow.style.left = `${spawn.x}px`;
  glow.style.top = `${spawn.y}px`;
  laneLayer.appendChild(glow);

  targetPoints.forEach((p, i) => {
    const dx = p.x - spawn.x;
    const dy = p.y - spawn.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.style.left = `${spawn.x}px`;
    lane.style.top = `${spawn.y}px`;
    lane.style.height = `${length}px`;
    lane.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    laneLayer.appendChild(lane);

    const target = document.createElement('button');
    target.className = 'target';
    target.type = 'button';
    target.dataset.lane = i;
    target.style.left = `${p.x}px`;
    target.style.top = `${p.y}px`;
    target.addEventListener('pointerdown', () => hitLane(i));
    targets.appendChild(target);
  });
}

layoutPlayfield();
window.addEventListener('resize', () => {
  layoutPlayfield();
  if (playing) {
    for (const n of activeNotes) n.el?.remove();
    activeNotes.forEach(n => n.el = null);
  }
});

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
  const {spawn,targetPoints} = getGeometry();

  for (const n of activeNotes) {
    if (judged.has(n.idx)) continue;
    const dt = n.timeMs - now;
    if (dt < -180) {
      applyJudge(n, 'miss');
      continue;
    }
    if (dt <= leadMs && dt >= -180) {
      if (!n.el) n.el = createNoteEl();
      const raw = 1 - Math.max(0, dt) / leadMs;
      const progress = raw * raw * (3 - 2 * raw);
      const p = targetPoints[n.lane];
      const x = spawn.x + (p.x - spawn.x) * progress;
      const y = spawn.y + (p.y - spawn.y) * progress;
      const scale = 0.45 + 0.55 * progress;
      n.el.style.left = `${x}px`;
      n.el.style.top = `${y}px`;
      n.el.style.transform = `translate(-50%,-50%) scale(${scale})`;
    }
  }
  rafId = requestAnimationFrame(loop);
}

function createNoteEl() {
  const el = document.createElement('div');
  el.className = 'note';
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
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 70);
}

function playTapSound(grade) {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const base = grade === 'perfect' ? 1760 : grade === 'great' ? 1520 : 1280;
  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(base, now);
  osc1.frequency.exponentialRampToValueAtTime(base * 0.62, now + 0.07);
  osc2.frequency.setValueAtTime(base * 1.5, now);
  osc2.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.05);
  filter.type = 'highpass';
  filter.frequency.value = 650;
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain).connect(audioCtx.destination);
  osc1.start(now); osc2.start(now);
  osc1.stop(now + 0.09); osc2.stop(now + 0.07);
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const lane = laneKeys.indexOf(e.code);
  if (lane >= 0) {
    e.preventDefault();
    hitLane(lane);
  }
});
