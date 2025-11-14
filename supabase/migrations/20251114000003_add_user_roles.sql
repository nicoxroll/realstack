-- Crear tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for service role only" ON user_roles;
DROP POLICY IF EXISTS "Enable update for service role only" ON user_roles;

-- Policy para que todos los usuarios autenticados puedan ver CUALQUIER rol
-- Esto es necesario para que la app pueda verificar quién es admin
CREATE POLICY "Enable read access for authenticated users"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy para insertar roles - solo mediante funciones del sistema
CREATE POLICY "Enable insert for service role only"
  ON user_roles
  FOR INSERT
  WITH CHECK (false);

-- Policy para actualizar roles - solo mediante funciones del sistema  
CREATE POLICY "Enable update for service role only"
  ON user_roles
  FOR UPDATE
  USING (false);

-- Índice para búsquedas rápidas
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_user_roles_role;
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

COMMENT ON TABLE user_roles IS 'Roles de usuario (admin, user o client)';
COMMENT ON COLUMN user_roles.role IS 'Rol del usuario: admin, user o client';

-- Función RPC para crear rol de usuario (permite INSERT desde el admin panel)
CREATE OR REPLACE FUNCTION create_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC para actualizar rol de usuario
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE user_roles
  SET role = p_role
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC para obtener usuarios con sus roles y emails
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.created_at,
    au.email::TEXT
  FROM user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asignar rol de admin al usuario admin@realstack.com si existe
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@realstack.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Asignar rol de usuario normal a todos los demás usuarios
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE email != 'admin@realstack.com'
  AND id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Función para asignar rol automáticamente al crear un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'admin@realstack.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar rol automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Asigna automáticamente el rol al crear un usuario: admin para admin@realstack.com, user para los demás';
