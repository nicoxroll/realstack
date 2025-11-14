-- PASO 1: Arreglar políticas RLS (eliminar recursión infinita)
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for service role only" ON user_roles;
DROP POLICY IF EXISTS "Enable update for service role only" ON user_roles;

-- Permitir que todos los usuarios autenticados lean roles (sin recursión)
CREATE POLICY "Enable read access for authenticated users"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Bloquear inserts y updates desde la app (solo mediante funciones del sistema)
CREATE POLICY "Enable insert for service role only"
  ON user_roles
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Enable update for service role only"
  ON user_roles
  FOR UPDATE
  USING (false);

-- PASO 2: Verificar usuarios existentes y sus roles
SELECT 
  au.id,
  au.email,
  ur.role,
  ur.created_at as role_created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC;

-- PASO 3: Asignar rol de admin manualmente a admin@realstack.com
-- IMPORTANTE: Deshabilitar RLS temporalmente para poder insertar
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@realstack.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Volver a habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar que se asignó correctamente
SELECT 
  au.email,
  ur.role
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@realstack.com';
