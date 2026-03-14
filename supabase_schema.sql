-- ============================================
-- SVELTYSSIM — Script SQL Supabase
-- Colle ce code dans l'éditeur SQL de Supabase
-- ============================================

-- Table des repas
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'Déjeuner',
  calories INTEGER NOT NULL DEFAULT 0,
  carbs DECIMAL(6,1) DEFAULT 0,
  proteins DECIMAL(6,1) DEFAULT 0,
  quantity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table du suivi poids
CREATE TABLE weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Table des objectifs
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calories INTEGER DEFAULT 2000,
  carbs DECIMAL(6,1) DEFAULT 250,
  proteins DECIMAL(6,1) DEFAULT 150,
  target_weight DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SÉCURITÉ : Row Level Security (RLS)
-- Chaque utilisateur ne voit QUE ses données
-- ============================================

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policies meals
CREATE POLICY "Users can manage their own meals"
  ON meals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies weights
CREATE POLICY "Users can manage their own weights"
  ON weights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies goals
CREATE POLICY "Users can manage their own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
