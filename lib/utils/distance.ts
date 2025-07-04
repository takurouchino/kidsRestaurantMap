// 2点間の距離を計算する関数（ハバーサイン公式）
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

// 度をラジアンに変換
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// 距離を人間が読みやすい形式でフォーマット
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else {
    return `${distance.toFixed(1)}km`
  }
}

// レストランリストを距離順にソート
export function sortRestaurantsByDistance<T extends {
  latitude: number
  longitude: number
}>(
  restaurants: T[],
  searchLatitude: number,
  searchLongitude: number
): (T & { distance: number })[] {
  return restaurants
    .map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(
        searchLatitude,
        searchLongitude,
        restaurant.latitude,
        restaurant.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance)
}

// 指定範囲内のレストランをフィルタリング
export function filterRestaurantsByRadius<T extends {
  latitude: number
  longitude: number
}>(
  restaurants: T[],
  searchLatitude: number,
  searchLongitude: number,
  radiusKm: number = 10
): T[] {
  return restaurants.filter(restaurant => {
    const distance = calculateDistance(
      searchLatitude,
      searchLongitude,
      restaurant.latitude,
      restaurant.longitude
    )
    return distance <= radiusKm
  })
} 