'use client'

import { useState, useCallback } from 'react'
import { MapPin, Search, Target, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LocationSearchProps {
  onLocationSelect?: (location: {
    name: string
    latitude: number
    longitude: number
  }) => void
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{
    name: string
    latitude: number
    longitude: number
  } | null>(null)

  // 人気の検索候補エリア（東京都内全般）
  const popularAreas = [
    { name: '新宿駅周辺', latitude: 35.6917, longitude: 139.7007 },
    { name: '渋谷駅周辺', latitude: 35.6598, longitude: 139.7036 },
    { name: '池袋駅周辺', latitude: 35.7295, longitude: 139.7109 },
    { name: '銀座周辺', latitude: 35.6722, longitude: 139.7648 },
    { name: '吉祥寺駅周辺', latitude: 35.7022, longitude: 139.5797 },
    { name: '自由が丘駅周辺', latitude: 35.6081, longitude: 139.6675 },
    { name: '八王子駅周辺', latitude: 35.6559, longitude: 139.3378 },
    { name: '立川駅周辺', latitude: 35.6977, longitude: 139.4135 },
    { name: '日野駅周辺', latitude: 35.6716, longitude: 139.3896 },
    { name: '町田駅周辺', latitude: 35.5497, longitude: 139.4467 },
    { name: '府中駅周辺', latitude: 35.6697, longitude: 139.4785 },
    { name: '調布駅周辺', latitude: 35.6517, longitude: 139.5414 },
  ]

  // 現在地取得
  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert('お使いのブラウザでは位置情報機能がサポートされていません。')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // 実際のアプリでは逆ジオコーディングを行いますが、
          // ここではシンプルに現在地として表示
          const location = {
            name: '現在地',
            latitude,
            longitude
          }
          
          setCurrentLocation(location)
          onLocationSelect?.(location)
        } catch (error) {
          console.error('位置情報の取得に失敗しました:', error)
          alert('位置情報の取得に失敗しました。')
        }
        
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('位置情報の取得エラー:', error)
        alert('位置情報の取得に失敗しました。設定で位置情報の使用を許可してください。')
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分
      }
    )
  }, [onLocationSelect])

  // エリア選択
  const handleAreaSelect = useCallback((area: typeof popularAreas[0]) => {
    setSearchQuery(area.name)
    setCurrentLocation(area)
    onLocationSelect?.(area)
  }, [onLocationSelect])

  // 検索実行
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return

    // 実際のアプリではGoogle Places APIなどで検索
    // ここでは人気エリアから一致するものを探す
    const matchedArea = popularAreas.find(area => 
      area.name.includes(searchQuery) || searchQuery.includes(area.name.replace('駅周辺', '').replace('周辺', ''))
    )

    if (matchedArea) {
      handleAreaSelect(matchedArea)
    } else {
      alert('申し訳ございません。該当するエリアが見つかりませんでした。')
    }
  }, [searchQuery, handleAreaSelect, popularAreas])

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-2 border-orange-100">
      <CardHeader className="text-center bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <MapPin className="text-orange-500" />
          どこで探しますか？
        </CardTitle>
        <p className="text-gray-600 mt-2">
          お子様と一緒に行きたいエリアを選んでください 🌟
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 現在地取得ボタン */}
        <div className="text-center">
          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium rounded-full shadow-lg"
            size="lg"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                位置情報を取得中...
              </>
            ) : (
              <>
                <Target className="mr-2 h-5 w-5" />
                現在地から探す
              </>
            )}
          </Button>
          
          {currentLocation && (
            <div className="mt-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
                📍 {currentLocation.name}
              </Badge>
            </div>
          )}
        </div>

        {/* 区切り線 */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 font-medium">または</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 地域検索フォーム */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="エリア名を入力してください（例：新宿、渋谷）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-lg py-3 border-2 border-orange-200 focus:border-orange-400"
            />
            <Button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3"
              size="lg"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 人気エリア */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
            🏙️ 人気のエリア
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularAreas.map((area, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleAreaSelect(area)}
                className="h-auto py-3 px-4 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium rounded-lg"
              >
                {area.name}
              </Button>
            ))}
          </div>
        </div>

        {/* ヒント */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-yellow-800 mb-1">ヒント</h4>
              <p className="text-yellow-700 text-sm">
                現在地を使うと、近くの子供向けレストランを正確に見つけることができます！
                エリア検索では、駅名や地域名を入力してください。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 