# Aplicar Fix de Validación de Roles

## Problema

El constraint de `user_roles` está rechazando valores que deberían ser válidos, posiblemente por espacios en blanco o diferencias de mayúsculas/minúsculas.

## Solución

La migración `20251116000002_fix_user_role_validation.sql` actualiza las funciones RPC para:

- Limpiar espacios en blanco con `TRIM()`
- Convertir a minúsculas con `LOWER()`
- Validar explícitamente antes de insertar

## Pasos para aplicar

### Opción 1: Supabase CLI (Recomendado)

```bash
# Desde la raíz del proyecto
supabase db push
```

### Opción 2: Aplicar manualmente en Supabase Dashboard

1. Ve a https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copia el contenido de `supabase/migrations/20251116000002_fix_user_role_validation.sql`
3. Pégalo en el editor SQL
4. Haz clic en "Run"

### Opción 3: Copiar y pegar en SQL Editor

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
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
```

## Verificar

Después de aplicar la migración, intenta cambiar un rol en el panel de admin. Deberías ver en la consola:

- `Cambiando rol a: [valor]`
- `Enviando a RPC: {...}`
- Y el cambio debería funcionar sin error 400

## Limpiar datos existentes (opcional)

Si tienes roles con espacios en blanco o mayúsculas, puedes limpiarlos:

```sql
UPDATE user_roles
SET role = LOWER(TRIM(role))
WHERE role != LOWER(TRIM(role));
```
