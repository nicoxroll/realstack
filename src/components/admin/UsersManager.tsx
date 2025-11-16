import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirm } from "../../hooks/useConfirm";
import { useNotification } from "../../hooks/useNotification";
import { supabase } from "../../lib/supabase";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user" | "client";
  created_at: string;
  email?: string;
}

interface UsersManagerProps {
  onUpdate: () => void;
}

export default function UsersManager({ onUpdate }: UsersManagerProps) {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    // Usar función RPC para obtener usuarios con emails
    const { data, error } = await supabase.rpc("get_users_with_roles");

    if (error) {
      console.error("Error loading users:", error);
      showNotification("Error al cargar usuarios: " + error.message, "error");
      setLoading(false);
      return;
    }

    console.log("Usuarios cargados:", data);
    setUsers(data || []);
    setLoading(false);
  };

  const handleChangeRole = async (
    userId: string,
    currentRole: "admin" | "user" | "client",
    newRole: "admin" | "user" | "client"
  ) => {
    if (currentRole === newRole) return;

    // Validar que el nuevo rol sea válido
    if (!["admin", "user", "client"].includes(newRole)) {
      console.error(
        "Rol inválido:",
        newRole,
        "Tipo:",
        typeof newRole,
        "Length:",
        newRole.length
      );
      showNotification("Rol inválido seleccionado", "error");
      return;
    }

    const confirmMessage = `¿Estás seguro de cambiar el rol de ${currentRole.toUpperCase()} a ${newRole.toUpperCase()}?`;

    const confirmed = await confirm({ message: confirmMessage });

    if (!confirmed) return;

    console.log("Enviando a RPC:", { p_user_id: userId, p_role: newRole });

    // Usar función RPC con SECURITY DEFINER para evitar problemas con RLS
    const { error } = await supabase.rpc("create_user_role", {
      p_user_id: userId,
      p_role: newRole,
    });

    if (error) {
      console.error("Error al actualizar rol:", error);
      console.error("Parámetros enviados:", { userId, newRole });
      showNotification("Error al actualizar el rol: " + error.message, "error");
      return;
    }

    showNotification("Rol actualizado correctamente", "success");
    loadUsers();
    onUpdate();
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-light text-neutral-600">
          Cargando usuarios...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-light tracking-wide text-neutral-900">
          Gestión de Usuarios
        </h2>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-neutral-300 py-2 pl-10 pr-4 font-light outline-none transition-all focus:border-neutral-900"
          />
        </div>
      </div>
      <div className="-mx-4 md:-mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden mx-4 md:mx-0">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                    Email
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                    Rol Actual
                  </th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-light text-neutral-600">
                    Cambiar Rol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                      <div className="max-w-[120px] md:max-w-none truncate">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                      {user.role === "admin"
                        ? "ADMIN"
                        : user.role === "client"
                        ? "CLIENTE"
                        : "USUARIO"}
                    </td>
                    <td className="px-3 md:px-6 py-3 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const cleanValue = e.target.value.trim() as
                            | "admin"
                            | "user"
                            | "client";
                          handleChangeRole(user.user_id, user.role, cleanValue);
                        }}
                        className="border border-neutral-300 px-2 md:px-3 py-1 text-xs transition-all hover:border-neutral-900 focus:border-neutral-900 focus:outline-none w-full md:w-auto"
                      >
                        <option value="user">Usuario</option>
                        <option value="client">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>{" "}
      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-light text-blue-900">
            <strong>Información:</strong> Aquí puedes ver todos los usuarios
            registrados y cambiar sus roles. Para gestionar clientes
            específicos, usa la pestaña "Clientes".
          </p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-light text-green-900">
            <strong>Roles disponibles:</strong>
          </p>
          <ul className="mt-2 ml-4 space-y-1 text-sm font-light text-green-800">
            <li>
              • <strong>Admin:</strong> Acceso completo al panel de
              administración
            </li>
            <li>
              • <strong>Cliente:</strong> Usuario con permisos especiales de
              gestión
            </li>
            <li>
              • <strong>Usuario:</strong> Usuario estándar con acceso básico
            </li>
          </ul>
        </div>
      </div>
      {NotificationComponent}
      {ConfirmComponent}
    </div>
  );
}
