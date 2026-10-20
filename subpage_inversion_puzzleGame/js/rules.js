const RULES = (() => {
  function canPush(boxColor, playerColor) {
    if (boxColor === 'gray') return true;
    return boxColor !== playerColor;
  }

  function canRide(boxColor, playerColor) {
    return boxColor === playerColor;
  }

  function getBoxAt(x, y, boxes) {
    return boxes.find(b => b.x === x && b.y === y);
  }

  function getGoalAt(x, y, goals) {
    return goals.find(g => g.x === x && g.y === y);
  }

  function isWall(x, y, grid, width, height) {
    if (x < 0 || x >= width || y < 0 || y >= height) return true;
    return grid[y][x] === 'wall';
  }

  function canMoveTo(x, y, grid, width, height, boxes) {
    if (isWall(x, y, grid, width, height)) return false;
    const box = getBoxAt(x, y, boxes);
    if (!box) return true;
    return false;
  }

  // 動いた箱の挟まれチェック
  // 同一軸の両隣接箱が同色 k(箱自身の色と異なる)なら、動いた箱自身を k に反転
  // 判定順序: 横(左右) → 縦(上下)。最初に成立した軸のみ採用
  function applyMovedBoxFlip(boxes, movedBoxId) {
    const box = boxes.find(b => b.id === movedBoxId);
    if (!box) return false;

    const axes = [[1, 0], [0, 1]];
    for (const [dx, dy] of axes) {
      const neg = boxes.find(b => b.x === box.x - dx && b.y === box.y - dy);
      const pos = boxes.find(b => b.x === box.x + dx && b.y === box.y + dy);
      if (!neg || !pos) continue;
      if (neg.color === pos.color && neg.color !== box.color) {
        box.color = neg.color;
        return true;
      }
    }
    return false;
  }

  // リバーシ反転を適用
  // movedBoxId: そのアクションで押された箱の id を渡すと、通常スキャン前にその箱の挟まれチェックを最優先で実行
  function applyReversi(boxes, width, height, movedBoxId = null) {
    const directions = [
      [1, 0], [-1, 0],
      [0, 1], [0, -1]
    ];

    let hasChanges = true;
    let firstPass = true;
    let currentBoxes = boxes.map(b => ({ ...b }));
    const originalColors = boxes.map(b => b.color);

    while (hasChanges) {
      hasChanges = false;
      const newBoxes = currentBoxes.map(b => ({ ...b }));

      // 動いた箱の優先チェック(最初のパスでのみ実行)
      if (firstPass && movedBoxId !== null && movedBoxId !== undefined) {
        if (applyMovedBoxFlip(newBoxes, movedBoxId)) {
          hasChanges = true;
        }
      }
      firstPass = false;

      for (const [dx, dy] of directions) {
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const startBox = newBoxes.find(b => b.x === x && b.y === y);
            if (!startBox) continue;

            let cx = x + dx;
            let cy = y + dy;
            const between = [];

            while (cx >= 0 && cx < width && cy >= 0 && cy < height) {
              const betweenBox = newBoxes.find(b => b.x === cx && b.y === cy);
              if (!betweenBox) break;

              if (betweenBox.color === startBox.color && between.length > 0) {
                for (const b of between) {
                  const idx = newBoxes.findIndex(nb => nb.id === b.id);
                  if (idx !== -1 && newBoxes[idx].color !== startBox.color) {
                    newBoxes[idx].color = startBox.color;
                    hasChanges = true;
                  }
                }
                break;
              }

              between.push(betweenBox);
              cx += dx;
              cy += dy;
            }
          }
        }
      }

      currentBoxes = newBoxes;
    }

    const changed = currentBoxes.some((b, i) => b.color !== originalColors[i]);
    return { boxes: currentBoxes, changed };
  }

  function checkClear(boxes, goals) {
    return goals.every(goal => {
      const box = getBoxAt(goal.x, goal.y, boxes);
      if (!box) return false;
      if (box.color === 'gray') return true;
      return box.color === goal.color;
    });
  }

  return {
    canPush,
    canRide,
    getBoxAt,
    getGoalAt,
    isWall,
    canMoveTo,
    applyReversi,
    checkClear
  };
})();
