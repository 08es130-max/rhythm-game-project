(() => {
  const game = document.getElementById('game');
  if (!game) return;

  const isPlayScreen = () => document.body.classList.contains('playing-mode');

  // Pointer Events handle live input. Prevent browser pan/zoom declaratively
  // instead of cancelling every legacy touch event on iOS.
  game.style.touchAction = 'none';
  game.style.webkitUserSelect = 'none';
  game.style.userSelect = 'none';
  game.style.webkitTouchCallout = 'none';

  // Keep only the Safari gesture guards that are still useful for pinch/zoom.
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
