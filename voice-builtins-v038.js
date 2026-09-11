// Ver.0.3.8: convert sprite segments into standalone WAV blobs before HTMLAudio playback
(function(){
  const builtinUrlCache = new Map();
  let currentBuiltinAudio = null;
  let restoreMusicTimer = null;

  function writeString(view, offset, text) {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  }

  function audioBufferSegmentToWav(buffer, startSec, durationSec) {
    const sampleRate = buffer.sampleRate;
    const channels = Math.max(1, Math.min(2, buffer.numberOfChannels));
    const start = Math.max(0, Math.floor(startSec * sampleRate));
    const end = Math.min(buffer.length, Math.ceil((startSec + durationSec) * sampleRate));
    const frames = Math.max(1, end - start);
    const bytesPerSample = 2;
    const dataSize = frames * channels * bytesPerSample;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const source = Array.from({length: channels}, (_, ch) => buffer.getChannelData(ch));
    for (let i = 0; i < frames; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const s = Math.max(-1, Math.min(1, source[ch][start + i] || 0));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([ab], {type:'audio/wav'});
  }

  async function getBuiltinUrl(index) {
    if (builtinUrlCache.has(index)) return builtinUrlCache.get(index);
    const segment = TEN_HIT_VOICE_SEGMENTS[index];
    if (!segment) return null;
    const buffer = await preloadTenHitVoice();
    if (!buffer) return null;
    const blob = audioBufferSegmentToWav(buffer, segment.offset, segment.duration);
    const url = URL.createObjectURL(blob);
    builtinUrlCache.set(index, url);
    return url;
  }

  function duckMusic(ms) {
    if (typeof audio === 'undefined' || !audio || audio.paused) return;
    const previous = Number.isFinite(audio.volume) ? audio.volume : 1;
    audio.volume = Math.min(previous, 0.22);
    clearTimeout(restoreMusicTimer);
    restoreMusicTimer = setTimeout(() => {
      try { audio.volume = previous; } catch (_) {}
    }, Math.max(800, ms + 180));
  }

  async function playBuiltin(index) {
    const url = await getBuiltinUrl(index);
    if (!url) throw new Error('内蔵音声を作成できませんでした');
    try { currentBuiltinAudio?.pause(); } catch (_) {}
    const segment = TEN_HIT_VOICE_SEGMENTS[index];
    const el = new Audio(url);
    el.preload = 'auto';
    el.playsInline = true;
    el.volume = 1;
    currentBuiltinAudio = el;
    duckMusic(Math.round((segment?.duration || 2.5) * 1000));
    const p = el.play();
    el.onended = () => {
      if (currentBuiltinAudio === el) currentBuiltinAudio = null;
    };
    return p || Promise.resolve();
  }

  const previousPlayManagedVoice = typeof playManagedVoice === 'function' ? playManagedVoice : null;
  playManagedVoice = async function(item) {
    if (item?.kind === 'builtin') {
      const index = Number(item.index ?? String(item.id || '').replace('builtin-', ''));
      return playBuiltin(index).catch(e => console.warn('内部音声の再生に失敗しました', e));
    }
    return previousPlayManagedVoice ? previousPlayManagedVoice(item) : Promise.resolve();
  };

  playRandomTenHitVoice = async function() {
    const candidates = typeof getManagedVoiceCandidates === 'function'
      ? await getManagedVoiceCandidates()
      : [];
    if (!candidates.length) return;
    let pool = candidates;
    if (candidates.length > 1 && typeof lastManagedVoiceId !== 'undefined' && lastManagedVoiceId) {
      pool = candidates.filter(v => v.id !== lastManagedVoiceId);
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (typeof lastManagedVoiceId !== 'undefined') lastManagedVoiceId = item.id;
    return playManagedVoice(item);
  };

  // Prepare the decoded sprite on the first gesture, then create standalone WAVs lazily.
  document.addEventListener('pointerdown', () => {
    preloadTenHitVoice().catch(() => {});
  }, {once:true, capture:true});
})();
