const audioFile = document.getElementById('audioFile');
const audioMode = document.getElementById('audioMode');
const chartFile = document.getElementById('chartFile');
const audio = document.getElementById('audio');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const demoBtn = document.getElementById('demoBtn');
const retryBtn = document.getElementById('retryBtn');
const backBtn = document.getElementById('backBtn');
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
const comboOverlay = document.getElementById('comboOverlay');
const comboCount = document.getElementById('comboCount');
const judgeEl = document.getElementById('judge');
const resultPanel = document.getElementById('resultPanel');
const rPerfect = document.getElementById('rPerfect');
const rGreat = document.getElementById('rGreat');
const rGood = document.getElementById('rGood');
const rMiss = document.getElementById('rMiss');
const rMaxCombo = document.getElementById('rMaxCombo');
const rScore = document.getElementById('rScore');

const laneKeys = ['KeyA','KeyS','KeyD','KeyF','Space','KeyJ','KeyK','KeyL','Semicolon'];
const laneArtworks = Array.from({length:9}, () => 'icon-192.png');
const HIT_WINDOWS = {perfect:45, great:85, good:150};
const MISS_WINDOW = 150;
const TRAIL_MS = 420;

let chart = null;
let playing = false;
let rafId = null;
let activeNotes = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let counts = {perfect:0,great:0,good:0,miss:0};
let audioCtx = null;
let silentStartAt = 0;
let silentDurationMs = 0;

function getGeometry() {
  const w = game.clientWidth;
  const h = game.clientHeight;
  const spawn = {x:w * 0.5, y:h * 0.075};

  const centerX = w * 0.5;
  const centerY = h * 0.20;
  const radiusX = w * 0.33;
  const radiusY = h * 0.70;

  const targetPoints = Array.from({length:9}, (_, i) => {
    const angle = Math.PI + (Math.PI * i / 8);
    return {
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY - Math.sin(angle) * radiusY
    };
  });

  return {spawn,targetPoints};
}

function setTargetArtwork(avatar, path) {
  if (!path) return;
  const img = new Image();
  img.onload = () => {
    avatar.style.setProperty('--target-art', `url("${path}")`);
    avatar.classList.add('has-art');
  };
  img.onerror = () => avatar.classList.remove('has-art');
  img.src = path;
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

    const avatar = document.createElement('span');
    avatar.className = 'target-avatar';
    setTargetArtwork(avatar, laneArtworks[i]);

    const ring = document.createElement('span');
    ring.className = 'target-ring';

    target.appendChild(avatar);
    target.appendChild(ring);
    target.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      hitLane(i);
    });
    targets.appendChild(target);
  });
}

function removeNoteEl(note) {
  note.el?.remove();
  note.el = null;
}

layoutPlayfield();
window.addEventListener('resize', () => {
  layoutPlayfield();
  if (playing) activeNotes.forEach(removeNoteEl);
});

function isSilentMode() {
  return audioMode.value === 'silent';
}

function canStart() {
  const sourceReady = isSilentMode() || !!audio.src;
  startBtn.disabled = !(sourceReady && chart);
}

function updateComboDisplay() {
  comboEl.textContent = combo;
  if (combo > 0) {
    comboCount.textContent = combo;
    comboOverlay.hidden = false;
  } else {
    comboOverlay.hidden = true;
  }
}

function updateHud() {
  scoreEl.textContent = score;
  updateComboDisplay();
}

audioMode.addEventListener('change', () => {
  if (isSilentMode()) {
    songName.textContent = 'テスト用（無音）';
  } else {
    songName.textContent = audioFile.files?.[0]?.name || '未選択';
  }
  canStart();
});

audioFile.addEventListener('change', () => {
  const file = audioFile.files?.[0];
  if (!file) return;
  if (audio.src && audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
  audio.src = URL.createObjectURL(file);
  audioMode.value = 'file';
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

function loadDemoChart() {
  chart = {
    title: '操作テスト譜面',
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
  audioMode.value = 'silent';
  songName.textContent = 'テスト用（無音）';
  canStart();
}

demoBtn.addEventListener('click', loadDemoChart);

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

function tryEnterMobilePlayMode() {
  document.body.classList.remove('finished-mode');
  document.body.classList.add('playing-mode');
  requestAnimationFrame(layoutPlayfield);

  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (!coarse) return;

  const root = document.documentElement;
  if (root.requestFullscreen && !document.fullscreenElement) {
    root.requestFullscreen().then(() => {
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    }).catch(() => {});
  }
}

function exitMobilePlayMode() {
  document.body.classList.remove('playing-mode', 'finished-mode');
  requestAnimationFrame(layoutPlayfield);
  setTimeout(layoutPlayfield, 150);
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

async function startGame() {
  if (!chart || (!isSilentMode() && !audio.src)) return;

  tryEnterMobilePlayMode();
  resetGame();
  resultPanel.hidden = true;

  if (isSilentMode()) {
    silentStartAt = performance.now();
    const lastNote = chart.notes.length ? chart.notes[chart.notes.length - 1].timeMs : 0;
    silentDurationMs = lastNote + TRAIL_MS + 1200;
  } else {
    try {
      await audio.play();
    } catch (e) {
      exitMobilePlayMode();
      alert('音源を再生できませんでした。');
      return;
    }
  }

  playing = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  judgeEl.textContent = 'GO!';
  loop();
}

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => {
  resultPanel.hidden = true;
  exitMobilePlayMode();
  judgeEl.textContent = 'READY';
  window.scrollTo({top:0, behavior:'smooth'});
});

stopBtn.addEventListener('click', stopGame);
audio.addEventListener('ended', () => {
  if (!isSilentMode()) setTimeout(finishGame, TRAIL_MS);
});

function resetGame() {
  cancelAnimationFrame(rafId);
  notesLayer.innerHTML = '';
  activeNotes = chart.notes.map((n, idx) => ({
    ...n,
    idx,
    el:null,
    hit:false,
    missRegistered:false,
    finished:false
  }));
  score = 0;
  combo = 0;
  maxCombo = 0;
  counts = {perfect:0,great:0,good:0,miss:0};
  if (!isSilentMode() && audio.src) audio.currentTime = 0;
  updateHud();
}

function stopGame() {
  if (!playing) return;
  playing = false;
  if (!isSilentMode()) audio.pause();
  cancelAnimationFrame(rafId);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  judgeEl.textContent = 'STOP';
  exitMobilePlayMode();
}

function finishGame() {
  if (!playing) return;
  playing = false;
  if (!isSilentMode()) audio.pause();
  cancelAnimationFrame(rafId);

  activeNotes.forEach(n => {
    if (!n.hit && !n.missRegistered) registerMiss(n);
    removeNoteEl(n);
    n.finished = true;
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

  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse) {
    document.body.classList.add('finished-mode');
  } else {
    exitMobilePlayMode();
  }
}

function currentMs() {
  const baseMs = isSilentMode()
    ? performance.now() - silentStartAt
    : audio.currentTime * 1000;
  return baseMs + Number(offsetInput.value || 0);
}

function getNoteProgress(dt, leadMs) {
  if (dt >= 0) {
    const raw = 1 - Math.max(0, dt) / leadMs;
    return raw * raw * (3 - 2 * raw);
  }
  return 1 + Math.min(0.24, (-dt / TRAIL_MS) * 0.24);
}

function loop() {
  if (!playing) return;
  const now = currentMs();
  const leadMs = 1600 / Number(speed.value);
  const {spawn,targetPoints} = getGeometry();

  for (const n of activeNotes) {
    if (n.finished) continue;
    const dt = n.timeMs - now;

    if (!n.hit && !n.missRegistered && dt < -MISS_WINDOW) {
      registerMiss(n);
    }

    if (n.hit) {
      n.finished = true;
      continue;
    }

    if (dt <= leadMs && dt >= -TRAIL_MS) {
      if (!n.el) n.el = createNoteEl();
      const progress = getNoteProgress(dt, leadMs);
      const p = targetPoints[n.lane];
      const x = spawn.x + (p.x - spawn.x) * progress;
      const y = spawn.y + (p.y - spawn.y) * progress;
      const scale = progress <= 1 ? 0.45 + 0.55 * progress : 1;
      n.el.style.left = `${x}px`;
      n.el.style.top = `${y}px`;
      n.el.style.transform = `translate(-50%,-50%) scale(${scale})`;
      n.el.classList.toggle('missed', n.missRegistered);
    } else if (dt < -TRAIL_MS) {
      removeNoteEl(n);
      n.finished = true;
    }
  }

  if (isSilentMode() && now >= silentDurationMs) {
    finishGame();
    return;
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
    if (n.lane !== lane || n.hit || n.missRegistered || n.finished) continue;
    const abs = Math.abs(now - n.timeMs);
    if (abs < bestAbs && abs <= HIT_WINDOWS.good) {
      bestAbs = abs;
      candidate = n;
    }
  }
  if (!candidate) return;

  let grade = 'good';
  if (bestAbs <= HIT_WINDOWS.perfect) grade = 'perfect';
  else if (bestAbs <= HIT_WINDOWS.great) grade = 'great';

  registerHit(candidate, grade);
  playTapSound(grade);
}

function registerHit(note, grade) {
  if (note.hit || note.missRegistered) return;
  note.hit = true;
  note.finished = true;
  removeNoteEl(note);
  counts[grade]++;
  combo++;
  maxCombo = Math.max(maxCombo, combo);
  score += grade === 'perfect' ? 1000 : grade === 'great' ? 700 : 400;
  judgeEl.textContent = grade.toUpperCase();
  updateHud();
}

function registerMiss(note) {
  if (note.hit || note.missRegistered) return;
  note.missRegistered = true;
  counts.miss++;
  combo = 0;
  judgeEl.textContent = 'MISS';
  updateHud();
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

loadDemoChart();
judgeEl.textContent = 'READY';
updateHud();
