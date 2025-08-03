# プロキシシステム更新手順

## 🔧 更新内容
エルメなどの外部システムへの転送機能を追加しました。

## 📦 デプロイ手順

### 1. ターミナルで以下を実行

```bash
cd /Users/hashiguchimasaki/project/line-webhook-proxy
```

### 2. Gitの初期設定（初回のみ）

```bash
git init
git add .
git commit -m "feat: 外部エンドポイントへの転送機能を追加"
```

### 3. GitHubリポジトリの作成（初回のみ）

```bash
# GitHub CLIを使用する場合
gh repo create line-webhook-proxy --public --source=. --remote=origin --push

# または手動でGitHubでリポジトリを作成後
git remote add origin https://github.com/yourusername/line-webhook-proxy.git
git push -u origin main
```

### 4. Vercelと連携

1. Vercelダッシュボード（https://vercel.com）にアクセス
2. 「Import Git Repository」をクリック
3. 作成したGitHubリポジトリを選択
4. 環境変数は既に設定済みなので、そのままデプロイ

### 5. 更新の確認

デプロイ完了後、Vercelのログで以下を確認：
- エンドポイントの取得成功
- エルメへの転送成功

## 🔍 動作確認

```bash
# テストWebhookを送信
curl -X POST "https://line-webhook-proxy-v2.vercel.app/api/webhook/tenant123" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test" \
  -d '{
    "events": [{
      "type": "message",
      "timestamp": 1234567890,
      "source": {"type": "user", "userId": "U1234567890"},
      "message": {"type": "text", "text": "テストメッセージ"}
    }]
  }'
```

期待される応答：
```json
{
  "status": "ok",
  "proxied": true,
  "results": {
    "total": 2,  // メインシステム + エルメ
    "success": 2,
    "failure": 0
  }
}
```

## 📝 トラブルシューティング

### エンドポイントが見つからない場合
- Vercelの環境変数でSUPABASE_SERVICE_ROLE_KEYが正しく設定されているか確認
- テナントIDが正しいか確認（管理画面で使用しているものと同じ）

### 転送が失敗する場合
- Vercelのログで詳細なエラーメッセージを確認
- エルメのWebhook URLが正しいか確認
- エルメ側でWebhookを受信できる状態か確認