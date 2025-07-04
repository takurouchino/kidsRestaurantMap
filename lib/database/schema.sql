-- キッズメニュー対応レストランデータベース スキーマ
-- 子供向けレストラン検索アプリ用

-- 1. レストランテーブル（基本情報）
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    price_range VARCHAR(10) CHECK (price_range IN ('安い', '普通', '高い')) DEFAULT '普通',
    rating DECIMAL(2, 1) DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. キッズメニューテーブル
CREATE TABLE kids_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER, -- 円単位
    age_range VARCHAR(20), -- 例: "3-8歳", "2-6歳"
    allergen_info TEXT, -- アレルゲン情報
    image_url VARCHAR(500),
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 子供向け設備テーブル
CREATE TABLE restaurant_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    has_kids_space BOOLEAN DEFAULT FALSE,
    has_baby_changing BOOLEAN DEFAULT FALSE,
    has_high_chair BOOLEAN DEFAULT FALSE,
    has_kids_toilet BOOLEAN DEFAULT FALSE,
    has_stroller_access BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    has_private_room BOOLEAN DEFAULT FALSE,
    allows_stroller_inside BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 営業時間テーブル
CREATE TABLE operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜日, 6=土曜日
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX idx_kids_menus_restaurant ON kids_menus(restaurant_id);
CREATE INDEX idx_restaurant_facilities_restaurant ON restaurant_facilities(restaurant_id);
CREATE INDEX idx_operating_hours_restaurant ON operating_hours(restaurant_id);
CREATE INDEX idx_operating_hours_day ON operating_hours(day_of_week);

-- 位置情報検索用の関数
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) 設定
-- 今回は認証なしのアプリなので、全てのレコードを読み取り可能に設定
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー
CREATE POLICY "Allow public read access" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON kids_menus FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON restaurant_facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON operating_hours FOR SELECT USING (true); 