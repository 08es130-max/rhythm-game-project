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
      <button id="pauseDiagQuitBtn" class="pause-quit" type="button">診断をコピーして終了</button>
    </div>
  </div>`;
document.body.appendChild(pauseMenu);

const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const pauseQuitBtn = document.getElementById('pauseQuitBtn');
const pauseDiagQuitBtn = document.getElementById('pauseDiagQuitBtn');
let gamePaused = false;
let pauseStartedAt = 0;
let resumeInProgress = false;
let pauseSession = 0;

function openPauseMenu() {
  if (!playing || gamePaused) return;
  gamePaused = true;
  pauseSession++;
  pauseStartedAt = performance.now();
  cancelAnimationFrame(rafId);
  if (!isSilentMode()) audio.pause();
  judgeEl.textContent = 'PAUSE';
  pauseMenu.classList.add('open');
}

async function resumeFromPause() {
  if (!gamePaused || resumeInProgress) return;
  resumeInProgress = true;
  const session = pauseSession;

  try {
    if (isSilentMode()) {
      silentStartAt += performance.now() - pauseStartedAt;
    } else {
      await audio.play();
    }

    // A quit or a newer pause must not restart this paused live.
    if (!playing || !gamePaused || session !== pauseSession) return;
    gamePaused = false;
    pauseMenu.classList.remove('open');
    judgeEl.textContent = 'GO!';
    loop();
  } catch (e) {
    // Keep the pause menu available if media playback fails.
  } finally {
    resumeInProgress = false;
  }
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

// input-fix-v077.js owns pointer/touch activation of pauseBtn.

pauseResumeBtn.addEventListener('click', resumeFromPause);
pauseQuitBtn.addEventListener('click', quitFromPause);
pauseDiagQuitBtn?.addEventListener('click', async () => {
  const api=window.LOVEFES_INPUT_DEBUG;
  let out=null;
  if(api?.copyDiagnostics) out=await api.copyDiagnostics();
  if(out===true){
    pauseDiagQuitBtn.textContent='診断をコピーしました';
  }else if(typeof out==='string'){
    // Clipboard may be unavailable in an iOS PWA. Show the log so it can still be copied manually.
    const box=document.createElement('textarea');
    box.value=out;
    box.readOnly=true;
    box.style.cssText='position:fixed;inset:8%;z-index:100000;width:84%;height:70%;font-size:11px;';
    document.body.appendChild(box);
    box.focus();box.select();
  }
  setTimeout(quitFromPause,250);
});

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
