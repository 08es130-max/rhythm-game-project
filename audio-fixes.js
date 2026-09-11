// Ver.0.3.4: lower tap latency and force an audible 10-hit voice path
(function(){
  const TAP_SKIP_SECONDS = 0.020;
  let duckTimer = null;
  let reliableSuccessCount = 0;
  let reliableLastVoiceIndex = -1;
  let reliableVoiceSource = null;

  playTapSound = function() {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    const buffer = useDeviceCustomTap && customTapBuffer ? customTapBuffer : boostedTapBuffer;
    if (!buffer) {
      prepareBoostedTapSound().catch(() => {});
      return;
    }
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    gain.gain.value = useDeviceCustomTap ? 1.15 : 1.55;
    source.connect(gain).connect(audioCtx.destination);
    const skip = Math.min(TAP_SKIP_SECONDS, Math.max(0, buffer.duration - 0.02));
    source.start(0, skip);
  };

  async function playReliableBuiltinVoice() {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume().catch(() => {});
    const buffer = await preloadTenHitVoice().catch(() => null);
    if (!buffer || !TEN_HIT_VOICE_SEGMENTS?.length) return;

    let enabledIndexes = TEN_HIT_VOICE_SEGMENTS.map((_, i) => i);
    try {
      if (typeof getEnabledManagedVoiceIds === 'function') {
        const enabled = getEnabledManagedVoiceIds();
        const filtered = enabledIndexes.filter(i => enabled.has(`builtin-${i}`));
        if (filtered.length) enabledIndexes = filtered;
      }
    } catch (_) {}

    let pool = enabledIndexes.filter(i => i !== reliableLastVoiceIndex);
    if (!pool.length) pool = enabledIndexes;
    const index = pool[Math.floor(Math.random() * pool.length)];
    reliableLastVoiceIndex = index;
    const segment = TEN_HIT_VOICE_SEGMENTS[index];

    try { reliableVoiceSource?.stop(); } catch (_) {}
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    source.buffer = buffer;
    gain.gain.value = 3.2;
    compressor.threshold.value = -16;
    compressor.knee.value = 8;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.001;
    compressor.release.value = 0.12;
    source.connect(gain).connect(compressor).connect(audioCtx.destination);

    if (typeof audio !== 'undefined' && audio && !audio.paused) {
      const previousVolume = Number.isFinite(audio.volume) ? audio.volume : 1;
      audio.volume = Math.min(previousVolume, 0.24);
      clearTimeout(duckTimer);
      duckTimer = setTimeout(() => {
        try { audio.volume = previousVolume; } catch (_) {}
      }, Math.max(700, segment.duration * 1000 + 180));
    }

    source.start(0, segment.offset, segment.duration);
    reliableVoiceSource = source;
    source.onended = () => {
      if (reliableVoiceSource === source) reliableVoiceSource = null;
    };
  }

  // Disable the older ten-hit trigger and replace it with one counter at the final registerHit layer.
  playRandomTenHitVoice = function() {};
  const baseRegisterHit = registerHit;
  registerHit = function(note, grade) {
    const wasAvailable = !note.hit && !note.missRegistered;
    baseRegisterHit(note, grade);
    if (!wasAvailable || !note.hit) return;
    reliableSuccessCount += 1;
    if (reliableSuccessCount % 10 === 0) playReliableBuiltinVoice().catch(() => {});
  };

  const baseResetGame = resetGame;
  resetGame = function() {
    reliableSuccessCount = 0;
    reliableLastVoiceIndex = -1;
    baseResetGame();
  };

  const warmAudio = () => {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().catch(() => {});
    prepareBoostedTapSound().catch(() => {});
    preloadTenHitVoice().catch(() => {});
  };
  document.addEventListener('pointerdown', warmAudio, {once:true, capture:true});
  document.addEventListener('keydown', warmAudio, {once:true, capture:true});
})();
