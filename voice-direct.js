// Ver.0.3.6: built-in voices use the same Blob/HTMLAudio route that works for device-added files
(function(){
  let currentDirectVoice = null;
  let currentStopTimer = null;
  let restoreMusicTimer = null;
  let lastManagedId = null;

  function dataUriToBlobUrl(dataUri) {
    try {
      const comma = dataUri.indexOf(',');
      const header = dataUri.slice(0, comma);
      const payload = dataUri.slice(comma + 1);
      const mime = (header.match(/^data:([^;,]+)/) || [])[1] || 'audio/mpeg';
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch (e) {
      console.warn('内部音声Blobの作成に失敗しました', e);
      return null;
    }
  }

  // iPhone/PWAで「端末追加音声」はBlob URLなら再生できているため、
  // 内蔵スプライトもdata URIのまま再生せずBlob URLへ変換して扱います。
  const spriteBlobUrl = dataUriToBlobUrl(TEN_HIT_VOICE_SPRITE);
  const directPlayers = TEN_HIT_VOICE_SEGMENTS.map(() => {
    const el = new Audio(spriteBlobUrl || TEN_HIT_VOICE_SPRITE);
    el.preload = 'auto';
    el.playsInline = true;
    el.volume = 1;
    try { el.load(); } catch (_) {}
    return el;
  });

  function duckMusic(ms) {
    if (typeof audio === 'undefined' || !audio || audio.paused) return;
    const previous = Number.isFinite(audio.volume) ? audio.volume : 1;
    audio.volume = Math.min(previous, 0.16);
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
  }

  function waitForMetadata(el) {
    if (el.readyState >= 1 && Number.isFinite(el.duration)) return Promise.resolve();
    return new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        el.removeEventListener('loadedmetadata', done);
        el.removeEventListener('canplay', done);
        resolve();
      };
      el.addEventListener('loadedmetadata', done, { once: true });
      el.addEventListener('canplay', done, { once: true });
      setTimeout(done, 700);
      try { el.load(); } catch (_) {}
    });
  }

  async function playBuiltinIndex(index) {
    const segment = TEN_HIT_VOICE_SEGMENTS[index];
    const el = directPlayers[index];
    if (!segment || !el) return;

    stopCurrent();
    currentDirectVoice = el;
    await waitForMetadata(el);

    const start = Math.max(0, Number(segment.offset || 0));
    const durationMs = Math.max(300, Number(segment.duration || 2) * 1000);
    try {
      el.pause();
      el.currentTime = start;
      el.volume = 1;
    } catch (e) {
      console.warn('内部音声の再生位置設定に失敗しました', e);
    }

    duckMusic(durationMs);
    await el.play();
    currentStopTimer = setTimeout(() => {
      if (currentDirectVoice === el) {
        try { el.pause(); } catch (_) {}
        currentDirectVoice = null;
      }
    }, durationMs);
  }

  playManagedVoice = async function(item) {
    if (item?.kind === 'builtin') {
      const index = Number(item.index ?? String(item.id || '').replace('builtin-', ''));
      try {
        await playBuiltinIndex(index);
      } catch (e) {
        console.warn('内部音声の試聴に失敗しました', e);
      }
      return;
    }

    // ここはユーザー端末で実際に鳴ることを確認できた経路をそのまま使用します。
    if (item?.kind === 'local' && item.blob) {
      stopCurrent();
      const objectUrl = URL.createObjectURL(item.blob);
      const el = new Audio(objectUrl);
      el.preload = 'auto';
      el.playsInline = true;
      el.volume = 1;
      currentDirectVoice = el;
      duckMusic(3500);
      try {
        await el.play();
      } finally {
        el.onended = () => {
          if (currentDirectVoice === el) currentDirectVoice = null;
          try { URL.revokeObjectURL(objectUrl); } catch (_) {}
        };
      }
    }
  };

  playRandomTenHitVoice = async function() {
    let candidates = [];
    try {
      candidates = typeof getManagedVoiceCandidates === 'function'
        ? await getManagedVoiceCandidates()
        : TEN_HIT_VOICE_SEGMENTS.map((segment, index) => ({ id:`builtin-${index}`, kind:'builtin', index, segment, name:segment.name }));
    } catch (_) {}
    if (!candidates.length) return;

    let pool = candidates;
    if (candidates.length > 1 && lastManagedId) {
      const filtered = candidates.filter(v => v.id !== lastManagedId);
      if (filtered.length) pool = filtered;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    lastManagedId = item.id;
    try { await playManagedVoice(item); } catch (e) { console.warn('10回成功音声の再生に失敗しました', e); }
  };

  // Settingsを開く頃までにメタデータを取得しておき、試聴タップ時の待ちを減らします。
  directPlayers.forEach(el => {
    try { el.load(); } catch (_) {}
  });
})();
