#!/bin/bash

# LINE Webhook Proxy テストスクリプト

echo "🧪 LINE Webhook Proxy テスト開始"
echo "================================"

# テナントIDを設定（実際の値に変更してください）
TENANT_ID="tenant123"
PROXY_URL="https://line-webhook-proxy-v2.vercel.app/api/webhook/$TENANT_ID"

echo "📍 プロキシURL: $PROXY_URL"
echo ""

# テストデータ
TEST_DATA='{
  "destination": "U1234567890abcdef",
  "events": [{
    "type": "message",
    "timestamp": 1234567890123,
    "source": {
      "type": "user",
      "userId": "U1234567890abcdef"
    },
    "replyToken": "test-reply-token",
    "message": {
      "type": "text",
      "id": "test-message-id",
      "text": "エルメ転送テスト"
    }
  }]
}'

echo "📤 テストWebhookを送信中..."
echo ""

# curlでリクエスト送信
RESPONSE=$(curl -s -X POST "$PROXY_URL" \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d "$TEST_DATA")

echo "📥 レスポンス:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# 結果の解析
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo "✅ プロキシは正常に動作しています"
  
  # 転送結果の詳細を表示
  TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
  SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[0-9]*' | grep -o '[0-9]*')
  FAILURE=$(echo "$RESPONSE" | grep -o '"failure":[0-9]*' | grep -o '[0-9]*')
  
  echo ""
  echo "📊 転送結果:"
  echo "  - 転送先合計: $TOTAL"
  echo "  - 成功: $SUCCESS"
  echo "  - 失敗: $FAILURE"
  
  if [ "$TOTAL" -gt 1 ]; then
    echo ""
    echo "✅ エルメへの転送が有効になっています！"
  else
    echo ""
    echo "⚠️  エルメへの転送が設定されていない可能性があります"
    echo "   管理画面でエンドポイントが有効になっているか確認してください"
  fi
else
  echo "❌ エラーが発生しました"
fi

echo ""
echo "================================"
echo "💡 ヒント:"
echo "- Vercelのログで詳細を確認: https://vercel.com/dashboard"
echo "- 管理画面でプロキシ設定を確認: https://line-auto-reply.vercel.app/settings/proxy"