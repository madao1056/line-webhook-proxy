#!/bin/bash

# LINE Webhook Proxy Deployment Script

echo "🚀 LINE Webhook Proxy - Vercelデプロイスクリプト"
echo "=========================================="
echo ""

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# TypeScriptのビルド
echo "🔨 TypeScriptをビルド中..."
npm run build

# Vercelへのデプロイ
echo "☁️  Vercelにデプロイ中..."
vercel --prod

echo ""
echo "✅ デプロイが完了しました！"
echo ""
echo "次のステップ:"
echo "1. Vercelダッシュボードで環境変数を設定してください"
echo "2. LINE Developersコンソールで新しいWebhook URLを設定してください"
echo "3. プロキシエンドポイントを管理画面から登録してください"