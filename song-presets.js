const spicaPresetBtn = document.getElementById('spicaPresetBtn');

async function loadBuiltInChart(path, fallbackTitle) {
  try {
    const response = await fetch(`${path}?v=${window.APP_VERSION}&t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    validateChart(parsed);
    chart = parsed;
    chartName.textContent = parsed.title || fallbackTitle || path;
    offsetInput.value = String(getSavedTimingOffset());
    canStart();
    return parsed;
  } catch (e) {
    alert('内蔵譜面を読み込めませんでした: ' + e.message);
    return null;
  }
}

spicaPresetBtn?.addEventListener('click', async () => {
  const parsed = await loadBuiltInChart('charts/spica-terrible.json', 'スピカテリブル');
  if (!parsed) return;
  audioMode.value = 'file';
  if (!audio.src) {
    songName.textContent = 'スピカテリブル（音源ファイルを選択してください）';
    audioFile.click();
  } else {
    songName.textContent = audioFile.files?.[0]?.name || 'スピカテリブル';
  }
  canStart();
});
