(() => {
  const game = document.getElementById('game');
  if (!game) return;

  const isPlayScreen = () => document.body.classList.contains('playing-mode');

  // Keep browser gestures disabled during play, but do not suppress touchend.
  // Repeated touchend preventDefault on iOS can interfere with rapid same-position taps.
  game.style.touchAction = 'none';

  game.addEventListener('touchmove', (e) => {
    if (isPlayScreen()) e.preventDefault();
  }, { passive: false });

  game.addEventListener('gesturestart', (e) => {
    if (isPlayScreen()) e.preventDefault();
  }, { passive: false });
  game.addEventListener('gesturechange', (e) => {
    if (isPlayScreen()) e.preventDefault();
  }, { passive: false });
  game.addEventListener('gestureend', (e) => {
    if (isPlayScreen()) e.preventDefault();
  }, { passive: false });

  game.addEventListener('dblclick', (e) => {
    if (isPlayScreen()) e.preventDefault();
  });

  game.addEventListener('contextmenu', (e) => {
    if (isPlayScreen()) e.preventDefault();
  });
})();
