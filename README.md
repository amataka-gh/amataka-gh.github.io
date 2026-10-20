# 自作アプリ ポートフォリオ

自作アプリ4作品を1枚のページで紹介する静的ポートフォリオサイトです。

## ライブサイト

- https://amataka-gh.github.io/

## 技術スタック

- HTML + CSS のみ（JavaScript・ビルドツール・CDN フォント不使用）
- レスポンシブ（モバイル対応）

## 内容

- トップページ: 軽い自己紹介・作品紹介
- iframe で埋め込み2作品（白黒反転パズルゲーム / 付箋メモ帳）
- スクリーンショット + Google Drive リンクで提示2作品（俯瞰型シューティングローグライク / Unreal Engine 製アプリ集）

## リポジトリ構成

- `index.html` / `style.css`: サイト本体
- `images/`: スクリーンショット
- `subpage_inversion_puzzleGame/`: パズルゲームのビルド成果物（iframe・読み取り専用）
- `subpage_StickyNote_To-Do_List/`: 付箋メモ帳のビルド成果物（iframe・読み取り専用）
