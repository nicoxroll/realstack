import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { useConfirm } from '../../hooks/useConfirm';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | 'client';
  created_at: string;
  email?: string;
}

interface UsersManagerProps {
  onUpdate: () => void;
}

export default function UsersManager({ onUpdate }: UsersManagerProps) {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    
    // Usar función RPC para obtener usuarios con emails
    const { data, error } = await supabase.rpc('get_users_with_roles');

    if (error) {
      console.error('Error loading users:', error);
      showNotification('Error al cargar usuarios: ' + error.message, 'error');
      setLoading(false);
      return;
    }

    console.log('Usuarios cargados:', data);
    setUsers(data || []);
    setLoading(false);
  };

  const handleChangeRole = async (userId: string, currentRole: 'admin' | 'user' | 'client', newRole: 'admin' | 'user' | 'client') => {
    if (currentRole === newRole) return;
    
    const confirmMessage = `¿Estás seguro de cambiar el rol de ${currentRole.toUpperCase()} a ${newRole.toUpperCase()}?`;

    const confirmed = await confirm({ message: confirmMessage });
    
    if (!confirmed) return;

    // Actualizar rol usando RPC
    const { error } = await supabase.rpc('update_user_role', {
      p_user_id: userId,
      p_role: newRole,
    });

    if (error) {
      showNotification('Error al actualizar el rol: ' + error.message, 'error');
      return;
    }

    showNotification('Rol actualizado correctamente', 'success');
    loadUsers();
    onUpdate();
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-light text-neutral-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-wide text-neutral-900">
          Gestión de Usuarios
        </h2>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-neutral-300 py-2 pl-10 pr-4 font-light outline-none transition-all focus:border-neutral-900"
          />
        </div>
      </div>

      <div className="overflow-hidden border border-neutral-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-light tracking-wider text-neutral-600">
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-sm font-light tracking-wider text-neutral-600">
                Email
              </th>
              <th className="px-6 py-4 text-center text-sm font-light tracking-wider text-neutral-600">
                Rol
              </th>
              <th className="px-6 py-4 text-center text-sm font-light tracking-wider text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center font-light text-neutral-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-light text-neutral-900">
                      {user.email?.split('@')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-light text-neutral-700">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'client'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'ADMIN' : user.role === 'client' ? 'CLIENTE' : 'USUARIO'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.user_id, user.role, e.target.value as 'admin' | 'user' | 'client')}
                        className="border border-neutral-300 px-3 py-2 text-xs tracking-wider transition-all hover:border-neutral-900 focus:border-neutral-900 focus:outline-none"
                      >
                        <option value="user">Usuario</option>
                        <option value="client">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-light text-blue-900">
            <strong>Información:</strong> Aquí puedes ver todos los usuarios registrados y cambiar sus roles.
            Para gestionar clientes específicos, usa la pestaña "Clientes".
          </p>
        </div>
        
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-light text-green-900">
            <strong>Roles disponibles:</strong>
          </p>
          <ul className="mt-2 ml-4 space-y-1 text-sm font-light text-green-800">
            <li>• <strong>Admin:</strong> Acceso completo al panel de administración</li>
            <li>• <strong>Cliente:</strong> Usuario con permisos especiales de gestión</li>
            <li>• <strong>Usuario:</strong> Usuario estándar con acceso básico</li>
          </ul>
        </div>
      </div>
      {NotificationComponent}
      {ConfirmComponent}
    </div>
  );
}
