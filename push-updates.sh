#!/bin/bash

echo "🚀 LINE Webhook Proxy 更新スクリプト"
echo "===================================="
echo ""

# 現在のディレクトリを確認
echo "📍 現在のディレクトリ: $(pwd)"
echo ""

# プロキシディレクトリに移動
cd /Users/hashiguchimasaki/project/line-webhook-proxy

# Gitの初期化（まだの場合）
if [ ! -d .git ]; then
    echo "📦 Gitリポジトリを初期化中..."
    git init
    git remote add origin https://github.com/yourusername/line-webhook-proxy.git
else
    echo "✅ Gitリポジトリは既に初期化されています"
fi

# 変更をステージング
echo ""
echo "📝 変更をステージング中..."
git add -A

# コミット
echo ""
echo "💾 変更をコミット中..."
git commit -m "feat: Supabaseからエンドポイントを取得して転送する機能を追加

- proxy_endpointsテーブルからエンドポイントを動的に取得
- メインシステムとエルメなどの外部システムへ並列転送
- 転送ログをSupabaseに保存
- リトライとタイムアウトの実装"

# プッシュ
echo ""
echo "📤 GitHubにプッシュ中..."
git push -u origin main || git push -u origin master

echo ""
echo "✅ 更新が完了しました！"
echo ""
echo "🔄 Vercelが自動的にデプロイを開始します"
echo "   進捗確認: https://vercel.com/dashboard"
echo ""
echo "⏱️  デプロイ完了まで1-2分お待ちください"