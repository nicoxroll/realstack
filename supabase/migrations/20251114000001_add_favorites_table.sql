-- Crear tabla de favoritos para usuarios
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Crear tabla de visitas pendientes
CREATE TABLE IF NOT EXISTS user_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Habilitar RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Users can view their own favorites"
ON user_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON user_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON user_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para visitas
CREATE POLICY "Users can view their own visits"
ON user_visits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
ON user_visits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
ON user_visits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visits"
ON user_visits FOR DELETE
USING (auth.uid() = user_id);

-- Admins pueden ver todos los favoritos y visitas
CREATE POLICY "Admins can view all favorites"
ON user_favorites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can view all visits"
ON user_visits FOR SELECT
TO authenticated
USING (true);
