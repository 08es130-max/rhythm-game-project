// Ver.0.4.1: result rank/full-combo display + per-song high score storage
(function(){
  const HIGH_SCORE_KEY = 'lovefes.highScores.v1';

  function loadHighScores() {
    try {
      const raw = localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveHighScores(scores) {
    try { localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores)); } catch (_) {}
  }

  function currentSongKey() {
    const explicit = chart?.songId || chart?.id;
    if (explicit) return String(explicit);
    const title = chart?.title || chartName?.textContent || songName?.textContent || 'unknown-song';
    return String(title).replace(/（\d+ notes）/g, '').trim();
  }

  function currentSongTitle() {
    return String(chart?.title || chartName?.textContent || songName?.textContent || 'Unknown').replace(/（\d+ notes）/g, '').trim();
  }

  function getRank() {
    const noteCount = Math.max(1, Number(chart?.notes?.length || 0));
    const maxScore = noteCount * 1000;
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 0.95) return 'S';
    if (ratio >= 0.90) return 'A';
    if (ratio >= 0.80) return 'B';
    if (ratio >= 0.70) return 'C';
    return 'D';
  }

  function isFullCombo() {
    const total = Number(chart?.notes?.length || 0);
    const judged = counts.perfect + counts.great + counts.good + counts.miss;
    return total > 0 && judged === total && counts.miss === 0 && maxCombo === total;
  }

  function ensureResultExtras() {
    if (!resultPanel) return null;
    let summary = document.getElementById('resultAchievementSummary');
    if (!summary) {
      summary = document.createElement('div');
      summary.id = 'resultAchievementSummary';
      summary.innerHTML = `
        <div id="resultRank" style="font-size:clamp(42px,8vw,72px);font-weight:900;line-height:1;letter-spacing:.04em">-</div>
        <div id="resultFullCombo" style="margin-top:8px;font-size:clamp(18px,3.6vw,28px);font-weight:900;min-height:1.3em"></div>
        <div id="resultNewRecord" style="margin-top:5px;font-size:14px;font-weight:800;min-height:1.3em"></div>
      `;
      summary.style.cssText = 'text-align:center;margin:8px 0 16px;padding:12px;border-radius:16px;background:rgba(255,255,255,.07);';
      const grid = resultPanel.querySelector('.result-grid');
      resultPanel.insertBefore(summary, grid || null);
    }

    let highScoreBox = document.getElementById('resultHighScoreBox');
    if (!highScoreBox) {
      highScoreBox = document.createElement('div');
      highScoreBox.id = 'resultHighScoreBox';
      highScoreBox.innerHTML = 'HIGH SCORE <strong id="rHighScore">0</strong>';
      const grid = resultPanel.querySelector('.result-grid');
      if (grid) grid.appendChild(highScoreBox);
    }
    return summary;
  }

  function renderEnhancedResult() {
    ensureResultExtras();
    const rank = getRank();
    const fullCombo = isFullCombo();
    const songKey = currentSongKey();
    const songTitle = currentSongTitle();
    const allScores = loadHighScores();
    const previous = allScores[songKey] || null;
    const isNewRecord = !previous || score > Number(previous.score || 0);

    if (isNewRecord) {
      allScores[songKey] = {
        title: songTitle,
        score,
        maxCombo,
        rank,
        fullCombo,
        playedAt: Date.now()
      };
      saveHighScores(allScores);
    } else if (previous) {
      let changed = false;
      if (maxCombo > Number(previous.maxCombo || 0)) {
        previous.maxCombo = maxCombo;
        changed = true;
      }
      if (fullCombo && !previous.fullCombo) {
        previous.fullCombo = true;
        changed = true;
      }
      if (changed) {
        previous.playedAt = Date.now();
        allScores[songKey] = previous;
        saveHighScores(allScores);
      }
    }

    const best = loadHighScores()[songKey] || { score };
    const rankEl = document.getElementById('resultRank');
    const fullComboEl = document.getElementById('resultFullCombo');
    const newRecordEl = document.getElementById('resultNewRecord');
    const highScoreEl = document.getElementById('rHighScore');

    if (rankEl) rankEl.textContent = `RANK ${rank}`;
    if (fullComboEl) fullComboEl.textContent = fullCombo ? 'FULL COMBO!' : 'CLEAR';
    if (newRecordEl) newRecordEl.textContent = isNewRecord ? 'NEW RECORD!' : '';
    if (highScoreEl) highScoreEl.textContent = Number(best.score || 0).toLocaleString('ja-JP');

    if (rScore) rScore.textContent = Number(score).toLocaleString('ja-JP');
    if (rMaxCombo) rMaxCombo.textContent = maxCombo;
  }

  ensureResultExtras();

  if (typeof finishGame === 'function') {
    const finishGameBeforeResultEnhancements = finishGame;
    finishGame = function() {
      const shouldRender = !!playing;
      finishGameBeforeResultEnhancements();
      if (shouldRender) renderEnhancedResult();
    };
  }

  window.getLoveFesHighScores = loadHighScores;
})();
