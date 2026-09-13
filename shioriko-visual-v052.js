// Ver.0.5.8
// Shioriko visual switching: use full-image swaps instead of overlay.
// This avoids size mismatch, clipping, and double-head artifacts.

(function () {
  const MODE_KEY = 'rhythmGame.shiorikoDialogueMode.v1';
  const MIX_STATE_KEY = 'rhythmGame.shiorikoNormalVisualState.v1';
  const VALID = ['normal', 'dere', 'yandere', 'scold', 'drunk', 'clumsy', 'casual'];
  const APP_VERSION = window.APP_VERSION || '0.5.8';

  const ART = {
    normal: `assets/standing/shioriko-home.png?v=${APP_VERSION}`,
    dere: `assets/shioriko-expressions/dere-v058.png?v=${APP_VERSION}`,
    yandere: `assets/shioriko-expressions/yandere-v058.png?v=${APP_VERSION}`,
    scold: `assets/shioriko-expressions/scold-v058.png?v=${APP_VERSION}`,
    drunk: `assets/shioriko-expressions/drunk-v058.png?v=${APP_VERSION}`,
    clumsy: `assets/shioriko-expressions/clumsy-v058.png?v=${APP_VERSION}`,
    casual: `assets/shioriko-expressions/casual-v058.png?v=${APP_VERSION}`,
  };

  function getCard() {
    return document.querySelector('.home-character-card');
  }

  function getImage() {
    return document.querySelector('.home-character-card .home-character-img');
  }

  function getCurrentMode() {
    const raw = localStorage.getItem(MODE_KEY) || 'normal';
    return VALID.includes(raw) ? raw : 'normal';
  }

  function getMixedState() {
    const raw = localStorage.getItem(MIX_STATE_KEY) || 'normal';
    return VALID.includes(raw) ? raw : 'normal';
  }

  function setMixedState(mode) {
    localStorage.setItem(MIX_STATE_KEY, mode);
  }

  function resolveVisualMode(mode) {
    if (mode !== 'normal') return mode;
    return getMixedState();
  }

  function applyStandingArt(mode) {
    const img = getImage();
    const card = getCard();
    if (!img || !card) return;

    const visualMode = resolveVisualMode(mode);
    const src = ART[visualMode] || ART.normal;

    img.src = src;
    img.dataset.expressionMode = visualMode;

    // overlay remnants are not used anymore
    const overlay = card.querySelector('.shio-expression-overlay');
    if (overlay) overlay.remove();

    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center bottom';
    img.style.transform = 'none';
    img.style.filter = 'none';
  }

  function chooseNormalVariant() {
    const r = Math.random();
    if (r < 0.10) return 'dere';
    if (r < 0.20) return 'clumsy';
    return 'normal';
  }

  function updateForDialogue() {
    const mode = getCurrentMode();
    if (mode === 'normal') {
      const variant = chooseNormalVariant();
      setMixedState(variant);
      applyStandingArt('normal');
    } else {
      setMixedState(mode);
      applyStandingArt(mode);
    }
  }

  function syncFromModeOnly() {
    const mode = getCurrentMode();
    if (mode === 'normal') {
      setMixedState('normal');
      applyStandingArt('normal');
    } else {
      setMixedState(mode);
      applyStandingArt(mode);
    }
  }

  function hookDialogueChanges() {
    const bubble = document.querySelector('.home-message, .home-dialogue, .home-speech, .home-balloon');
    if (!bubble) return;

    const observer = new MutationObserver(() => {
      updateForDialogue();
    });
    observer.observe(bubble, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function hookModeChanges() {
    window.addEventListener('storage', (e) => {
      if (e.key === MODE_KEY) {
        syncFromModeOnly();
      }
    });

    document.addEventListener('shioriko-mode-changed', () => {
      syncFromModeOnly();
    });
  }

  function hookCharacterTap() {
    const card = getCard();
    if (!card) return;
    card.addEventListener('click', () => {
      setTimeout(() => updateForDialogue(), 0);
    });
  }

  function init() {
    syncFromModeOnly();
    hookDialogueChanges();
    hookModeChanges();
    hookCharacterTap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose for manual refresh if needed
  window.refreshShiorikoStandingArt = updateForDialogue;
})();
