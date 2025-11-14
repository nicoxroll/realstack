# Configuración del Sistema de Roles de Usuario

## 1. Aplicar Migración de Roles

Ejecuta el SQL del archivo `supabase/migrations/20251114000003_add_user_roles.sql` en Supabase SQL Editor.

Esta migración automáticamente:
- ✅ Crea la tabla `user_roles`
- ✅ Asigna rol **admin** al usuario `admin@realstack.com`
- ✅ Asigna rol **user** a todos los demás usuarios existentes
- ✅ Configura un trigger que asigna roles automáticamente a nuevos usuarios

## 2. Usuario Administrador Principal

**Email del Admin:** `admin@realstack.com`

### Crear el Usuario Admin

1. Ve a **Authentication > Users** en Supabase Dashboard
2. Crea un usuario con email: `admin@realstack.com`
3. Establece una contraseña segura
4. El sistema automáticamente le asignará el rol de admin

O usando la aplicación:
1. Ve a la página de Login
2. Cambia a modo "Registro"
3. Registra una cuenta con: `admin@realstack.com`
4. El rol de admin se asignará automáticamente

## 3. Comportamiento Automático de Roles

### Regla de Asignación:
- 🔴 **Email = admin@realstack.com** → Rol: `admin`
- 🔵 **Cualquier otro email** → Rol: `user`

Esto aplica tanto para usuarios existentes como nuevos usuarios que se registren.

## 4. Gestión Manual de Roles (Opcional)

Aunque el sistema asigna roles automáticamente, los admins pueden cambiar roles desde el panel:

### Hacer Admin a Otro Usuario:
1. Login como `admin@realstack.com`
2. Ve a **Panel Admin > Usuarios**
3. Busca al usuario
4. Presiona "HACER ADMIN"

### Revocar Permisos de Admin:
1. En **Panel Admin > Usuarios**
2. Busca al usuario admin
3. Presiona "REVOCAR ADMIN"

**Nota:** El usuario `admin@realstack.com` siempre puede volver a obtener permisos de admin simplemente cerrando sesión y volviendo a iniciar sesión (el trigger lo reasignará automáticamente).

## 5. Funcionalidades del Panel de Admin

### Para Usuarios con Rol Admin:
- ✅ Acceso completo al panel de administración
- ✅ Gestión de proyectos (crear, editar, eliminar)
- ✅ Gestión de clientes
- ✅ Gestión de operaciones
- ✅ Gestión de usuarios (asignar/revocar roles de admin)
- ✅ Configuración del sitio

### Para Usuarios Normales:
- ✅ Acceso a su perfil de usuario
- ✅ Ver y gestionar favoritos
- ✅ Ver visitas programadas
- ❌ Sin acceso al panel de administración

## 6. Verificación

Para verificar que el sistema funciona:

1. **Inicia sesión con un usuario admin:**
   - Deberías ver el botón "LOGIN" en el header
   - Al hacer clic, ir a login y entrar con credenciales admin
   - Deberías ser redirigido automáticamente al Panel de Administración

2. **Inicia sesión con un usuario normal:**
   - Deberías ser redirigido al perfil de usuario
   - Si intentas acceder directamente a `/admin`, verás mensaje "Acceso Denegado"

## 7. Gestión de Usuarios en el Panel Admin

El panel de administración ahora incluye una pestaña **"Usuarios"** donde puedes:

- Ver todos los usuarios registrados
- Buscar usuarios por email
- Ver el rol actual de cada usuario (ADMIN o USUARIO)
- Cambiar roles (hacer admin o revocar permisos de admin)
- Eliminar usuarios

### Nota Importante sobre Permisos

La gestión de usuarios (especialmente eliminar usuarios) requiere configuración adicional en Supabase:

1. Ve a **Settings > API** en Supabase
2. Copia tu **Service Role Key** (¡NUNCA expongas esta key en el frontend!)
3. Para operaciones sensibles como eliminar usuarios, considera implementar Edge Functions en Supabase

## 8. Seguridad

### Políticas RLS Configuradas:

- **user_roles**: Solo los usuarios admin pueden modificar roles
- Los usuarios pueden ver su propio rol
- Las políticas protegen contra escalación de privilegios

### Recomendaciones:

- Limita el número de usuarios admin
- Revisa regularmente los permisos en la pestaña de Usuarios
- Mantén el Service Role Key seguro (solo server-side)
- Considera implementar logs de auditoría para acciones de admin

## 9. Troubleshooting

### "No puedo acceder al panel de admin"
- Verifica que tu usuario tenga un registro en `user_roles` con `role = 'admin'`
- Cierra sesión y vuelve a iniciar sesión

### "No veo la pestaña de usuarios"
- Asegúrate de que la migración se aplicó correctamente
- Verifica que el componente UsersManager esté importado en Admin.tsx

### "Error al gestionar usuarios"
- Verifica las políticas RLS en la tabla `user_roles`
- Asegúrate de que el usuario actual sea admin
