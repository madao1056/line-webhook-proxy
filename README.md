# LINE Webhook Proxy

LINEのWebhookを受信し、メインシステムに転送するシンプルなプロキシシステムです。

## 🚀 特徴

- LINEからのWebhookを受信し、メインシステムに自動転送
- 署名検証機能
- シンプルなVercel Functions実装
- 環境変数による柔軟な設定

## 📦 デプロイ済みURL

- **本番環境**: https://line-webhook-proxy-v2.vercel.app
- **ヘルスチェック**: https://line-webhook-proxy-v2.vercel.app/api/health

## 🔧 エンドポイント

### 1. Webhook受信
```
POST /api/webhook/{tenantId}
```
LINE公式アカウントからのWebhookを受信し、メインシステムに転送します。

### 2. ヘルスチェック
```
GET /api/health
```
システムの稼働状態を確認できます。

## 🛠️ セットアップ

### 環境変数

以下の環境変数をVercelで設定してください：

```env
# Supabase設定（オプション）
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

# 開発サーバーを起動
npm run dev
```

### デプロイ

```bash
# Vercelにデプロイ
vercel --prod
```

## 📝 使用方法

1. LINE Developersコンソールで、Webhook URLを以下に設定：
   ```
   https://line-webhook-proxy-v2.vercel.app/api/webhook/{あなたのテナントID}
   ```

2. プロキシは自動的にWebhookをメインシステムに転送します

## 🔒 セキュリティ

- LINE署名検証（開発環境ではスキップ可能）
- API Key認証（管理エンドポイント用）
- 環境変数による機密情報の管理

## 📄 ライセンス

MIT