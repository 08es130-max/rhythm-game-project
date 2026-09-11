const pauseBtn = document.createElement('button');
pauseBtn.id = 'pauseBtn';
pauseBtn.className = 'pause-btn';
pauseBtn.type = 'button';
pauseBtn.setAttribute('aria-label', '一時停止');
pauseBtn.textContent = 'Ⅱ';
document.body.appendChild(pauseBtn);

const pauseMenu = document.createElement('div');
pauseMenu.id = 'pauseMenu';
pauseMenu.className = 'pause-menu';
pauseMenu.innerHTML = `
  <div class="pause-card" role="dialog" aria-modal="true" aria-labelledby="pauseTitle">
    <h2 id="pauseTitle" class="pause-title">一時停止</h2>
    <p class="pause-sub">ライブを続けますか？</p>
    <div class="pause-actions">
      <button id="pauseResumeBtn" class="pause-resume" type="button">再開</button>
      <button id="pauseQuitBtn" class="pause-quit" type="button">ライブをやめる</button>
    </div>
  </div>`;
document.body.appendChild(pauseMenu);

const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const pauseQuitBtn = document.getElementById('pauseQuitBtn');
let gamePaused = false;
let pauseStartedAt = 0;

function openPauseMenu() {
  if (!playing || gamePaused) return;
  gamePaused = true;
  pauseStartedAt = performance.now();
  cancelAnimationFrame(rafId);
  if (!isSilentMode()) audio.pause();
  judgeEl.textContent = 'PAUSE';
  pauseMenu.classList.add('open');
}

async function resumeFromPause() {
  if (!gamePaused) return;

  if (isSilentMode()) {
    silentStartAt += performance.now() - pauseStartedAt;
  } else {
    try {
      await audio.play();
    } catch (e) {
      return;
    }
  }

  gamePaused = false;
  pauseMenu.classList.remove('open');
  judgeEl.textContent = 'GO!';
  loop();
}

function quitFromPause() {
  if (!gamePaused) return;
  gamePaused = false;
  playing = false;
  cancelAnimationFrame(rafId);

  if (!isSilentMode()) {
    audio.pause();
    audio.currentTime = 0;
  }

  pauseMenu.classList.remove('open');
  resultPanel.hidden = true;
  notesLayer.innerHTML = '';
  activeNotes.forEach(n => {
    n.el = null;
    n.finished = true;
  });

  score = 0;
  combo = 0;
  maxCombo = 0;
  counts = {perfect:0,great:0,good:0,miss:0};
  updateHud();

  startBtn.disabled = false;
  stopBtn.disabled = true;
  judgeEl.textContent = 'READY';
  exitMobilePlayMode();
  window.scrollTo({top:0, behavior:'auto'});
}

pauseBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  openPauseMenu();
});

pauseResumeBtn.addEventListener('click', resumeFromPause);
pauseQuitBtn.addEventListener('click', quitFromPause);

pauseMenu.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && playing) {
    e.preventDefault();
    if (gamePaused) resumeFromPause();
    else openPauseMenu();
  }
});
