const UI = (() => {
  const turnDisplay = document.getElementById('turn-display');
  const colorDisplay = document.getElementById('color-display');
  const levelGrid = document.getElementById('level-grid');
  const messageOverlay = document.getElementById('message-overlay');
  const messageTitle = document.getElementById('message-title');
  const messageText = document.getElementById('message-text');
  const messageButtons = document.getElementById('message-buttons');
  const levelSelectDiv = document.getElementById('level-select');

  // AI追加レベルのナビゲーション状態
  // 'idle' = 標準レベル画面, 'months' = 年月一覧, 'days' = 日数一覧
  let aiNavState = 'idle';
  let aiManifest = null;
  let aiCurrentMonth = null;
  // 凍結フラグ (ai-levels-manifest.json の frozen)。
  // デフォルト true = マニフェスト未取得・取得失敗時はボタンを隠蔽する側で安全を取る
  let aiFrozen = true;

  // AI追加レベルのマニフェストをキャッシュから取得、なければフェッチして凍結状態を確定させる
  async function ensureAiManifest() {
    if (!aiManifest) {
      aiManifest = await LEVEL_LOADER.fetchAiLevelManifest();
    }
    if (aiManifest) {
      // frozen フィールドが無ければ(旧形式のマニフェスト)解除扱い
      aiFrozen = !!aiManifest.frozen;
    } else {
      // マニフェストを読み込めなかった場合は隠蔽側に安全を取る
      aiFrozen = true;
    }
  }

  async function init() {
    setupButtons();
    await ensureAiManifest();
    buildLevelGrid();
    showLevelSelect();
  }

  function setupButtons() {
    const btnColor = document.getElementById('btn-color-change');
    if (btnColor) btnColor.addEventListener('click', () => GAME.changeColor());

    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) btnUndo.addEventListener('click', () => GAME.undo());

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => GAME.reset());

    const btnLevel = document.getElementById('btn-level-select');
    if (btnLevel) btnLevel.addEventListener('click', () => UI.showLevelSelect());
  }

  function buildLevelGrid() {
    if (!levelGrid) return;
    levelGrid.replaceChildren();
    LEVELS.forEach((level, index) => {
      const btn = document.createElement('button');
      btn.className = 'level-button';
      btn.textContent = `${level.id}`;
      btn.addEventListener('click', () => {
        hideLevelSelect();
        GAME.loadLevel(index);
      });
      levelGrid.appendChild(btn);
    });

    // 追加AIレベルボタン (凍結中は完全隠蔽)
    if (!aiFrozen) {
      const aiBtn = document.createElement('button');
      aiBtn.className = 'level-button ai-level-btn';
      aiBtn.textContent = 'AI生成追加レベル';
      aiBtn.addEventListener('click', () => {
        aiNavState = 'months';
        buildAiMonths();
      });
      levelGrid.appendChild(aiBtn);
    }
  }

  // AI追加レベルの年月一覧を表示
  async function buildAiMonths() {
    if (!levelGrid) return;
    levelGrid.replaceChildren();

    // マニフェストをキャッシュから取得、なければfetch
    if (!aiManifest) {
      aiManifest = await LEVEL_LOADER.fetchAiLevelManifest();
    }

    if (!aiManifest || !aiManifest.months) {
      const p = document.createElement('p');
      p.style.color = '#bdc3c7';
      p.textContent = '追加レベルがありません';
      levelGrid.appendChild(p);
      return;
    }

    const months = Object.keys(aiManifest.months);
    months.forEach(month => {
      const btn = document.createElement('button');
      btn.className = 'level-button ai-month-btn';
      btn.textContent = month;
      btn.addEventListener('click', () => {
        aiCurrentMonth = month;
        aiNavState = 'days';
        buildAiDays(month);
      });
      levelGrid.appendChild(btn);
    });

    // 戻るボタン
    const backBtn = document.createElement('button');
    backBtn.className = 'level-button back-btn';
    backBtn.textContent = '← 戻る';
    backBtn.addEventListener('click', () => {
      aiNavState = 'idle';
      buildLevelGrid();
    });
    levelGrid.appendChild(backBtn);
  }

  // 指定月の日数一覧を表示
  function buildAiDays(month) {
    if (!levelGrid) return;
    levelGrid.replaceChildren();

    if (!aiManifest || !aiManifest.months[month]) {
      const p = document.createElement('p');
      p.style.color = '#bdc3c7';
      p.textContent = 'レベルがありません';
      levelGrid.appendChild(p);
      return;
    }

    const days = aiManifest.months[month];
    days.forEach(day => {
      const btn = document.createElement('button');
      btn.className = 'level-button ai-day-btn';
      btn.textContent = day;
      btn.addEventListener('click', () => {
        loadAiLevel(month, day);
      });
      levelGrid.appendChild(btn);
    });

    // 戻るボタン
    const backBtn = document.createElement('button');
    backBtn.className = 'level-button back-btn';
    backBtn.textContent = '← 戻る';
    backBtn.addEventListener('click', () => {
      aiNavState = 'months';
      buildAiMonths();
    });
    levelGrid.appendChild(backBtn);
  }

  // AI追加レベルを読み込んで開始
  async function loadAiLevel(month, day) {
    // 防御ガード: 凍結中は古いキャッシュ・直接呼び出しからでも開けない
    if (aiFrozen) return;
    const data = await LEVEL_LOADER.fetchAiLevel(month, day);
    if (!data) {
      showMessage('エラー', `レベルの読み込みに失敗しました (levels/${month}/${day}.json)`, [
        { text: '閉じる', action: () => { UI.hideMessage(); } }
      ]);
      return;
    }

    if (!LEVEL_LOADER.validateLevelData(data)) {
      showMessage('エラー', 'レベルデータの形式が無効です', [
        { text: '閉じる', action: () => { UI.hideMessage(); } }
      ]);
      return;
    }

    hideLevelSelect();
    GAME.loadLevelData(data);
  }

  function refreshLevelSelect() {
    if (levelSelectDiv && !levelSelectDiv.classList.contains('hidden')) {
      buildLevelGrid();
    }
  }

  function updateState(state) {
    if (turnDisplay) turnDisplay.textContent = `目標ターン: ${state.currentTurn}/${state.maxTurns}`;
    if (colorDisplay) colorDisplay.textContent = `色: ${state.player.color === 'white' ? '○白' : '●黒'}`;
  }

  async function showLevelSelect() {
    aiNavState = 'idle';
    await ensureAiManifest();
    buildLevelGrid();
    hideMessage();
    if (levelSelectDiv) levelSelectDiv.classList.remove('hidden');
  }

  function hideLevelSelect() {
    if (levelSelectDiv) levelSelectDiv.classList.add('hidden');
  }

  function showMessage(title, text, buttons) {
    if (messageTitle) messageTitle.textContent = title;
    if (messageText) messageText.textContent = text;
    if (messageButtons) {
      messageButtons.replaceChildren();
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.addEventListener('click', btn.action);
        messageButtons.appendChild(button);
      });
    }
    if (messageOverlay) messageOverlay.classList.remove('hidden');
  }

  function hideMessage() {
    if (messageOverlay) messageOverlay.classList.add('hidden');
  }

  return {
    init,
    setupButtons,
    updateState,
    showLevelSelect,
    hideLevelSelect,
    showMessage,
    hideMessage,
    refreshLevelSelect,
    buildLevelGrid
  };
})();
