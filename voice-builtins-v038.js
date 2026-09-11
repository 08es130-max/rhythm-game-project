// Ver.0.3.9: built-in voices decoded directly from base64 and played via Web Audio
(function(){
  let builtinPreparePromise = null;
  let builtinBuffers = [];
  let builtinSource = null;
  let restoreMusicTimer = null;

  function ensureAudioContext() {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function decodeDataUriBytes(dataUri) {
    const comma = dataUri.indexOf(',');
    if (comma < 0) throw new Error('invalid internal voice data');
    const binary = atob(dataUri.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function sliceAudioBuffer(buffer, startSec, durationSec) {
    const start = Math.max(0, Math.floor(Number(startSec || 0) * buffer.sampleRate));
    const end = Math.min(buffer.length, Math.ceil((Number(startSec || 0) + Number(durationSec || 0)) * buffer.sampleRate));
    const frames = Math.max(1, end - start);
    const out = ensureAudioContext().createBuffer(buffer.numberOfChannels, frames, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      out.getChannelData(ch).set(buffer.getChannelData(ch).subarray(start, end));
    }
    return out;
  }

  async function prepareBuiltinBuffers() {
    if (builtinBuffers.length === TEN_HIT_VOICE_SEGMENTS.length) return builtinBuffers;
    if (builtinPreparePromise) return builtinPreparePromise;
    builtinPreparePromise = (async () => {
      const ctx = ensureAudioContext();
      const raw = decodeDataUriBytes(TEN_HIT_VOICE_SPRITE);
      const decoded = await ctx.decodeAudioData(raw.slice(0));
      builtinBuffers = TEN_HIT_VOICE_SEGMENTS.map(seg => sliceAudioBuffer(decoded, seg.offset, seg.duration));
      return builtinBuffers;
    })().catch(err => {
      builtinPreparePromise = null;
      console.warn('内蔵音声の準備に失敗しました', err);
      return [];
    });
    return builtinPreparePromise;
  }

  function duckMusic(ms) {
    if (typeof audio === 'undefined' || !audio || audio.paused) return;
    const previous = Number.isFinite(audio.volume) ? audio.volume : 1;
    audio.volume = Math.min(previous, 0.18);
    clearTimeout(restoreMusicTimer);
    restoreMusicTimer = setTimeout(() => {
      try { audio.volume = previous; } catch (_) {}
    }, Math.max(700, ms + 160));
  }

  async function playBuiltin(index) {
    const ctx = ensureAudioContext();
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
    const buffers = await prepareBuiltinBuffers();
    const buffer = buffers[index];
    if (!buffer) throw new Error('内蔵音声バッファがありません');

    try { builtinSource?.stop(); } catch (_) {}
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 1.25;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    builtinSource = source;
    duckMusic(Math.round(buffer.duration * 1000));
    source.start();
    source.onended = () => {
      if (builtinSource === source) builtinSource = null;
    };
  }

  const previousPlayManagedVoice = typeof playManagedVoice === 'function' ? playManagedVoice : null;
  playManagedVoice = async function(item) {
    if (item?.kind === 'builtin') {
      const index = Number(item.index ?? String(item.id || '').replace('builtin-', ''));
      try { await playBuiltin(index); } catch (e) { console.warn('内部音声の再生に失敗しました', e); }
      return;
    }
    return previousPlayManagedVoice ? previousPlayManagedVoice(item) : Promise.resolve();
  };

  playRandomTenHitVoice = async function() {
    const candidates = typeof getManagedVoiceCandidates === 'function' ? await getManagedVoiceCandidates() : [];
    if (!candidates.length) return;
    let pool = candidates;
    if (candidates.length > 1 && typeof lastManagedVoiceId !== 'undefined' && lastManagedVoiceId) {
      const filtered = candidates.filter(v => v.id !== lastManagedVoiceId);
      if (filtered.length) pool = filtered;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (typeof lastManagedVoiceId !== 'undefined') lastManagedVoiceId = item.id;
    return playManagedVoice(item);
  };

  // iOSではユーザー操作中にAudioContextを起こしておく必要があるため、
  // pointerdown時点で同期的にcontextを作成・resumeし、デコードも先行させます。
  document.addEventListener('pointerdown', () => {
    try {
      const ctx = ensureAudioContext();
      ctx.resume().catch(() => {});
      prepareBuiltinBuffers().catch(() => {});
    } catch (_) {}
  }, {capture:true});
})();
