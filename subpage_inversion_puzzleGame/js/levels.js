// レベル定義データ (全10レベル)
// 各レベルはA*ソルバー(ゲーム実装と同じルール)で最短解を検証済み
// 形式: ai-level-prompt.md 参照 (0始まり座標、grid[y][x]、外周は壁)
const LEVELS = [
  {
    id: 1,
    name: "レベル1 - 初めの押し",
    width: 6,
    height: 6,
    maxTurns: 10,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 1, y: 2, color: "white" },
    boxes: [{ x: 3, y: 2, color: "gray" }],
    goals: [{ x: 4, y: 2, color: "white" }]
  },
  {
    id: 2,
    name: "レベル2 - 色を変えて押す",
    width: 6,
    height: 6,
    maxTurns: 10,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 1, y: 2, color: "white" },
    boxes: [{ x: 3, y: 2, color: "white" }],
    goals: [{ x: 4, y: 2, color: "white" }]
  },
  {
    id: 3,
    name: "レベル3 - グレーの万能",
    width: 7,
    height: 7,
    maxTurns: 18,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 3, y: 1, color: "white" },
    boxes: [
      { x: 3, y: 3, color: "black" },
      { x: 4, y: 3, color: "gray" }
    ],
    goals: [
      { x: 3, y: 5, color: "white" },
      { x: 4, y: 5, color: "black" }
    ]
  },
  {
    id: 4,
    name: "レベル4 - 挟み反転入門",
    width: 7,
    height: 7,
    maxTurns: 20,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 3, y: 1, color: "white" },
    boxes: [
      { x: 4, y: 2, color: "white" },
      { x: 2, y: 3, color: "black" },
      { x: 4, y: 4, color: "white" }
    ],
    goals: [
      { x: 5, y: 2, color: "white" },
      { x: 5, y: 3, color: "white" },
      { x: 5, y: 4, color: "white" }
    ]
  },
  {
    id: 5,
    name: "レベル5 - プレイヤーと箱の同居",
    width: 8,
    height: 8,
    maxTurns: 16,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 1, y: 1, color: "white" },
    boxes: [
      { x: 2, y: 2, color: "black" },
      { x: 2, y: 3, color: "black" },
      { x: 2, y: 4, color: "black" },
      { x: 3, y: 2, color: "black" },
      { x: 3, y: 4, color: "black" },
      { x: 4, y: 3, color: "white" }
    ],
    goals: [
      { x: 3, y: 6, color: "black" },
      { x: 6, y: 3, color: "white" }
    ]
  },
  {
    "id": 6,
    "name": "レベル6 - 侵入",
    "width": 7,
    "height": 7,
    "maxTurns": 20,
    "grid": [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "floor", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    "player": { "x": 3, "y": 1, "color": "white" },
    "boxes": [
      { "x": 3, "y": 3, "color": "black" },
      { "x": 2, "y": 4, "color": "white" },
      { "x": 4, "y": 4, "color": "white" }
    ],
    "goals": [
      { "x": 3, "y": 5, "color": "black" }
    ]
  },
  {
    id: 7,
    name: "レベル7 - 二色の道",
    width: 8,
    height: 8,
    maxTurns: 25,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 2, y: 1, color: "white" },
    boxes: [
      { x: 2, y: 3, color: "black" },
      { x: 5, y: 3, color: "white" },
      { x: 1, y: 4, color: "white" },
      { x: 3, y: 4, color: "white" },
      { x: 4, y: 4, color: "black" },
      { x: 6, y: 4, color: "black" }
    ],
    goals: [
      { x: 2, y: 6, color: "black" },
      { x: 5, y: 6, color: "white" }
    ]
  },
  {
    id: 8,
    name: "レベル8 - 壁と入り口",
    "width": 8,
    "height": 8,
    "maxTurns": 40,
    "grid": [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "wall", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "wall", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "wall", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "wall", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "wall", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    "player": { "x": 1, "y": 1, "color": "white" },
    "boxes": [
      { "x": 3, "y": 2, "color": "white" },
      { "x": 3, "y": 3, "color": "black" },
      { "x": 6, "y": 3, "color": "white" }
    ],
    "goals": [
      { "x": 6, "y": 4, "color": "white" },
      { "x": 5, "y": 5, "color": "white" },
      { "x": 6, "y": 5, "color": "white" }
    ]
  },
  {
    id: 9,
    name: "レベル9",
    width: 9,
    height: 9,
    maxTurns: 23,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 2, y: 2, color: "white" },
    boxes: [
      { x: 3, y: 2, color: "white" },
      { x: 2, y: 3, color: "white" },
      { x: 4, y: 3, color: "white" },
      { x: 3, y: 4, color: "white" },
      { x: 4, y: 4, color: "black" }
    ],
    goals: [
      { x: 6, y: 3, color: "white" },
      { x: 3, y: 6, color: "white" },
      { x: 6, y: 6, color: "white" }
    ]
  },
  {
    id: 10,
    name: "レベル10",
    width: 9,
    height: 7,
    maxTurns: 30,
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    player: { x: 4, y: 5, color: "white" },
    boxes: [
      { x: 4, y: 1, color: "white" },
      { x: 1, y: 2, color: "white" },
      { x: 3, y: 2, color: "white" },
      { x: 5, y: 2, color: "white" },
      { x: 7, y: 2, color: "white" },
      { x: 2, y: 3, color: "black" },
      { x: 6, y: 3, color: "black" }
    ],
    goals: [
      { x: 2, y: 1, color: "black" },
      { x: 3, y: 1, color: "white" },
      { x: 5, y: 1, color: "white" },
      { x: 6, y: 1, color: "black" }
    ]
  }
];
