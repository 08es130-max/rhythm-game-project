// Ver.0.3.3: long-hold notes
(function(){
  const heldLanes = new Set();
  const pointerLane = new Map();

  const baseResetGame = resetGame;
  resetGame = function() {
    heldLanes.clear();
    pointerLane.clear();
    baseResetGame();
    activeNotes.forEach(n => {
      n.holding = false;
      n.holdGrade = null;
      n.holdEndMs = Number.isFinite(n.durationMs) ? n.timeMs + n.durationMs : null;
    });
  };

  const baseValidateChart = validateChart;
  validateChart = function(data) {
    baseValidateChart(data);
    data.notes.forEach((n, idx) => {
      if (n.durationMs != null && (!Number.isFinite(n.durationMs) || n.durationMs < 250 || n.durationMs > 8000)) {
        throw new Error(`notes[${idx}] のdurationMsが不正です`);
      }
    });
  };

  function gradeFromAbs(abs) {
    if (abs <= HIT_WINDOWS.perfect) return 'perfect';
    if (abs <= HIT_WINDOWS.great) return 'great';
    return 'good';
  }

  function makeHoldNoteEl(note, leadMs, spawn, target) {
    const el = document.createElement('div');
    el.className = 'note hold-note';
    const tail = document.createElement('span');
    tail.className = 'hold-tail';
    const laneLength = Math.hypot(target.x - spawn.x, target.y - spawn.y);
    const tailPx = Math.max(34, Math.min(laneLength * 0.72, laneLength * (note.durationMs / leadMs)));
    const angle = Math.atan2(spawn.y - target.y, spawn.x - target.x) * 180 / Math.PI + 90;
    tail.style.height = `${tailPx}px`;
    tail.style.transform = `translate(-50%,-100%) rotate(${angle}deg)`;
    el.appendChild(tail);
    notesLayer.appendChild(el);
    return el;
  }

  function completeHold(note) {
    if (!note || note.hit || note.missRegistered || note.finished) return;
    note.holding = false;
    const grade = note.holdGrade || 'perfect';
    registerHit(note, grade);
    playTapSound(grade);
  }

  function cancelHold(note) {
    if (!note || note.hit || note.missRegistered || note.finished) return;
    note.holding = false;
    registerMiss(note);
    removeNoteEl(note);
    note.finished = true;
  }

  function releaseLane(lane) {
    heldLanes.delete(lane);
    if (!playing) return;
    const now = currentMs();
    const hold = activeNotes.find(n => n.lane === lane && n.holding && !n.hit && !n.missRegistered && !n.finished);
    if (!hold) return;
    const end = hold.holdEndMs ?? (hold.timeMs + Number(hold.durationMs || 0));
    if (now >= end - HIT_WINDOWS.good) {
      completeHold(hold);
    } else {
      cancelHold(hold);
      judgeEl.textContent = 'HOLD MISS';
    }
  }

  hitLane = function(lane) {
    heldLanes.add(lane);
    flashTarget(lane);
    if (!playing) return;
    const now = currentMs();
    let candidate = null;
    let bestAbs = Infinity;

    for (const n of activeNotes) {
      if (n.lane !== lane || n.hit || n.missRegistered || n.finished || n.holding) continue;
      const abs = Math.abs(now - n.timeMs);
      if (abs < bestAbs && abs <= HIT_WINDOWS.good) {
        bestAbs = abs;
        candidate = n;
      }
    }
    if (!candidate) return;

    const grade = gradeFromAbs(bestAbs);
    if (Number.isFinite(candidate.durationMs) && candidate.durationMs >= 250) {
      candidate.holding = true;
      candidate.holdGrade = grade;
      candidate.holdEndMs = candidate.timeMs + candidate.durationMs;
      candidate.el?.classList.add('holding');
      judgeEl.textContent = `HOLD ${grade.toUpperCase()}`;
      playTapSound(grade);
      return;
    }

    registerHit(candidate, grade);
    playTapSound(grade);
  };

  loop = function() {
    if (!playing) return;
    const now = currentMs();
    const leadMs = 1600 / Number(speed.value);
    const {spawn,targetPoints} = getGeometry();

    for (const n of activeNotes) {
      if (n.finished) continue;
      const isHold = Number.isFinite(n.durationMs) && n.durationMs >= 250;
      const dt = n.timeMs - now;

      if (isHold && n.holding) {
        const p = targetPoints[n.lane];
        if (!n.el) n.el = makeHoldNoteEl(n, leadMs, spawn, p);
        n.el.style.left = `${p.x}px`;
        n.el.style.top = `${p.y}px`;
        n.el.style.transform = 'translate(-50%,-50%) scale(1)';
        n.el.classList.add('holding');
        if (now >= n.holdEndMs) {
          if (heldLanes.has(n.lane)) completeHold(n);
          else cancelHold(n);
        }
        continue;
      }

      if (!n.hit && !n.missRegistered && dt < -MISS_WINDOW) registerMiss(n);
      if (n.hit) {
        n.finished = true;
        continue;
      }

      if (dt <= leadMs && dt >= -TRAIL_MS) {
        const p = targetPoints[n.lane];
        if (!n.el) n.el = isHold ? makeHoldNoteEl(n, leadMs, spawn, p) : createNoteEl();
        const progress = getNoteProgress(dt, leadMs);
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
  };

  document.addEventListener('pointerdown', e => {
    const target = e.target?.closest?.('.target');
    if (!target) return;
    const lane = Number(target.dataset.lane);
    if (Number.isInteger(lane)) pointerLane.set(e.pointerId, lane);
  }, true);

  document.addEventListener('pointerup', e => {
    const lane = pointerLane.get(e.pointerId);
    if (lane != null) releaseLane(lane);
    pointerLane.delete(e.pointerId);
  }, true);
  document.addEventListener('pointercancel', e => {
    const lane = pointerLane.get(e.pointerId);
    if (lane != null) releaseLane(lane);
    pointerLane.delete(e.pointerId);
  }, true);
  document.addEventListener('keyup', e => {
    const lane = laneKeys.indexOf(e.code);
    if (lane >= 0) releaseLane(lane);
  });
})();
