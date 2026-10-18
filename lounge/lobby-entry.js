// Redirect the EXISTING lounge button to the new 2D lounge.
// Capture phase prevents legacy 3D lounge handlers from opening.
(() => {
  'use strict';
  const target = new URL('lounge/index.html?v=0.8.306', document.baseURI).href;
  function enter(e) {
    const button = e.target?.closest?.('#homeInteractionBtn');
    if (!button) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location.assign(target);
  }
  window.addEventListener('click', enter, true);
  window.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!e.target?.matches?.('#homeInteractionBtn')) return;
    enter(e);
  }, true);
})();