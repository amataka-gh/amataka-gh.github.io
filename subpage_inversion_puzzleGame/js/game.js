const GAME = (() => {
  let state = null;

  function loadLevel(levelIndex) {
    const levelData = LEVELS[levelIndex];
    if (!levelData) return false;
    return startLevel(levelData);
  }

  function loadLevelData(levelData) {
    if (!levelData) return false;
    return startLevel(levelData);
  }

  function startLevel(levelData) {

    state = {
      level: levelData,
      player: {
        x: levelData.player.x,
        y: levelData.player.y,
        color: levelData.player.color,
        ridingBoxId: null
      },
      boxes: levelData.boxes.map((b, i) => ({
        id: i,
        x: b.x,
        y: b.y,
        color: b.color
      })),
      history: [],
      currentTurn: 0,
      maxTurns: levelData.maxTurns,
      isClear: false
    };

    // 初期状態を保存
    saveState();
    RENDER.setLevelSize(levelData.width, levelData.height);
    UI.updateState(state);
    RENDER.saveGameState(state);
    RENDER.draw(state);
    return true;
  }

  // 現在の状態を履歴に保存
  function saveState() {
    state.history.push({
      player: { ...state.player },
      boxes: state.boxes.map(b => ({ ...b })),
      currentTurn: state.currentTurn
    });
  }

  // 1ターン前の状態に戻す
  function undo() {
    if (state.history.length <= 1) return false;
    state.history.pop();
    const prevState = state.history[state.history.length - 1];
    state.player = { ...prevState.player };
    state.boxes = prevState.boxes.map(b => ({ ...b }));
    state.currentTurn = prevState.currentTurn;
    state.isClear = false;
    UI.updateState(state);
    RENDER.saveGameState(state);
    RENDER.draw(state);
    return true;
  }

  // レベルを最初からやり直す
  function reset() {
    startLevel(state.level);
  }

  // プレイヤーの移動処理
  function movePlayer(dx, dy) {
    if (state.isClear) return false;

    // このターンで押された箱の id (リバーシの動いた箱優先チェック用)
    let movedBoxId = null;

    const newX = state.player.x + dx;
    const newY = state.player.y + dy;

    // 壁かチェック
    if (RULES.isWall(newX, newY, state.level.grid, state.level.width, state.level.height)) {
      return false;
    }

    // 同居中(荷物に乗っている)場合の処理
    if (state.player.ridingBoxId !== null) {
      // 同居中の荷物を除く他の荷物リスト
      const otherBoxes = state.boxes.filter(b => b.id !== state.player.ridingBoxId);
      const boxAtTarget = RULES.getBoxAt(newX, newY, otherBoxes);

      if (boxAtTarget) {
        // 移動先に別な荷物がある場合
        if (RULES.canRide(boxAtTarget.color, state.player.color)) {
          // 新しい荷物に同居し直す
          state.player.ridingBoxId = boxAtTarget.id;
          state.player.x = newX;
          state.player.y = newY;
        } else if (RULES.canPush(boxAtTarget.color, state.player.color)) {
          // 押し込める荷物
          const pushX = newX + dx;
          const pushY = newY + dy;
          if (!RULES.canMoveTo(pushX, pushY, state.level.grid, state.level.width, state.level.height, otherBoxes)) {
            return false;
          }
          state.boxes[boxAtTarget.id].x = pushX;
          state.boxes[boxAtTarget.id].y = pushY;
          movedBoxId = boxAtTarget.id;
          // 同居を離れて移動
          state.player.ridingBoxId = null;
          state.player.x = newX;
          state.player.y = newY;
        } else {
          return false;
        }
      } else {
        // 移動先に何もなければ同居を離れて移動
        state.player.ridingBoxId = null;
        state.player.x = newX;
        state.player.y = newY;
      }
    } else {
      // 同居中でない普通の移動処理
      const boxAtTarget = RULES.getBoxAt(newX, newY, state.boxes);

      if (boxAtTarget) {
        if (RULES.canRide(boxAtTarget.color, state.player.color)) {
          // 同色の荷物に同居
          state.player.ridingBoxId = boxAtTarget.id;
          state.player.x = newX;
          state.player.y = newY;
        } else if (RULES.canPush(boxAtTarget.color, state.player.color)) {
          // 押せる色の荷物を PUSH
          const pushX = newX + dx;
          const pushY = newY + dy;
          if (!RULES.canMoveTo(pushX, pushY, state.level.grid, state.level.width, state.level.height,
              state.boxes.filter(b => b.id !== boxAtTarget.id))) {
            return false;
          }
          state.boxes[boxAtTarget.id].x = pushX;
          state.boxes[boxAtTarget.id].y = pushY;
          movedBoxId = boxAtTarget.id;
          state.player.x = newX;
          state.player.y = newY;
        } else {
          return false;
        }
      } else {
        state.player.x = newX;
        state.player.y = newY;
      }
    }

    // ターンを消費して状態を保存
    state.currentTurn++;
    saveState();

    // リバーシ処理(挟みによる色変化)。動いた箱が優先して判定される
    const reversiResult = RULES.applyReversi(state.boxes, state.level.width, state.level.height, movedBoxId);
    if (reversiResult.changed) {
      state.boxes = reversiResult.boxes;
    }

    // UI更新と描画
    UI.updateState(state);
    RENDER.saveGameState(state);
    RENDER.draw(state);

    // クリア判定 (ターン数超過では終了しない: maxTurns は目標値)
    if (RULES.checkClear(state.boxes, state.level.goals)) {
      state.isClear = true;
      UI.showMessage('クリア!', `目標ターン: ${state.currentTurn}/${state.maxTurns}`, [
        { text: '次のレベル', action: () => { UI.hideMessage(); nextLevel(); } },
        { text: 'レベル選択', action: () => { UI.hideMessage(); UI.showLevelSelect(); } }
      ]);
    }

    return true;
  }

  // プレイヤーの色変化
  function changeColor() {
    if (state.isClear) return false;
    // 同居中は色変化できない
    if (state.player.ridingBoxId !== null) return false;

    state.player.color = state.player.color === 'white' ? 'black' : 'white';
    state.currentTurn++;
    saveState();

    // リバーシ処理
    const reversiResult = RULES.applyReversi(state.boxes, state.level.width, state.level.height);
    if (reversiResult.changed) {
      state.boxes = reversiResult.boxes;
    }

    UI.updateState(state);
    RENDER.saveGameState(state);
    RENDER.draw(state);

    return true;
  }

  // 次のレベルに進む
  function nextLevel() {
    const currentIndex = LEVELS.findIndex(l => l.id === state.level.id);
    if (currentIndex < LEVELS.length - 1) {
      loadLevel(currentIndex + 1);
    } else {
      UI.showMessage('おめでとう!', 'すべてのレベルをクリアしました！', [
        { text: 'レベル選択', action: () => { UI.hideMessage(); UI.showLevelSelect(); } }
      ]);
    }
  }

  return {
    loadLevel,
    loadLevelData,
    movePlayer,
    changeColor,
    undo,
    reset,
    nextLevel,
    getState: () => state
  };
})();
