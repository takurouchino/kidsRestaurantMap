'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Search, Trash2 } from 'lucide-react'

interface SearchHistoryItem {
  id: string
  search_query: string
  latitude: number
  longitude: number
  area_name: string
  search_timestamp: string
}

interface SearchHistoryProps {
  onHistorySelect?: (location: {
    name: string
    latitude: number
    longitude: number
  }) => void
}

export function SearchHistory({ onHistorySelect }: SearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 検索履歴を取得
  const fetchSearchHistory = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('search_timestamp', { ascending: false })
        .limit(10)

      if (error) {
        console.error('検索履歴取得エラー:', error)
      } else {
        setSearchHistory(data || [])
      }
    } catch (error) {
      console.error('検索履歴取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 検索履歴を削除
  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('検索履歴削除エラー:', error)
      } else {
        setSearchHistory(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('検索履歴削除エラー:', error)
    }
  }

  // 履歴アイテムを選択
  const handleHistorySelect = (item: SearchHistoryItem) => {
    onHistorySelect?.({
      name: item.area_name,
      latitude: item.latitude,
      longitude: item.longitude
    })
  }

  // 日時をフォーマット
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return '今すぐ'
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) {
        return `${diffDays}日前`
      } else {
        return date.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  if (searchHistory.length === 0 && !isLoading) {
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="text-purple-500" />
          過去の検索履歴
        </CardTitle>
        <p className="text-gray-600 text-sm">
          以前検索した場所から再度検索できます 🔍
        </p>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600">履歴を読み込み中...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate">
                      {item.area_name}
                    </span>
                    <Badge variant="outline" className="text-xs bg-white">
                      {formatDate(item.search_timestamp)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {item.search_query}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    onClick={() => handleHistorySelect(item)}
                    size="sm"
                    variant="outline"
                    className="border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    再検索
                  </Button>
                  <Button
                    onClick={() => deleteHistoryItem(item.id)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {searchHistory.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">まだ検索履歴がありません</p>
                <p className="text-gray-400 text-sm">検索すると履歴がここに表示されます</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 