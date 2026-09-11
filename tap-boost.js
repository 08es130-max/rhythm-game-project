// Ver.0.2.7: louder built-in tap sound
const BOOSTED_TAP_DATA = 'data:audio/mpeg;base64,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';
let boostedTapBuffer = null;
let useDeviceCustomTap = false;

async function prepareBoostedTapSound() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  try {
    const saved = await getSavedTapSound();
    useDeviceCustomTap = !!saved?.blob;
    if (useDeviceCustomTap) {
      if (!customTapBuffer) await decodeTapSoundBlob(saved.blob);
      return customTapBuffer;
    }
  } catch (_) {}
  if (boostedTapBuffer) return boostedTapBuffer;
  const res = await fetch(BOOSTED_TAP_DATA);
  const ab = await res.arrayBuffer();
  boostedTapBuffer = await audioCtx.decodeAudioData(ab.slice(0));
  return boostedTapBuffer;
}

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
  gain.gain.value = useDeviceCustomTap ? 1.05 : 1.35;
  compressor.threshold.value = -8;
  compressor.knee.value = 6;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.001;
  compressor.release.value = 0.08;
  source.connect(gain).connect(compressor).connect(audioCtx.destination);
  source.start();
};

document.addEventListener('change', (event) => {
  if (event.target?.id !== 'tapSoundFile') return;
  const file = event.target.files?.[0];
  if (!file) return;
  useDeviceCustomTap = true;
  decodeTapSoundBlob(file).catch(() => {});
}, true);

document.addEventListener('pointerdown', () => { prepareBoostedTapSound().catch(() => {}); }, {once:true, capture:true});
prepareBoostedTapSound().catch(() => {});
