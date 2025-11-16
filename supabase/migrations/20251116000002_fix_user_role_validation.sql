-- Actualizar función RPC para limpiar y validar el rol antes de insertar
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

-- Actualizar función update_user_role también
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
