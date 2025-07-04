'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MainLayout } from '@/components/layouts/main-layout'
import { LocationSearch } from '@/components/search/location-search'
import { SearchHistory } from '@/components/search/search-history'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Restaurant } from '@/lib/types/restaurant'
import { sortRestaurantsByDistance, formatDistance } from '@/lib/utils/distance'
import { MapPin, Phone, Star, Clock } from 'lucide-react'

export default function Home() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string
    latitude: number
    longitude: number
  } | null>(null)
  const [nearbyRestaurants, setNearbyRestaurants] = useState<(Restaurant & { distance: number })[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Supabase接続テスト
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('restaurants').select('count').limit(1)
        if (error) {
          console.log('Supabase接続エラー:', error.message)
          setConnected(false)
        } else {
          console.log('Supabase接続成功')
          setConnected(true)
        }
      } catch (error) {
        console.log('接続テストエラー:', error)
        setConnected(false)
      }
    }

    testConnection()
  }, [])

  // 検索履歴を保存
  const saveSearchHistory = async (location: {
    name: string
    latitude: number
    longitude: number
  }) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          search_query: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          area_name: location.name,
          search_timestamp: new Date().toISOString()
        })

      if (error) {
        console.error('検索履歴保存エラー:', error)
      }
    } catch (error) {
      console.error('検索履歴保存エラー:', error)
    }
  }

  // 位置選択時の処理
  const handleLocationSelect = async (location: {
    name: string
    latitude: number
    longitude: number
  }) => {
    setSelectedLocation(location)
    setIsSearching(true)

    try {
      // 検索履歴を保存
      await saveSearchHistory(location)

      // 全レストランを取得
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          kids_menus(menu_name, price, age_range),
          restaurant_facilities(has_kids_space, has_baby_changing, has_high_chair)
        `)

      if (error) {
        console.error('レストラン検索エラー:', error)
        setNearbyRestaurants([])
      } else {
        // 距離順にソートして上位20件を取得
        const sortedRestaurants = sortRestaurantsByDistance(
          restaurants || [],
          location.latitude,
          location.longitude
        ).slice(0, 20) // 20件に制限

        setNearbyRestaurants(sortedRestaurants)
      }
    } catch (error) {
      console.error('検索処理エラー:', error)
      setNearbyRestaurants([])
    } finally {
      setIsSearching(false)
    }
  }

  // レストランカードクリック時の処理 - Google Mapsに直接遷移
  const handleRestaurantClick = (restaurant: Restaurant) => {
    // より確実なGoogle Maps URL構築
    // 1. 座標を使用した直接リンク（最も確実）
    const coordinateUrl = `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&hl=ja&gl=jp&z=17`
    
    // 2. 店舗名と住所での検索（フォールバック用）
    const searchQuery = encodeURIComponent(`${restaurant.name} ${restaurant.address}`)
    const searchUrl = `https://www.google.com/maps/search/${searchQuery}?hl=ja&gl=jp`
    
    // デバッグ情報をコンソールに出力
    console.log('Google Maps遷移:', {
      restaurant: restaurant.name,
      address: restaurant.address,
      coordinates: `${restaurant.latitude}, ${restaurant.longitude}`,
      url: coordinateUrl
    })
    
    // 座標を使用したURLで新しいタブを開く
    window.open(coordinateUrl, '_blank', 'noopener,noreferrer')
  }



  return (
    <MainLayout>
      <div className="space-y-12">
        {/* 地域検索セクション */}
        <section>
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </section>

        {/* 検索履歴セクション */}
        <section>
          <SearchHistory onHistorySelect={handleLocationSelect} />
        </section>

        {/* 検索結果プレビュー */}
        {selectedLocation && (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                🎯 {selectedLocation.name} 周辺のお店
              </h2>
              <p className="text-xl text-gray-600">
                お子様と一緒に楽しめるレストランを近い順に表示しています！
              </p>
              {nearbyRestaurants.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                  {nearbyRestaurants.length}件のお店が見つかりました
                </Badge>
              )}
            </div>

            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">お店を検索しています...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nearbyRestaurants.map((restaurant) => (
                  <Card 
                    key={restaurant.id} 
                    className="hover:shadow-lg transition-all duration-200 border-2 border-orange-100 cursor-pointer hover:border-orange-300 transform hover:-translate-y-1"
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🍽️ {restaurant.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {restaurant.price_range}
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          {restaurant.rating}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formatDistance(restaurant.distance)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                        {restaurant.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {restaurant.address}
                        </p>
                        
                        {/* キッズメニュー表示 */}
                        {restaurant.kids_menus && restaurant.kids_menus.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-1">
                              🍴 お子様メニュー:
                            </p>
                            <div className="space-y-1">
                              {restaurant.kids_menus.slice(0, 2).map((menu: any, index: number) => (
                                <div key={index} className="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded">
                                  {menu.menu_name} ({menu.age_range}) - ¥{menu.price}
                                </div>
                              ))}
                              {restaurant.kids_menus.length > 2 && (
                                <div className="text-xs text-gray-500 px-2 py-1">
                                  他 {restaurant.kids_menus.length - 2} 件のメニュー
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 設備情報 */}
                        {restaurant.restaurant_facilities && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {restaurant.restaurant_facilities.has_kids_space && (
                              <Badge variant="outline" className="text-xs">🎪 キッズスペース</Badge>
                            )}
                            {restaurant.restaurant_facilities.has_baby_changing && (
                              <Badge variant="outline" className="text-xs">🚼 おむつ替え</Badge>
                            )}
                            {restaurant.restaurant_facilities.has_high_chair && (
                              <Badge variant="outline" className="text-xs">🪑 ベビーチェア</Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* クリックでGoogle Maps遷移のヒント */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center">
                          クリックでGoogle Mapsに遷移 🗺️
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isSearching && nearbyRestaurants.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-xl text-gray-600">
                  😅 申し訳ございません。該当するお店が見つかりませんでした。
                </p>
                <p className="text-gray-500 mt-2">
                  別のエリアをお試しください。
                </p>
              </div>
            )}
          </section>
        )}

        {/* セットアップ状況（開発用） */}
        {!selectedLocation && (
          <section>
            <Card className="max-w-2xl mx-auto border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  🔧 システム状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Next.js アプリケーション</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>UI コンポーネント (Shadcn/ui)</span>
                  </div>
                  
                  <div className="flex items-center">
                    {connected === true ? (
                      <>
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Supabase データベース接続</span>
                      </>
                    ) : connected === false ? (
                      <>
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Supabase 接続エラー</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-500 mr-2">⏳</span>
                        <span>データベース接続確認中...</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>地域検索機能</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Google Maps 統合</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>検索履歴機能</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>距離計算・ソート機能</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 使い方ガイド */}
        {!selectedLocation && (
          <section>
            <Card className="max-w-4xl mx-auto border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 text-center">
                  📚 使い方ガイド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-3">
                    <div className="text-4xl">📍</div>
                    <h3 className="font-bold text-blue-800">1. 場所を選ぶ</h3>
                    <p className="text-blue-700 text-sm">
                      現在地を取得するか、エリア名を入力して検索地域を決めましょう
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl">🔍</div>
                    <h3 className="font-bold text-blue-800">2. お店を探す</h3>
                    <p className="text-blue-700 text-sm">
                      キッズメニューがある近くのレストランを距離順で最大20件表示
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl">🗺️</div>
                    <h3 className="font-bold text-blue-800">3. 地図で確認</h3>
                    <p className="text-blue-700 text-sm">
                      お店のカードをクリックすると地図と詳細情報をモーダルで表示
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl">⏰</div>
                    <h3 className="font-bold text-blue-800">4. 履歴活用</h3>
                    <p className="text-blue-700 text-sm">
                      過去の検索履歴から簡単に再検索できます
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Google Map モーダル - 削除済み（直接遷移に変更） */}
    </MainLayout>
  )
}
