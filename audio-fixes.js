// Ver.0.3.3: reduce tap latency and make 10-hit voices clearly audible over music
(function(){
  const TAP_SKIP_SECONDS = 0.012;
  let duckTimer = null;

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
    const compressor = audioCtx.createDynamicsCompressor();
    source.buffer = buffer;
    gain.gain.value = useDeviceCustomTap ? 1.15 : 1.5;
    compressor.threshold.value = -10;
    compressor.knee.value = 8;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.001;
    compressor.release.value = 0.06;
    source.connect(gain).connect(compressor).connect(audioCtx.destination);
    const skip = Math.min(TAP_SKIP_SECONDS, Math.max(0, buffer.duration - 0.02));
    source.start(0, skip);
  };

  playManagedVoice = async function(item) {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume().catch(() => {});
    try { currentManagedVoiceSource?.stop(); } catch (_) {}

    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    gain.gain.value = 2.25;
    compressor.threshold.value = -12;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.12;

    let duration = 2.5;
    if (item.kind === 'builtin') {
      const buffer = await preloadTenHitVoice();
      if (!buffer) return;
      source.buffer = buffer;
      duration = item.segment.duration;
      source.connect(gain).connect(compressor).connect(audioCtx.destination);
      source.start(0, item.segment.offset, item.segment.duration);
    } else {
      source.buffer = await decodeManagedLocalVoice(item);
      duration = source.buffer.duration;
      source.connect(gain).connect(compressor).connect(audioCtx.destination);
      source.start();
    }

    // Music is an HTMLAudioElement, so briefly duck it while a voice plays.
    if (typeof audio !== 'undefined' && audio && !audio.paused) {
      const previousVolume = Number.isFinite(audio.volume) ? audio.volume : 1;
      audio.volume = Math.min(previousVolume, 0.38);
      clearTimeout(duckTimer);
      duckTimer = setTimeout(() => {
        try { audio.volume = previousVolume; } catch (_) {}
      }, Math.max(500, duration * 1000 + 120));
    }

    currentManagedVoiceSource = source;
    source.onended = () => {
      if (currentManagedVoiceSource === source) currentManagedVoiceSource = null;
    };
  };

  // Warm both buffers as early as iOS permits, and resume the context on the first gesture.
  const warmAudio = () => {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().catch(() => {});
    prepareBoostedTapSound().catch(() => {});
    preloadTenHitVoice().catch(() => {});
  };
  document.addEventListener('pointerdown', warmAudio, {once:true, capture:true});
  document.addEventListener('keydown', warmAudio, {once:true, capture:true});
})();
