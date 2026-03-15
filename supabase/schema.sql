-- Bảng cây cảnh
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  scientific_name VARCHAR(255),
  description TEXT,
  care_level VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng vườn của user
CREATE TABLE user_plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id),
  nickname VARCHAR(255),
  acquired_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng chẩn đoán
CREATE TABLE diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID REFERENCES user_plants(id),
  image_url TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng affiliate
CREATE TABLE affiliate_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  price DECIMAL(10,2),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Plants viewable by all" ON plants FOR SELECT USING (true);
CREATE POLICY "User plants owner" ON user_plants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Diagnoses owner" ON diagnoses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Affiliate viewable by all" ON affiliate_products FOR SELECT USING (true);
