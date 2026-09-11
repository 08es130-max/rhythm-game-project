// Ver.0.3.5: iOS/PWA-safe voice playback using HTMLAudioElement
(function(){
  const directPlayers = TEN_HIT_VOICE_SEGMENTS.map(() => {
    const el = new Audio(TEN_HIT_VOICE_SPRITE);
    el.preload = 'auto';
    el.playsInline = true;
    el.volume = 1;
    try { el.load(); } catch (_) {}
    return el;
  });
  let currentDirectVoice = null;
  let currentStopTimer = null;
  let restoreMusicTimer = null;
  let lastDirectIndex = -1;
  let localObjectUrl = null;

  function duckMusic(ms) {
    if (typeof audio === 'undefined' || !audio || audio.paused) return;
    const previous = Number.isFinite(audio.volume) ? audio.volume : 1;
    audio.volume = Math.min(previous, 0.18);
    clearTimeout(restoreMusicTimer);
    restoreMusicTimer = setTimeout(() => {
      try { audio.volume = previous; } catch (_) {}
    }, Math.max(700, ms + 180));
  }

  function stopCurrent() {
    clearTimeout(currentStopTimer);
    if (currentDirectVoice) {
      try { currentDirectVoice.pause(); } catch (_) {}
      currentDirectVoice = null;
    }
    if (localObjectUrl) {
      try { URL.revokeObjectURL(localObjectUrl); } catch (_) {}
      localObjectUrl = null;
    }
  }

  function playBuiltinIndex(index) {
    const segment = TEN_HIT_VOICE_SEGMENTS[index];
    const el = directPlayers[index];
    if (!segment || !el) return Promise.resolve();
    stopCurrent();
    currentDirectVoice = el;
    const start = Math.max(0, segment.offset + 0.01);
    const durationMs = Math.max(250, segment.duration * 1000 - 20);
    try {
      el.pause();
      el.currentTime = start;
    } catch (_) {}
    el.volume = 1;
    duckMusic(durationMs);
    const promise = el.play();
    currentStopTimer = setTimeout(() => {
      if (currentDirectVoice === el) {
        try { el.pause(); } catch (_) {}
        currentDirectVoice = null;
      }
    }, durationMs);
    return promise || Promise.resolve();
  }

  playManagedVoice = function(item) {
    if (item?.kind === 'builtin') {
      const index = Number(item.index ?? String(item.id || '').replace('builtin-', ''));
      return playBuiltinIndex(index).catch(e => console.warn('内部音声の試聴に失敗しました', e));
    }
    if (item?.kind === 'local' && item.blob) {
      stopCurrent();
      localObjectUrl = URL.createObjectURL(item.blob);
      const el = new Audio(localObjectUrl);
      el.preload = 'auto';
      el.playsInline = true;
      el.volume = 1;
      currentDirectVoice = el;
      duckMusic(3200);
      const p = el.play();
      el.onended = () => { if (currentDirectVoice === el) currentDirectVoice = null; };
      return (p || Promise.resolve()).catch(e => console.warn('端末音声の試聴に失敗しました', e));
    }
    return Promise.resolve();
  };

  playRandomTenHitVoice = function() {
    let indexes = TEN_HIT_VOICE_SEGMENTS.map((_, i) => i);
    try {
      if (typeof getEnabledManagedVoiceIds === 'function') {
        const enabled = getEnabledManagedVoiceIds();
        indexes = indexes.filter(i => enabled.has(`builtin-${i}`));
      }
    } catch (_) {}
    if (!indexes.length) return;
    let pool = indexes;
    if (indexes.length > 1 && lastDirectIndex >= 0) pool = indexes.filter(i => i !== lastDirectIndex);
    const index = pool[Math.floor(Math.random() * pool.length)];
    lastDirectIndex = index;
    playBuiltinIndex(index).catch(e => console.warn('10回成功音声の再生に失敗しました', e));
  };

  // Preload the shared sprite early. No play() is attempted until an actual user tap.
  directPlayers.forEach(el => {
    try { el.load(); } catch (_) {}
  });
})();
