window.addEventListener('load', async () => {
  await LEVEL_LOADER.loadExternalLevels();
  console.log('[MAIN] 読み込み後 LEVELS 数:', LEVELS.length, LEVELS.map(l => l.id).join(', '));

  const canvas = document.getElementById('game-canvas');
  RENDER.init(canvas);
  UI.init();
  INPUT.init();
  setupDPad();
  showHelpForDevice();
});

// 十字キーボタンの操作設定
function setupDPad() {
  const dirMap = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  document.querySelectorAll('.d-pad-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    const move = dirMap[dir];
    if (!move) return;
    const doMove = (e) => { e.preventDefault(); GAME.movePlayer(move[0], move[1]); };
    btn.addEventListener('pointerdown', doMove);
  });
}

// デバイスに応じた操作方法表示
function showHelpForDevice() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  document.getElementById('help-pc').classList.toggle('hidden', isMobile);
  document.getElementById('help-mobile').classList.toggle('hidden', !isMobile);
}
