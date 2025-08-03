# LINE Webhook Proxy

LINEのWebhookを受信し、複数のエンドポイントに転送するプロキシシステムです。

## 🚀 特徴

- **マルチテナント対応** - 複数のLINE公式アカウントに対応
- **自動転送** - メインシステムへの自動転送
- **並列転送** - 複数のエンドポイントへ同時転送
- **リトライ機能** - 失敗時の自動リトライ（最大3回）
- **管理UI** - Web画面でエンドポイントを管理
- **ログ機能** - 転送履歴の記録と確認

## 📦 デプロイ済みURL

- **本番環境**: https://line-webhook-proxy-v2.vercel.app
- **管理画面**: https://line-webhook-proxy-v2.vercel.app/dashboard.html
- **ヘルスチェック**: https://line-webhook-proxy-v2.vercel.app/api/health

## 🔧 エンドポイント

### 1. Webhook受信
```
POST /api/webhook/{tenantId}
```
LINE公式アカウントからのWebhookを受信し、登録されたエンドポイントに転送します。

### 2. 管理API

#### エンドポイント管理
```
GET    /api/endpoints?tenantId={tenantId}  # 一覧取得
POST   /api/endpoints                       # 追加
PUT    /api/endpoints?id={id}               # 更新
DELETE /api/endpoints?id={id}               # 削除
```

#### ログ取得
```
GET /api/logs?tenantId={tenantId}&limit=50&status=success
```

### 3. ヘルスチェック
```
GET /api/health
```

## 🛠️ セットアップ

### 環境変数

Vercelで以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API認証
API_KEY=your_api_key

# メインシステムURL（デフォルト: https://line-auto-reply.vercel.app）
MAIN_SYSTEM_URL=https://your-main-system.vercel.app
```

### ローカル開発

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動（ポート3001）
npm run dev

# ビルド
npm run build
```

### デプロイ

```bash
# Vercelにデプロイ
vercel --prod
```

## 📝 使用方法

### 1. LINE Developersでの設定

LINE Developersコンソールで、Webhook URLを以下に設定：
```
https://line-webhook-proxy-v2.vercel.app/api/webhook/{テナントID}
```

例: `https://line-webhook-proxy-v2.vercel.app/api/webhook/tenant123`

### 2. 管理画面での設定

1. 管理画面にアクセス: https://line-webhook-proxy-v2.vercel.app/dashboard.html
2. APIキーを入力（初回のみ）
3. テナントIDを入力して「読み込み」
4. 「新規追加」ボタンでエンドポイントを追加

### 3. 動作確認

管理画面の「テスト送信」タブから、テストWebhookを送信して動作を確認できます。

## 🏗️ アーキテクチャ

```
LINE Platform
    ↓
Webhook Proxy (/api/webhook/{tenantId})
    ├→ メインシステム（自動転送）
    ├→ エンドポイント1
    ├→ エンドポイント2
    └→ エンドポイントN（並列転送）
```

## 📊 管理画面の機能

- **エンドポイント管理**
  - 追加・削除・有効/無効の切り替え
  - 優先度設定（0-100）
  - カスタムヘッダーの設定

- **ログビューアー**
  - 転送成功/失敗の確認
  - レスポンスタイムの表示
  - フィルタリング機能

- **テスト機能**
  - メッセージ/フォロー/アンフォローイベントのテスト
  - カスタムメッセージの送信

## 🔒 セキュリティ

- **LINE署名検証** - X-Line-Signatureヘッダーの検証
- **API認証** - Bearer tokenによる管理API保護
- **環境変数** - 機密情報の安全な管理

## 📂 プロジェクト構造

```
line-webhook-proxy/
├── api/
│   ├── _utils/           # 共通ユーティリティ
│   │   ├── auth.js       # 認証
│   │   ├── logger.js     # ロギング
│   │   ├── response.js   # レスポンス
│   │   └── supabase.js   # DB接続
│   ├── webhook/
│   │   └── [tenantId].js # Webhook受信
│   ├── endpoints.js      # エンドポイント管理
│   ├── logs.js           # ログAPI
│   └── health.js         # ヘルスチェック
├── public/
│   ├── index.html        # ホームページ
│   └── dashboard.html    # 管理画面
├── supabase/
│   └── migrations/       # DBスキーマ
├── package.json
├── vercel.json
└── README.md
```

## 🐛 トラブルシューティング

### 環境変数エラー
- Vercelダッシュボードで環境変数が正しく設定されているか確認
- デプロイ後、環境変数を追加した場合は再デプロイが必要

### 転送エラー
- エンドポイントURLが正しいか確認
- エンドポイントが有効になっているか確認
- ログで詳細なエラー内容を確認

### 認証エラー
- APIキーが正しく設定されているか確認
- AuthorizationヘッダーにBearerトークンが含まれているか確認

## 📄 ライセンス

MIT

## 🤝 コントリビューション

Issue や Pull Request は歓迎します！

---

Built with ❤️ using Vercel Functions