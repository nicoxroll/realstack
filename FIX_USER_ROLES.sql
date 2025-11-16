-- EJECUTA ESTE SQL EN EL SQL EDITOR DE SUPABASE
-- Esto corregirá el problema del constraint user_roles_role_check

-- 1. Primero, eliminar el constraint viejo
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- 2. Recrear el constraint correctamente
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'user', 'client'));

-- 3. Limpiar datos existentes que puedan tener espacios o mayúsculas
UPDATE user_roles
SET role = LOWER(TRIM(role))
WHERE role != LOWER(TRIM(role));

-- 4. Actualizar la función create_user_role para limpiar valores
CREATE OR REPLACE FUNCTION create_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS void AS $$
DECLARE
  v_clean_role TEXT;
BEGIN
  -- Limpiar espacios en blanco y convertir a minúsculas
  v_clean_role := LOWER(TRIM(p_role));
  
  -- Validar que sea un rol válido
  IF v_clean_role NOT IN ('admin', 'user', 'client') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be admin, user, or client', p_role;
  END IF;
  
  -- Insertar o actualizar
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, v_clean_role)
  ON CONFLICT (user_id) DO UPDATE SET role = v_clean_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Actualizar la función update_user_role también
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS void AS $$
DECLARE
  v_clean_role TEXT;
BEGIN
  -- Limpiar espacios en blanco y convertir a minúsculas
  v_clean_role := LOWER(TRIM(p_role));
  
  -- Validar que sea un rol válido
  IF v_clean_role NOT IN ('admin', 'user', 'client') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be admin, user, or client', p_role;
  END IF;
  
  UPDATE user_roles
  SET role = v_clean_role
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar que todo esté bien
SELECT * FROM user_roles;
