# LINE Webhook Proxy - クイックデプロイガイド

## 1. プロジェクトディレクトリに移動

```bash
cd /Users/hashiguchimasaki/project/line-webhook-proxy
```

## 2. デプロイスクリプトを実行

```bash
./deploy.sh
```

または手動で：

```bash
npm install
npm run build
vercel --prod
```

## 3. 環境変数の設定

Vercelダッシュボード (https://vercel.com) にアクセスして、以下の環境変数を設定：

- `SUPABASE_URL`: あなたのSupabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: サービスロールキー（重要：ANONキーではなく）
- `API_KEY`: セキュアなAPIキー（例: `openssl rand -hex 32`で生成）
- `SYSTEM_TOKEN`: システム連携トークン（例: `openssl rand -hex 32`で生成）
- `MAIN_SYSTEM_URL`: https://line-auto-reply.vercel.app

## 4. LINE Webhook URLの更新

LINE Developersコンソールで：

1. Messaging APIチャネルを選択
2. Webhook URLを以下に変更：
   ```
   https://line-webhook-proxy.vercel.app/webhook/{テナントID}
   ```
   例: `https://line-webhook-proxy.vercel.app/webhook/tenant123`

## 5. 動作確認

```bash
# ヘルスチェック
curl https://line-webhook-proxy.vercel.app/health

# APIヘルスチェック（API_KEY必要）
curl https://line-webhook-proxy.vercel.app/api/health \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## トラブルシューティング

### Vercel CLIがない場合
```bash
npm i -g vercel
```

### 初回デプロイ時の設定
- Scope: 自分のアカウントを選択
- Project Name: line-webhook-proxy
- Framework: Other
- Override settings: No