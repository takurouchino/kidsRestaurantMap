/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番環境での最適化設定
  typescript: {
    // 型エラーがある場合でもビルドを続行（本番前に修正推奨）
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLintエラーがある場合でもビルドを続行（本番前に修正推奨）
    ignoreDuringBuilds: false,
  },
  // 画像最適化の設定
  images: {
    // 外部画像ドメインの許可（必要に応じて）
    domains: [
      'lmgeffchoojgkvcuezef.supabase.co',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    // 画像最適化の設定
    formats: ['image/webp', 'image/avif'],
  },
  // 実験的機能（必要に応じて）
  experimental: {
    // App Routerの安定化
    appDir: true,
  },
  // 本番環境での環境変数
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // リダイレクト設定（必要に応じて）
  async redirects() {
    return [
      // 例: www なしから www ありへリダイレクト
      // {
      //   source: '/(.*)',
      //   destination: 'https://www.yourdomain.com/$1',
      //   permanent: true,
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'yourdomain.com',
      //     },
      //   ],
      // },
    ]
  },
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
