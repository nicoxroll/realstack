import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useConfirm } from "../../hooks/useConfirm";
import { useNotification } from "../../hooks/useNotification";
import { Client, Operation, Project, supabase } from "../../lib/supabase";

interface OperationsManagerProps {
  operations: Operation[];
  projects: Project[];
  clients: Client[];
  onUpdate: () => void;
}

// Componente Autocomplete reutilizable
interface AutocompleteProps {
  label: string;
  items: Array<{
    id: string;
    name: string;
    detail1?: string;
    detail2?: string;
  }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  renderDetail: (item: any) => string;
}

function Autocomplete({
  label,
  items,
  value,
  onChange,
  placeholder,
  renderDetail,
}: AutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedItem = items.find((item) => item.id === value);
  const displayValue = selectedItem ? selectedItem.name : searchTerm;

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renderDetail(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: any) => {
    onChange(item.id);
    setSearchTerm("");
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-light text-neutral-700">
        {label} <span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={showDropdown ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full border border-neutral-300 px-4 py-2 pr-10 focus:border-neutral-900 focus:outline-none"
        />
        <Search
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          strokeWidth={1.5}
        />
      </div>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowDropdown(false);
              setSearchTerm("");
            }}
          />
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto border border-neutral-300 bg-white shadow-lg">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-500">
                No se encontraron resultados
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                >
                  <div className="font-medium text-sm text-neutral-900">
                    {item.name}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {renderDetail(item)}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function OperationsManager({
  operations,
  projects,
  clients,
  onUpdate,
}: OperationsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOperation, setEditingOperation] =
    useState<Partial<Operation> | null>(null);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();

  const handleCreate = () => {
    setEditingOperation({
      project_id: "",
      client_id: "",
      operation_type: "reservation",
      amount: 0,
      status: "pending",
      notes: "",
    });
    setIsEditing(true);
  };

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingOperation) return;

    try {
      if (editingOperation.id) {
        const { error } = await supabase
          .from("operations")
          .update(editingOperation)
          .eq("id", editingOperation.id);
        if (error) throw error;
        showNotification("Operación actualizada correctamente", "success");
      } else {
        const { error } = await supabase
          .from("operations")
          .insert([editingOperation]);
        if (error) throw error;
        showNotification("Operación creada correctamente", "success");
      }
      setIsEditing(false);
      setEditingOperation(null);
      onUpdate();
    } catch (error) {
      console.error("Error saving operation:", error);
      showNotification("Error al guardar operación", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      message:
        "¿Está seguro de eliminar esta operación? Esta acción no se puede deshacer.",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("operations").delete().eq("id", id);
      if (error) throw error;
      showNotification("Operación eliminada correctamente", "success");
      onUpdate();
    } catch (error) {
      console.error("Error deleting operation:", error);
      showNotification("Error al eliminar operación", "error");
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || "Desconocido";
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Desconocido";
  };

  if (isEditing && editingOperation) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-light tracking-wide">
            {editingOperation.id ? "Editar Operación" : "Nueva Operación"}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingOperation(null);
            }}
            className="p-2 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              label="Proyecto"
              items={projects.map((p) => ({
                id: p.id,
                name: p.name,
                detail1: p.location,
                detail2: `$${p.price_from.toLocaleString()}`,
              }))}
              value={editingOperation.project_id || ""}
              onChange={(value) =>
                setEditingOperation({ ...editingOperation, project_id: value })
              }
              placeholder="Buscar proyecto..."
              renderDetail={(item) => `${item.detail1} • ${item.detail2}`}
            />

            <Autocomplete
              label="Cliente"
              items={clients.map((c) => ({
                id: c.id,
                name: c.name,
                detail1: c.email,
                detail2: c.phone,
              }))}
              value={editingOperation.client_id || ""}
              onChange={(value) =>
                setEditingOperation({ ...editingOperation, client_id: value })
              }
              placeholder="Buscar cliente..."
              renderDetail={(item) => `${item.detail1} • ${item.detail2}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Tipo de Operación
              </label>
              <select
                value={editingOperation.operation_type || "reservation"}
                onChange={(e) =>
                  setEditingOperation({
                    ...editingOperation,
                    operation_type: e.target.value,
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="reservation">Reserva</option>
                <option value="sale">Venta</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Monto (USD)
              </label>
              <input
                type="number"
                value={editingOperation.amount || 0}
                onChange={(e) =>
                  setEditingOperation({
                    ...editingOperation,
                    amount: Number(e.target.value),
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Estado
              </label>
              <select
                value={editingOperation.status || "pending"}
                onChange={(e) =>
                  setEditingOperation({
                    ...editingOperation,
                    status: e.target.value,
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Notas
            </label>
            <textarea
              value={editingOperation.notes || ""}
              onChange={(e) =>
                setEditingOperation({
                  ...editingOperation,
                  notes: e.target.value,
                })
              }
              rows={3}
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-neutral-900 px-6 py-3 text-sm tracking-wider text-white hover:bg-neutral-800"
            >
              <Save className="h-4 w-4" strokeWidth={1.5} />
              GUARDAR
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingOperation(null);
              }}
              className="border border-neutral-300 px-6 py-3 text-sm tracking-wider hover:border-neutral-900"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-light tracking-wide">
          Operaciones
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-neutral-900 px-3 md:px-6 py-3 text-sm tracking-wider text-white hover:bg-neutral-800"
          title="Nueva operación"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden md:inline">NUEVA OPERACIÓN</span>
        </button>
      </div>

      <div className="-mx-4 md:-mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden mx-4 md:mx-0">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                    Proyecto
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-light text-neutral-600">
                    Cliente
                  </th>
                  <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                    Tipo
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                    Monto
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-sm font-light text-neutral-600">
                    Estado
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-sm font-light text-neutral-600">
                    Fecha
                  </th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-light text-neutral-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {operations.map((operation) => (
                  <tr key={operation.id}>
                    <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                      <div className="max-w-[100px] md:max-w-none truncate">
                        {getProjectName(operation.project_id)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-3 text-sm font-light text-neutral-600">
                      {getClientName(operation.client_id)}
                    </td>
                    <td className="hidden sm:table-cell px-3 md:px-6 py-3 text-xs md:text-sm font-light capitalize">
                      {operation.operation_type}
                    </td>
                    <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                      {operation.amount
                        ? `$${operation.amount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3 text-sm font-light capitalize">
                      {operation.status}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3 text-sm font-light text-neutral-600">
                      {new Date(operation.created_at).toLocaleDateString(
                        "es-AR"
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(operation)}
                          className="p-1.5 md:p-2 hover:bg-neutral-100"
                        >
                          <Edit
                            className="h-3.5 w-3.5 md:h-4 md:w-4"
                            strokeWidth={1.5}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(operation.id)}
                          className="p-1.5 md:p-2 hover:bg-red-50"
                        >
                          <Trash2
                            className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {operations.length === 0 && (
              <p className="py-8 text-center text-sm font-light text-neutral-500">
                No hay operaciones registradas aún
              </p>
            )}
          </div>
        </div>
      </div>
      {NotificationComponent}
      {ConfirmComponent}
    </div>
  );
}
