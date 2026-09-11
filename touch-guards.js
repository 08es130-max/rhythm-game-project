(() => {
  const game = document.getElementById('game');
  if (!game) return;

  const isPlayScreen = () => document.body.classList.contains('playing-mode');

  // プレイ画面ではスクロール・ピンチ・スワイプ操作をゲーム操作として扱い、
  // ブラウザ側のパンやズームを起こさない。
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

  // iOS Safari のダブルタップ拡大対策。
  let lastTouchEnd = 0;
  game.addEventListener('touchend', (e) => {
    if (!isPlayScreen()) return;
    const now = Date.now();
    if (now - lastTouchEnd <= 350) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  game.addEventListener('contextmenu', (e) => {
    if (isPlayScreen()) e.preventDefault();
  });
})();
