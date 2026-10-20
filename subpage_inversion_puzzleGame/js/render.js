const RENDER = (() => {
  let canvas, ctx;
  let cellSize = 40;
  let offsetX = 0;
  let offsetY = 0;

  const COLORS = {
    wall: '#444444',
    floor: '#f0f0f0',
    gridLine: '#dddddd',
    goalWhite: '#ffffff',
    goalBlack: '#333333',
    goalGray: '#888888',
    goalEdgeGray: '#555555',
    boxWhite: '#ffffff',
    boxBlack: '#333333',
    boxGray: '#aaaaaa',
    playerWhite: '#ffffff',
    playerBlack: '#333333',
    playerRiding: '#ff6600',
    glow: '#00ff00'
  };

  let gameStateRef = null;
  let currentWidth = 10;
  let currentHeight = 10;

  function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
  }

  function getViewportSize() {
    if (typeof visualViewport !== 'undefined' && visualViewport) {
      return { w: visualViewport.width, h: visualViewport.height };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function calcCellSize(width, height) {
    const vp = getViewportSize();
    const dPadMargin = vp.w <= 480 ? 0 : 70;
    const maxWidth = Math.min(vp.w - 80 - dPadMargin, 500);
    const maxHeight = Math.min(vp.h - 250, 500);
    let cs = Math.floor(Math.min(maxWidth / width, maxHeight / height));
    return Math.max(25, Math.min(50, cs));
  }

  function setLevelSize(width, height) {
    currentWidth = width;
    currentHeight = height;
    cellSize = calcCellSize(width, height);
    canvas.width = cellSize * currentWidth;
    canvas.height = cellSize * currentHeight;
    offsetX = 0;
    offsetY = 0;
  }

  function saveGameState(gs) {
    gameStateRef = gs;
  }

  function resize() {
    if (!canvas || !ctx) return;
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    cellSize = calcCellSize(currentWidth, currentHeight);
    canvas.width = cellSize * currentWidth;
    canvas.height = cellSize * currentHeight;
    if (canvas.width !== oldWidth || canvas.height !== oldHeight) {
      if (gameStateRef) draw(gameStateRef);
    } else if (gameStateRef) {
      draw(gameStateRef);
    }
  }

  window.addEventListener('resize', () => resize());
  if (typeof visualViewport !== 'undefined' && visualViewport) {
    visualViewport.addEventListener('resize', () => resize());
  }

  function draw(gameState) {
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.gridLine;

    drawFloors(gameState.level.grid, gameState.level.width, gameState.level.height);
    drawGrid(gameState.level.width, gameState.level.height);
    drawWalls(gameState.level.grid, gameState.level.width, gameState.level.height);
    drawGoals(gameState.level.goals, gameState.boxes);
    drawBoxes(gameState.boxes);
    drawPlayer(gameState.player);
    ctx.restore();
  }

  function drawGrid(width, height) {
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = offsetX + x * cellSize;
        const py = offsetY + y * cellSize;
        ctx.strokeStyle = COLORS.gridLine;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }
  }

  function drawWalls(grid, width, height) {
    ctx.fillStyle = COLORS.wall;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === 'wall') {
          const px = offsetX + x * cellSize;
          const py = offsetY + y * cellSize;
          // マス目一杯に全面塗り(連続した壁に見せる)
          ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  function drawFloors(grid, width, height) {
    ctx.fillStyle = COLORS.floor;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === 'floor') {
          const px = offsetX + x * cellSize;
          const py = offsetY + y * cellSize;
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }
    }
  }

  function drawGoals(goals, boxes) {
    goals.forEach(goal => {
      ctx.save();
      const px = offsetX + goal.x * cellSize + cellSize / 2;
      const py = offsetY + goal.y * cellSize + cellSize / 2;
      const radius = cellSize * 0.3;

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.closePath();

      const hasBox = boxes.some(b => b.x === goal.x && b.y === goal.y);
      if (hasBox) {
        ctx.fillStyle = COLORS.glow;
        ctx.fill();
      }

      ctx.strokeStyle = goal.color === 'white' ? COLORS.goalWhite :
        goal.color === 'black' ? COLORS.goalBlack : COLORS.goalGray;
      // 黒ゴールの太さを、白ゴールの縁込み(計6px)と同じにする
      ctx.lineWidth = goal.color === 'black' ? 6 : 3;
      ctx.stroke();

      // 白ゴールは床に溶け込むため、白リングの内外に細い濃灰縁を追加
      if (goal.color === 'white') {
        ctx.strokeStyle = COLORS.goalEdgeGray;
        ctx.lineWidth = 1;
        // 外側の細い縁
        ctx.beginPath();
        ctx.arc(px, py, radius + 2.5, 0, Math.PI * 2);
        ctx.stroke();
        // 内側の細い縁
        ctx.beginPath();
        ctx.arc(px, py, radius - 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawBoxes(boxes) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#888888';
    boxes.forEach(box => {
      const px = offsetX + box.x * cellSize;
      const py = offsetY + box.y * cellSize;
      // 大きさを2px小さく(中央揃えを維持)
      const size = cellSize - 6;

      ctx.fillStyle = box.color === 'white' ? COLORS.boxWhite :
        box.color === 'black' ? COLORS.boxBlack : COLORS.boxGray;
      ctx.fillRect(px + 3, py + 3, size, size);
      ctx.strokeRect(px + 3, py + 3, size, size);
    });
  }

  function drawPlayer(player) {
    ctx.save();
    const px = offsetX + player.x * cellSize + cellSize / 2;
    const py = offsetY + player.y * cellSize + cellSize / 2;
    const radius = cellSize * 0.35;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fillStyle = player.color === 'white' ? COLORS.playerWhite : COLORS.playerBlack;
    ctx.fill();

    ctx.strokeStyle = COLORS.playerRiding;
    ctx.lineWidth = player.ridingBoxId !== null ? 4 : 2;
    ctx.stroke();
    ctx.restore();
  }

  return {
    init,
    draw,
    setLevelSize,
    saveGameState,
    resize
  };
})();
