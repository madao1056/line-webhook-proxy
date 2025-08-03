# Requirements Document

## Introduction

LINE Webhook Proxyは、LINE公式アカウントのWebhookを受信し、複数のエンドポイントに並行転送するプロキシサービスです。これにより、1つのLINE公式アカウントで複数のサービス（エルメ、独自ボット等）を同時に利用可能にします。高いパフォーマンス、信頼性、セキュリティを備えた本格的なプロダクションレディなサービスを目指します。

## Requirements

### Requirement 1

**User Story:** As a LINE公式アカウント管理者, I want Webhookを複数のサービスに同時転送したい, so that 1つのアカウントで複数のサービスを並行利用できる

#### Acceptance Criteria

1. WHEN LINE PlatformからWebhookが送信される THEN システムSHALL 設定された全てのエンドポイントに並行転送する
2. WHEN 転送処理が実行される THEN システムSHALL 5秒以内にLINE Platformに200レスポンスを返す
3. WHEN 1つのエンドポイントが遅延する THEN システムSHALL 他のエンドポイントの転送に影響を与えない
4. WHEN アカウントIDが指定される THEN システムSHALL そのアカウント専用の転送設定を使用する

### Requirement 2

**User Story:** As a システム管理者, I want 転送先エンドポイントを動的に設定・管理したい, so that サービス構成の変更に柔軟に対応できる

#### Acceptance Criteria

1. WHEN API経由で転送設定を更新する THEN システムSHALL リアルタイムで設定を反映する
2. WHEN エンドポイント設定を取得する THEN システムSHALL 現在の有効な設定を返す
3. WHEN エンドポイントを無効化する THEN システムSHALL そのエンドポイントへの転送を停止する
4. WHEN 転送設定にカスタムヘッダーが含まれる THEN システムSHALL 指定されたヘッダーを付与して転送する

### Requirement 3

**User Story:** As a システム運用者, I want 転送の履歴とエラーを監視したい, so that システムの健全性を把握し問題を早期発見できる

#### Acceptance Criteria

1. WHEN Webhook転送が実行される THEN システムSHALL 転送履歴をSupabaseに記録する
2. WHEN 転送が失敗する THEN システムSHALL エラー詳細とレスポンスタイムを記録する
3. WHEN ログ取得APIが呼ばれる THEN システムSHALL 指定期間・ステータスでフィルタされたログを返す
4. WHEN システムメトリクスが要求される THEN システムSHALL Prometheus形式でメトリクスを公開する

### Requirement 4

**User Story:** As a セキュリティ担当者, I want 不正なリクエストを防ぎたい, so that システムの安全性を確保できる

#### Acceptance Criteria

1. WHEN LINE PlatformからWebhookを受信する THEN システムSHALL LINE署名検証を必須で実行する
2. WHEN API呼び出しが行われる THEN システムSHALL 有効なAPIキーによる認証を要求する
3. WHEN レート制限を超えるリクエストが来る THEN システムSHALL 429ステータスでリクエストを拒否する
4. WHEN 通信が行われる THEN システムSHALL HTTPS通信のみを許可する

### Requirement 5

**User Story:** As a システム管理者, I want 転送失敗時の自動復旧機能が欲しい, so that 一時的な障害でデータを失わない

#### Acceptance Criteria

1. WHEN エンドポイントへの転送が失敗する THEN システムSHALL 指数バックオフでリトライを実行する
2. WHEN リトライ回数が上限に達する THEN システムSHALL イベントをDead Letter Queueに送信する
3. WHEN ネットワークタイムアウトが発生する THEN システムSHALL 設定されたタイムアウト値で処理を中断する
4. WHEN システムが復旧する THEN システムSHALL Dead Letter Queueからイベントを再処理する

### Requirement 6

**User Story:** As a 開発者, I want システムの状態を監視できる, so that 運用時の問題を迅速に対応できる

#### Acceptance Criteria

1. WHEN ヘルスチェックエンドポイントが呼ばれる THEN システムSHALL Supabase・Redis接続状態を含む健全性を返す
2. WHEN システムが起動する THEN システムSHALL 設定の妥当性を検証して起動可否を判断する
3. WHEN 設定が変更される THEN システムSHALL ホットリロードで新しい設定を適用する
4. WHEN Vercel環境でデプロイされる THEN システムSHALL サーバーレス環境に最適化された構成で動作する

### Requirement 7

**User Story:** As a システム管理者, I want 高いパフォーマンスを維持したい, so that 大量のWebhookリクエストに対応できる

#### Acceptance Criteria

1. WHEN 1アカウントあたり100req/秒のリクエストが来る THEN システムSHALL 正常に処理する
2. WHEN 設定情報が頻繁にアクセスされる THEN システムSHALL Redisキャッシュで高速応答する
3. WHEN 並行転送処理が実行される THEN システムSHALL 非同期処理で効率的に実行する
4. WHEN Supabaseアクセスが発生する THEN システムSHALL 効率的なクエリとコネクション管理で最適化する

### Requirement 8

**User Story:** As a 事業運営者, I want 運用コストを把握し収益性を確保したい, so that 持続可能なサービス運営ができる

#### Acceptance Criteria

1. WHEN 月間100万イベントまでの利用がある THEN システムSHALL Vercel Pro($20) + Supabase Pro($25)の固定費約¥6,700で運用できる
2. WHEN イベント数が上限を超過する THEN システムSHALL 従量課金(Edge $2/1M, Functions $0.60/1M)で対応する
3. WHEN プライシングモデルを設計する THEN システムSHALL イベント数とエンドポイント数をベースとした階層プランを提供する
4. WHEN 原価計算を行う THEN システムSHALL 原価の3-6倍の価格設定で採算性を確保する