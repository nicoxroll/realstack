# Aplicar Migración de Permisos de Roles

## Problema

El error `POST https://zjmcytamddfxgfvpnmib.supabase.co/rest/v1/rpc/update_user_role 400 (Bad Request)` ocurre porque las políticas RLS están bloqueando la actualización de roles.

## Solución

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
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

-- Recrear función update_user_role con mejor manejo de errores
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
```

## Pasos

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor" en el menú lateral
4. Crea una nueva query
5. Copia y pega el SQL de arriba
6. Haz click en "Run"

## Verificación

Después de ejecutar el SQL, intenta cambiar el rol de un usuario en el panel de admin. Debería funcionar sin errores.

## Alternativa (si la primera solución no funciona)

El componente ya está actualizado para usar actualización directa en lugar de RPC, así que debería funcionar automáticamente una vez aplicada la política.
