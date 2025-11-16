-- Arreglar permisos de actualización de roles para admins
-- Eliminar política restrictiva anterior
DROP POLICY IF EXISTS "Enable update for service role only" ON user_roles;

-- Crear nueva política que permita a admins actualizar roles
CREATE POLICY "Admins can update any user role"
  ON user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Asegurar que las funciones RPC tengan permisos correctos
-- Recrear función update_user_role con SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS void AS $$
BEGIN
  -- Verificar que el usuario que llama sea admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden actualizar roles';
  END IF;

  -- Actualizar el rol
  UPDATE user_roles
  SET role = p_role
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Si no existe, crear el rol
    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, p_role);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_role IS 'Permite a admins actualizar roles de usuarios';
