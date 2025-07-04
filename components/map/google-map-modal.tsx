'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Restaurant } from '@/lib/types/restaurant'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Globe, MapPin, Clock } from 'lucide-react'

interface GoogleMapModalProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant | null
}

export function GoogleMapModal({ isOpen, onClose, restaurant }: GoogleMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !restaurant || !mapRef.current) return

    const initializeMap = async () => {
      setIsLoading(true)
      try {
        // Google Maps埋め込み（iframe）を使用して確実に表示
        showEmbeddedMap()
      } catch (error) {
        console.error('地図表示エラー:', error)
        showEmbeddedMap()
      } finally {
        setIsLoading(false)
      }
    }

    // 代替手段: Google Maps埋め込み
    const showEmbeddedMap = () => {
      if (mapRef.current) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        // デバッグ情報を出力
        console.log('🔍 API Key Debug Info:')
        console.log('- API Key exists:', !!apiKey)
        console.log('- API Key length:', apiKey?.length || 0)
        console.log('- API Key start:', apiKey?.substring(0, 20) + '...')
        console.log('- All env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')))
        
        // 3つの方法で地図表示を試行
        let mapContent = ''
        
        if (apiKey && apiKey !== 'demo' && apiKey !== 'your_google_maps_api_key_here') {
          console.log('✅ Google Maps APIキーが設定されています:', apiKey.substring(0, 10) + '...')
          
          // 方法1: Google Maps Embed API (最も高機能)
          const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(restaurant.address)}&center=${restaurant.latitude},${restaurant.longitude}&zoom=16&maptype=roadmap`
          
          // 方法2: Google Maps Static API (画像として表示)
          const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latitude},${restaurant.longitude}&zoom=16&size=600x400&markers=color:red%7C${restaurant.latitude},${restaurant.longitude}&key=${apiKey}&style=feature:poi|element:labels|visibility:simplified`
          
          mapContent = `
            <div style="width: 100%; height: 100%; border-radius: 8px; overflow: hidden; position: relative;">
              <!-- 埋め込み地図を試行 -->
              <iframe
                id="embeddedMap"
                width="100%"
                height="100%"
                style="border:0; border-radius: 8px; display: block;"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="${embedUrl}"
                onerror="console.log('📍 iframe地図の読み込みに失敗しました。静的地図に切り替えます。'); this.style.display='none'; document.getElementById('staticMapFallback').style.display='block';"
                onload="console.log('✅ 埋め込み地図の読み込みが完了しました');">
              </iframe>
              
              <!-- 静的地図画像（フォールバック） -->
              <div id="staticMapFallback" style="display: none; width: 100%; height: 100%; position: relative;">
                <img 
                  src="${staticMapUrl}" 
                  alt="${restaurant.name}の地図"
                  style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; cursor: pointer;"
                  onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}', '_blank')"
                  title="クリックでGoogle Mapを開く"
                  onload="console.log('✅ 静的地図画像の読み込みが完了しました')"
                  onerror="console.log('❌ 静的地図画像の読み込みに失敗しました'); this.style.display='none'; this.parentElement.innerHTML='<div style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"font-size: 48px; margin-bottom: 15px;\">🗺️</div><p style=\"margin: 0 0 15px 0; font-weight: bold; color: #333;\">地図を表示できません</p><p style=\"margin: 0 0 15px 0; font-size: 14px; color: #666;\">外部リンクで地図を表示してください</p><a href=\"https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}\" target=\"_blank\" style=\"background: #4285f4; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-weight: 500;\">Google Mapで開く</a></div>';"
                />
                <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                  クリックで詳細地図を表示
                </div>
              </div>
              
              <!-- アクションボタン -->
              <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px;">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}" target="_blank" rel="noopener noreferrer" 
                   style="background: #4285f4; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  🗺️ Google Map
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}" target="_blank" rel="noopener noreferrer"
                   style="background: #34a853; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  🚗 経路
                </a>
              </div>
            </div>
          `
        } else {
          console.log('❌ Google Maps APIキーが未設定です')
          console.log('- Received API Key:', apiKey)
          console.log('- API Key type:', typeof apiKey)
          
          // APIキーがない場合は美しい代替表示
          mapContent = `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 30px; text-align: center; color: white; position: relative;">
              <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 25px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 25px; max-width: 350px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🍽️</div>
                <h3 style="margin: 0 0 15px 0; color: white; font-size: 20px; font-weight: bold;">${restaurant.name}</h3>
                <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.4;">${restaurant.address}</p>
                <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
                  <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px; font-size: 12px;">⭐ ${restaurant.rating}</span>
                  <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px; font-size: 12px;">💰 ${restaurant.price_range}</span>
                </div>
              </div>
              
              <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}" target="_blank" rel="noopener noreferrer"
                   style="background: #4285f4; color: white; padding: 12px 20px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                  🗺️ Google Mapで開く
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}" target="_blank" rel="noopener noreferrer"
                   style="background: #34a853; color: white; padding: 12px 20px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                  🚗 経路案内
                </a>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);">
                <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">💡 インタラクティブ地図表示のために</p>
                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; line-height: 1.4;">Google Maps APIキーを設定すると、このエリアに<br/>詳細な埋め込み地図が表示されます</p>
              </div>
            </div>
          `
        }
        
        mapRef.current.innerHTML = mapContent
      }
    }

    initializeMap()
  }, [isOpen, restaurant])

  if (!restaurant) return null

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}&destination_place_id=${restaurant.name}`
    window.open(url, '_blank')
  }

  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`, '_self')
    }
  }

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="text-orange-500" />
            {restaurant.name}
          </DialogTitle>
          <DialogDescription>
            🍽️ お子様と一緒に楽しめるレストランの詳細情報と地図
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 地図エリア */}
          <div className="lg:col-span-2 relative">
            <div className="bg-gray-100 rounded-lg overflow-hidden h-full min-h-[400px] relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-gray-600">地図を読み込み中...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full min-h-[400px]" />
            </div>
          </div>

          {/* 詳細情報エリア */}
          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">📍 基本情報</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {restaurant.address}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {restaurant.price_range}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⭐ {restaurant.rating}
                  </Badge>
                </div>
                {restaurant.description && (
                  <p className="text-gray-600 text-sm mt-2">{restaurant.description}</p>
                )}
              </div>
            </div>

            {/* キッズメニュー情報 */}
            {restaurant.kids_menus && restaurant.kids_menus.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 text-green-800">🍴 お子様メニュー</h3>
                <div className="space-y-2">
                  {restaurant.kids_menus.slice(0, 3).map((menu: any, index: number) => (
                    <div key={index} className="bg-white rounded p-2 border border-green-200">
                      <div className="font-medium text-green-700">{menu.menu_name}</div>
                      <div className="text-sm text-gray-600">
                        {menu.age_range} • ¥{menu.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 設備情報 */}
            {restaurant.restaurant_facilities && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 text-blue-800">🏢 子供向け設備</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.restaurant_facilities.has_kids_space && (
                    <Badge variant="outline" className="text-xs bg-white">🎪 キッズスペース</Badge>
                  )}
                  {restaurant.restaurant_facilities.has_baby_changing && (
                    <Badge variant="outline" className="text-xs bg-white">🚼 おむつ替え</Badge>
                  )}
                  {restaurant.restaurant_facilities.has_high_chair && (
                    <Badge variant="outline" className="text-xs bg-white">🪑 ベビーチェア</Badge>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-2">
              <Button 
                onClick={handleDirections}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                経路案内
              </Button>
              
              {restaurant.phone && (
                <Button 
                  onClick={handleCall}
                  variant="outline"
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  電話する
                </Button>
              )}
              
              {restaurant.website && (
                <Button 
                  onClick={handleWebsite}
                  variant="outline"
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  ウェブサイト
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 