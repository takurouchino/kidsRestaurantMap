// レストラン関連の型定義

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  price_range: '安い' | '普通' | '高い';
  rating: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // リレーションシップ（オプショナル）
  kids_menus?: KidsMenu[];
  restaurant_facilities?: RestaurantFacility;
}

export interface KidsMenu {
  id: string;
  restaurant_id: string;
  menu_name: string;
  description?: string;
  price?: number;
  age_range?: string;
  allergen_info?: string;
  image_url?: string;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantFacility {
  id: string;
  restaurant_id: string;
  has_kids_space: boolean;
  has_baby_changing: boolean;
  has_high_chair: boolean;
  has_kids_toilet: boolean;
  has_stroller_access: boolean;
  has_parking: boolean;
  has_private_room: boolean;
  allows_stroller_inside: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OperatingHour {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0=日曜日, 6=土曜日
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 検索用の複合型
export interface RestaurantWithDetails extends Restaurant {
  kids_menus: KidsMenu[];
  restaurant_facilities: RestaurantFacility;
  operating_hours: OperatingHour[];
  distance?: number; // 検索地点からの距離（km）
}

// 検索フィルター型
export interface SearchFilters {
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  price_range?: ('安い' | '普通' | '高い')[];
  has_kids_space?: boolean;
  has_baby_changing?: boolean;
  has_high_chair?: boolean;
  has_parking?: boolean;
  is_open_now?: boolean;
}

// 検索結果型
export interface SearchResult {
  restaurants: RestaurantWithDetails[];
  total_count: number;
  has_more: boolean;
}

// データベース挿入用の型
export interface RestaurantInsert {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  price_range?: '安い' | '普通' | '高い';
  rating?: number;
  image_url?: string;
}

export interface KidsMenuInsert {
  restaurant_id: string;
  menu_name: string;
  description?: string;
  price?: number;
  age_range?: string;
  allergen_info?: string;
  image_url?: string;
  is_popular?: boolean;
}

export interface RestaurantFacilityInsert {
  restaurant_id: string;
  has_kids_space?: boolean;
  has_baby_changing?: boolean;
  has_high_chair?: boolean;
  has_kids_toilet?: boolean;
  has_stroller_access?: boolean;
  has_parking?: boolean;
  has_private_room?: boolean;
  allows_stroller_inside?: boolean;
  notes?: string;
}

export interface OperatingHourInsert {
  restaurant_id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
  notes?: string;
} 