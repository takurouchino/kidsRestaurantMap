# キッズレストラン検索アプリ

お子様と一緒に楽しめるレストランを簡単に見つけることができるWebアプリケーションです。

## 機能

- 📍 地域別レストラン検索
- 🍴 キッズメニューの詳細表示
- 🗺️ Google Maps連携
- 📝 検索履歴機能
- 👶 子供向け設備情報

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **データベース**: Supabase
- **UI**: Tailwind CSS + Shadcn/ui
- **地図**: Google Maps API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが利用できます。

## デプロイ

このプロジェクトは AWS Amplify での自動デプロイに対応しています。

## ライセンス

MIT License
