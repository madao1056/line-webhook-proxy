# LINE Webhook Proxy System デプロイ手順

## 前提条件

- Node.js 18以上
- Supabaseプロジェクト（サービスロールキーが必要）
- Vercelアカウント（推奨）またはその他のホスティングサービス

## Vercelへのデプロイ手順

### 1. Vercel CLIのインストール

```bash
npm i -g vercel
```

### 2. プロジェクトディレクトリに移動

```bash
cd /Users/hashiguchimasaki/project/line-webhook-proxy
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. Vercelにデプロイ

```bash
vercel
```

初回デプロイ時の設定:
- Scope: 自分のアカウントを選択
- Link to existing project?: No（新規プロジェクトの場合）
- Project Name: line-webhook-proxy
- Framework: Other
- Build Command: npm run build
- Output Directory: dist
- Override settings?: No

### 5. 環境変数の設定

Vercelダッシュボードから以下の環境変数を設定:

```
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NODE_ENV=production
LOG_LEVEL=info
MAIN_SYSTEM_URL=https://line-auto-reply.vercel.app
API_KEY=generate_secure_api_key_here
SYSTEM_TOKEN=generate_secure_system_token_here
SKIP_SIGNATURE_VERIFICATION=false
```

### 6. 再デプロイ

環境変数設定後、再デプロイ:

```bash
vercel --prod
```

## その他のホスティングサービスへのデプロイ

### Heroku

1. Heroku CLIのインストール
2. `heroku create line-webhook-proxy`
3. 環境変数の設定: `heroku config:set KEY=value`
4. デプロイ: `git push heroku main`

### Railway

1. Railwayにサインイン
2. New Project → Deploy from GitHub
3. 環境変数をRailway UIから設定
4. 自動デプロイが開始

### VPS（PM2使用）

1. サーバーにSSH接続
2. プロジェクトをクローン
3. `npm install`
4. `npm run build`
5. PM2でプロセス管理:

```bash
pm2 start dist/index.js --name "line-webhook-proxy"
pm2 save
pm2 startup
```

## デプロイ後の確認

1. ヘルスチェック: `https://your-domain/health`
2. API動作確認: `https://your-domain/api/health`（API_KEY必要）
3. Supabaseで`proxy_endpoints`テーブルに接続確認

## LINE Webhookの設定

1. LINE Developersコンソールにログイン
2. 各Messaging APIチャネルのWebhook URLを以下に変更:
   ```
   https://your-proxy-domain/webhook/{tenant_id}
   ```
3. Webhook利用を有効化

## トラブルシューティング

### Supabase接続エラー

- SERVICE_ROLE_KEYが正しく設定されているか確認
- Supabase URLが正しいか確認
- RLSポリシーがservice roleを許可しているか確認

### 署名検証エラー

- LINE Channel Secretが正しく設定されているか確認
- 開発環境では`SKIP_SIGNATURE_VERIFICATION=true`で一時的に無効化可能

### レート制限エラー

- 環境変数でレート制限を調整可能
- 本番環境ではRedisの使用を推奨