# Configuración del Admin

> **⚠️ ACTUALIZACIÓN IMPORTANTE:** Este proyecto ahora usa un sistema de roles basado en base de datos.
> Para configurar usuarios admin, consulta **[ROLES_SETUP.md](./ROLES_SETUP.md)** para las instrucciones actualizadas.

---

## Configuración Legacy (Referencia Histórica)

## Configurar autenticación en Supabase

Para que el login de administrador funcione, necesitas configurar la autenticación en Supabase:

### 1. Habilitar Email Authentication en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** → **Providers**
3. Asegúrate de que **Email** esté habilitado

### 2. Crear usuario administrador

Puedes crear el usuario admin de dos formas:

#### Opción A: Desde Supabase Dashboard
1. Ve a **Authentication** → **Users**
2. Haz clic en **Add User**
3. Ingresa el email y contraseña del administrador
4. Confirma el usuario

#### Opción B: Desde SQL Editor
Ejecuta este código en el SQL Editor de Supabase:

```sql
-- Insertar usuario admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- Cambia esto por tu email
  crypt('tu_contraseña_segura', gen_salt('bf')), -- Cambia esto por tu contraseña
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  '',
  ''
);
```

### 3. Credenciales de acceso

Usa estas credenciales para acceder al panel de administración:
- **Email**: El email que configuraste
- **Contraseña**: La contraseña que configuraste

### 4. Políticas de seguridad (RLS)

Para proteger tus datos, asegúrate de que las políticas RLS estén configuradas correctamente:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de proyectos y configuración
CREATE POLICY "Allow public read access to projects"
ON projects FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to page_config"
ON page_config FOR SELECT
USING (true);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "Allow authenticated users to insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- Aplicar políticas similares a otras tablas
CREATE POLICY "Allow authenticated access to clients"
ON clients FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated access to operations"
ON operations FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated access to page_config"
ON page_config FOR ALL
TO authenticated
USING (true);
```

## Funcionalidades del Admin

### Proyectos
- ✅ Crear nuevos proyectos
- ✅ Editar proyectos existentes
- ✅ Eliminar proyectos
- ✅ Marcar proyectos como destacados
- ✅ Gestionar amenities

### Clientes
- ✅ Ver lista de contactos
- ✅ Gestionar información de clientes

### Operaciones
- ✅ Registrar operaciones
- ✅ Vincular con proyectos y clientes
- ✅ Seguimiento de estado

### Configuración
- ✅ Actualizar textos del hero
- ✅ Modificar información de contacto
- ✅ Configurar Google Maps

## Uso

1. Accede a la sección Admin desde el header
2. Ingresa tus credenciales
3. Gestiona el contenido desde el panel
4. Los cambios se reflejan inmediatamente en el sitio
