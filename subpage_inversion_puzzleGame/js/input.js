const INPUT = (() => {
  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    isInitialized = true;
    document.addEventListener('keydown', handleKeydown);
    setupTouchControls();
  }

  function handleKeydown(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        GAME.movePlayer(0, -1);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        GAME.movePlayer(0, 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        GAME.movePlayer(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        GAME.movePlayer(1, 0);
        e.preventDefault();
        break;
      case ' ':
      case 'c':
      case 'C':
        GAME.changeColor();
        e.preventDefault();
        break;
      case 'z':
      case 'Z':
        GAME.undo();
        e.preventDefault();
        break;
      case 'r':
      case 'R':
        GAME.reset();
        e.preventDefault();
        break;
    }
  }

  function setupTouchControls() {
    const canvas = document.getElementById('game-canvas');
    let startX, startY;

    canvas.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const dx = endX - startX;
      const dy = endY - startY;

      const minSwipe = 30;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) {
          GAME.movePlayer(dx > 0 ? 1 : -1, 0);
        }
      } else {
        if (Math.abs(dy) > minSwipe) {
          GAME.movePlayer(0, dy > 0 ? 1 : -1);
        }
      }

      startX = null;
      startY = null;
      e.preventDefault();
    }, { passive: false });
  }

  return { init };
})();
