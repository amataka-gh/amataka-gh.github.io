// levels/manifest.json 経由で外部レベルJSONを動的に読み込むモジュール
const LEVEL_LOADER = (() => {
  const MANIFEST_PATH = 'levels/manifest.json';

  async function fetchManifest() {
    try {
      const response = await fetch(`${MANIFEST_PATH}?nocache=${Date.now()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('[LEVEL_LOADER] manifest.json の読み込みに失敗しました（既存レベルのみで動作続行）');
      return null;
    }
  }

  async function fetchLevelFile(fileName) {
    try {
      const response = await fetch(`levels/${fileName}?nocache=${Date.now()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn(`[LEVEL_LOADER] ${fileName} の読み込みに失敗しました`);
      return null;
    }
  }

  function validateLevelData(data) {
    // 基本的なプロパティの存在チェック
    if (!data || typeof data.id !== 'number') return false;
    if (!data.name || typeof data.name !== 'string') return false;
    if (!data.width || !data.height || !data.maxTurns) return false;
    if (!Array.isArray(data.grid) || data.grid.length === 0) return false;
    if (!data.player || data.player.x === undefined || data.player.y === undefined) return false;
    if (!Array.isArray(data.boxes) || !Array.isArray(data.goals)) return false;

    // グリッドの次元チェック
    if (data.grid.length !== data.height) return false;
    for (let y = 0; y < data.height; y++) {
      if (!Array.isArray(data.grid[y]) || data.grid[y].length !== data.width) return false;
    }

    // プレイヤーの座標範囲チェック
    if (data.player.x < 0 || data.player.x >= data.width || data.player.y < 0 || data.player.y >= data.height) return false;

    // 色の検証
    const validColors = ['white', 'black', 'gray'];
    if (!validColors.includes(data.player.color)) return false;

    // 箱の座標と色チェック
    for (const box of data.boxes) {
      if (box.x < 0 || box.x >= data.width || box.y < 0 || box.y >= data.height) return false;
      if (!validColors.includes(box.color)) return false;
    }

    // ゴールの座標と色チェック
    for (const goal of data.goals) {
      if (goal.x < 0 || goal.x >= data.width || goal.y < 0 || goal.y >= data.height) return false;
      if (goal.color !== 'white' && goal.color !== 'black') return false;
    }

    return true;
  }

  function isDuplicateId(id) {
    return LEVELS.some(l => l.id === id);
  }

  async function loadExternalLevels() {
    const manifest = await fetchManifest();
    if (!manifest || !Array.isArray(manifest.levels)) {
      console.info('[LEVEL_LOADER] manifest.json がないか空です。インラインレベルのみで動作します。');
      return;
    }

    const loaded = [];
    for (const fileName of manifest.levels) {
      const data = await fetchLevelFile(fileName);
      if (!data) continue;

      if (!validateLevelData(data)) {
        console.warn(`[LEVEL_LOADER] ${fileName} の形式が無効なためスキップしました`);
        continue;
      }

      data.boxes = data.boxes.map((b, i) => (b.id !== undefined ? b : { id: i, ...b }));

      if (isDuplicateId(data.id)) {
        console.warn(`[LEVEL_LOADER] id=${data.id} のレベルは既に存在するためスキップしました (${fileName})`);
        continue;
      }

      LEVELS.push(data);
      loaded.push(data.id);
    }

    LEVELS.sort((a, b) => a.id - b.id);

    if (loaded.length > 0) {
      console.info(`[LEVEL_LOADER] 外部レベル ${loaded.length} 個を読み込みました (id: ${loaded.join(', ')})`);
    }
  }

  // AI追加レベルのマニフェストを読み込む
  // 形式: { "frozen": boolean, "months": { "YYYY年M月": ["DD", ...] } }
  // frozen: true 時は UI が「AI生成追加レベル」ボタンを完全隠蔽する(一時凍結用)
  async function fetchAiLevelManifest() {
    try {
      const response = await fetch(`levels/ai-levels-manifest.json?nocache=${Date.now()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('[LEVEL_LOADER] ai-levels-manifest.json の読み込みに失敗しました');
      return null;
    }
  }

  // AI追加レベルのJSONをフェッチして返す
  async function fetchAiLevel(month, day) {
    try {
      const response = await fetch(`levels/${month}/${day}.json?nocache=${Date.now()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn(`[LEVEL_LOADER] levels/${month}/${day}.json の読み込みに失敗しました`);
      return null;
    }
  }

  return {
    loadExternalLevels,
    validateLevelData,
    fetchLevelFile,
    fetchAiLevelManifest,
    fetchAiLevel
  };
})();
