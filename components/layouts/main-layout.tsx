import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg border-b-4 border-orange-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                🍽️ キッズレストラン検索
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                お子様と一緒に楽しめるお店を見つけよう！
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t-4 border-blue-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              🌟 ファミリーフレンドリーなお店を応援しています 🌟
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>安心・安全</span>
              <span>•</span>
              <span>子供向けメニュー</span>
              <span>•</span>
              <span>家族で楽しく</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 