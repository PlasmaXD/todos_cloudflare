# Cloudflare Workers Todo App

## 概要

Cloudflare Workers と Workers KV を活用した、エッジで動作するシンプルな Todo アプリケーションです。サーバーレス環境で CRUD 操作を実装し、HTML での UI 表示と JSON API の両方を提供します。

## 特徴

* **エッジ実行**: Cloudflare のエッジネットワーク上で高速に動作
* **永続化**: Workers KV を用いたデータ保存
* **シングルファイル実装**: `src/index.js` 1 ファイルで完結
* **UI+API**: HTML レンダリングに加え、JSON API も提供

## ディレクトリ構成

```
todos/
├── src/
│   └── index.js        # メイン Worker スクリプト
├── wrangler.jsonc      # Wrangler 設定ファイル
└── README.md           # このファイル
```

## 前提条件

* Node.js (v16 以上)
* Wrangler CLI (v4.x)
* Cloudflare アカウント
* Workers KV ネームスペースを作成済み

## セットアップ

1. リポジトリをクローンまたはダウンロード
2. 依存パッケージをインストール

   ```bash
   npm install
   ```
3. `wrangler.jsonc` に KV ネームスペースの ID を設定

   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "todos",
     "main": "src/index.js",
     "compatibility_date": "2025-05-04",
     "kv_namespaces": [
       {
         "binding": "TODOS",
         "id": "<YOUR_KV_NAMESPACE_ID>"
       }
     ]
   }
   ```

   * `<YOUR_KV_NAMESPACE_ID>` は Cloudflare ダッシュボードの **Workers & KV → KV Namespaces** から取得します。

## ローカル開発

以下のコマンドでローカル開発サーバーを起動し、`http://localhost:8787` で動作確認できます。

```bash
npx wrangler dev
```

## デプロイ

Cloudflare 環境へデプロイするには次のコマンドを実行します。

```bash
npx wrangler deploy
```

## API エンドポイント

| メソッド   | パス               | 説明              |
| ------ | ---------------- | --------------- |
| POST   | `/api/todos`     | 新規 Todo の作成     |
| GET    | `/api/todos`     | Todo 一覧取得(JSON) |
| PUT    | `/api/todos/:id` | 完了状態のトグル        |
| DELETE | `/api/todos/:id` | Todo の削除        |
| GET    | `/`              | HTML レンダリング     |
