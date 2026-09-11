const HOME_VERSION = window.APP_VERSION || '0.2.0';
const HOME_UPDATE_KEY = 'rhythmGame.lastSeenVersion';
const LANE_CHARACTER_KEY = 'rhythmGame.laneCharacters';

const screens = {
  home: document.getElementById('homeScreen'),
  live: document.getElementById('liveScreen'),
  settings: document.getElementById('settingsScreen'),
  characters: document.getElementById('characterScreen')
};

function showAppScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (el) el.hidden = key !== name;
  });
  if (name !== 'live') resultPanel.hidden = true;
  if (name === 'settings') refreshSettingsSummary();
  if (name === 'characters') renderCharacterSelectors();
  window.scrollTo({top: 0, behavior: 'auto'});
}
window.showAppScreen = showAppScreen;

const updateBanner = document.getElementById('updateBanner');
const updateNew = document.getElementById('updateNew');
if (updateBanner) {
  const seen = localStorage.getItem(HOME_UPDATE_KEY);
  if (seen !== HOME_VERSION) {
    updateBanner.classList.add('new');
    if (updateNew) updateNew.hidden = false;
  } else if (updateNew) {
    updateNew.hidden = true;
  }
  const markUpdateSeen = () => {
    localStorage.setItem(HOME_UPDATE_KEY, HOME_VERSION);
    updateBanner.classList.remove('new');
    if (updateNew) updateNew.hidden = true;
  };
  updateBanner.addEventListener('click', markUpdateSeen);
  updateBanner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') markUpdateSeen();
  });
}

function refreshSettingsSummary() {
  const timing = document.getElementById('timingCurrentValue');
  if (timing) timing.textContent = `${getSavedTimingOffset()} ms`;
  const speedSummary = document.getElementById('speedSummary');
  if (speedSummary) speedSummary.textContent = `${Number(speed.value).toFixed(1)}x`;
  const assistSummary = document.getElementById('assistSummary');
  if (assistSummary) assistSummary.textContent = isPerfectAssistEnabled() ? 'ON（PERFECT ±70ms）' : 'OFF（PERFECT ±45ms）';
}

speed.addEventListener('input', refreshSettingsSummary);
const assistEl = document.getElementById('perfectAssist');
assistEl?.addEventListener('change', refreshSettingsSummary);
document.getElementById('calibrationSaveBtn')?.addEventListener('click', () => queueMicrotask(refreshSettingsSummary));

function getSavedLaneCharacters() {
  const validIds = new Set((window.CHARACTER_LIBRARY || []).map(c => c.id));
  try {
    const parsed = JSON.parse(localStorage.getItem(LANE_CHARACTER_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.length === 9) {
      return parsed.map(id => validIds.has(id) ? id : 'default');
    }
  } catch (_) {}
  return Array.from({length: 9}, () => 'default');
}

function saveLaneCharacters(ids) {
  localStorage.setItem(LANE_CHARACTER_KEY, JSON.stringify(ids));
  applyLaneCharacters(ids);
}

function getCharacterById(id) {
  return (window.CHARACTER_LIBRARY || []).find(c => c.id === id) || (window.CHARACTER_LIBRARY || []).find(c => c.id === 'default') || (window.CHARACTER_LIBRARY || [])[0];
}

function applyLaneCharacters(ids = getSavedLaneCharacters()) {
  if (!Array.isArray(window.CHARACTER_LIBRARY) || !window.CHARACTER_LIBRARY.length) return;
  ids.forEach((id, i) => {
    const c = getCharacterById(id);
    if (c?.icon && typeof laneArtworks !== 'undefined') laneArtworks[i] = c.icon;
  });
  if (typeof layoutPlayfield === 'function') layoutPlayfield();
}

function buildOption(c, selected) {
  const option = document.createElement('option');
  option.value = c.id;
  option.textContent = c.name;
  option.selected = c.id === selected;
  return option;
}

function renderCharacterSelectors() {
  const grid = document.getElementById('characterGrid');
  if (!grid || !Array.isArray(window.CHARACTER_LIBRARY)) return;
  const saved = getSavedLaneCharacters();
  grid.innerHTML = '';
  saved.forEach((id, i) => {
    const c = getCharacterById(id);
    const card = document.createElement('div');
    card.className = 'lane-character-card';
    const title = document.createElement('div');
    title.className = 'lane-character-title';
    title.textContent = `レーン ${i + 1}`;
    const img = document.createElement('img');
    img.className = 'lane-character-preview';
    img.alt = `レーン ${i + 1} キャラ`;
    img.src = c?.icon || 'icon-192.png';
    img.onerror = () => { img.src = 'icon-192.png'; };
    const select = document.createElement('select');
    select.className = 'lane-character-select';
    select.dataset.lane = String(i);
    window.CHARACTER_LIBRARY.forEach(item => select.appendChild(buildOption(item, id)));
    select.addEventListener('change', () => {
      const selected = getCharacterById(select.value);
      img.src = selected?.icon || 'icon-192.png';
    });
    card.append(title, img, select);
    grid.appendChild(card);
  });
}

function collectLaneSelection() {
  return Array.from(document.querySelectorAll('.lane-character-select')).map(el => el.value);
}

document.getElementById('saveCharactersBtn')?.addEventListener('click', () => {
  const ids = collectLaneSelection();
  if (ids.length === 9) {
    saveLaneCharacters(ids);
    const status = document.getElementById('characterSaveStatus');
    if (status) status.textContent = 'この端末の9レーン設定として保存しました。';
  }
});

document.getElementById('sameCharacterBtn')?.addEventListener('click', () => {
  const first = document.querySelector('.lane-character-select');
  if (!first) return;
  document.querySelectorAll('.lane-character-select').forEach(el => {
    el.value = first.value;
    el.dispatchEvent(new Event('change'));
  });
});

function bindNav(id, screen) {
  document.getElementById(id)?.addEventListener('click', () => showAppScreen(screen));
}
bindNav('homeLiveBtn', 'live');
bindNav('homeSettingsBtn', 'settings');
bindNav('homeCharactersBtn', 'characters');
document.getElementById('homeTimingBtn')?.addEventListener('click', () => {
  showAppScreen('settings');
  showCalibration();
});

document.querySelectorAll('[data-home]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (playing) return;
    showAppScreen('home');
  });
});

document.getElementById('liveSettingsBtn')?.addEventListener('click', () => {
  if (!playing) showAppScreen('settings');
});

document.getElementById('resultHomeBtn')?.addEventListener('click', () => {
  resultPanel.hidden = true;
  exitMobilePlayMode();
  judgeEl.textContent = 'READY';
  showAppScreen('home');
});

calibrationBackBtn?.addEventListener('click', () => {
  queueMicrotask(() => showAppScreen('settings'));
});

const calibrationActions = document.querySelector('.calibration-actions');
if (calibrationActions && !document.getElementById('calibrationHomeBtn')) {
  const homeBtn = document.createElement('button');
  homeBtn.id = 'calibrationHomeBtn';
  homeBtn.className = 'calibration-back';
  homeBtn.type = 'button';
  homeBtn.textContent = 'ホームに戻る';
  homeBtn.addEventListener('click', () => {
    hideCalibration();
    showAppScreen('home');
  });
  calibrationActions.appendChild(homeBtn);
}

applyLaneCharacters();
refreshSettingsSummary();
showAppScreen('home');
