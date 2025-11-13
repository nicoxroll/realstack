import { useState } from 'react';
import { supabase, Operation, Project, Client } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface OperationsManagerProps {
  operations: Operation[];
  projects: Project[];
  clients: Client[];
  onUpdate: () => void;
}

export default function OperationsManager({
  operations,
  projects,
  clients,
  onUpdate,
}: OperationsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Partial<Operation> | null>(
    null
  );

  const handleCreate = () => {
    setEditingOperation({
      project_id: '',
      client_id: '',
      operation_type: 'reservation',
      amount: 0,
      status: 'pending',
      notes: '',
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
        await supabase
          .from('operations')
          .update(editingOperation)
          .eq('id', editingOperation.id);
      } else {
        await supabase.from('operations').insert([editingOperation]);
      }
      setIsEditing(false);
      setEditingOperation(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving operation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta operación?')) return;

    try {
      await supabase.from('operations').delete().eq('id', id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting operation:', error);
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'Desconocido';
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Desconocido';
  };

  if (isEditing && editingOperation) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-wide">
            {editingOperation.id ? 'Editar Operación' : 'Nueva Operación'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Proyecto
              </label>
              <select
                value={editingOperation.project_id || ''}
                onChange={(e) =>
                  setEditingOperation({
                    ...editingOperation,
                    project_id: e.target.value,
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Cliente
              </label>
              <select
                value={editingOperation.client_id || ''}
                onChange={(e) =>
                  setEditingOperation({
                    ...editingOperation,
                    client_id: e.target.value,
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Tipo de Operación
              </label>
              <select
                value={editingOperation.operation_type || 'reservation'}
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
                value={editingOperation.status || 'pending'}
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
              value={editingOperation.notes || ''}
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
        <h2 className="text-2xl font-light tracking-wide">Operaciones</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-neutral-900 px-6 py-3 text-sm tracking-wider text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          NUEVA OPERACIÓN
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Proyecto
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Cliente
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Tipo
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Monto
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Estado
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Fecha
              </th>
              <th className="pb-3 text-right text-sm font-light text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={operation.id} className="border-b border-neutral-100">
                <td className="py-4 text-sm font-light">
                  {getProjectName(operation.project_id)}
                </td>
                <td className="py-4 text-sm font-light text-neutral-600">
                  {getClientName(operation.client_id)}
                </td>
                <td className="py-4 text-sm font-light capitalize">
                  {operation.operation_type}
                </td>
                <td className="py-4 text-sm font-light">
                  {operation.amount
                    ? `$${operation.amount.toLocaleString()}`
                    : '-'}
                </td>
                <td className="py-4 text-sm font-light capitalize">
                  {operation.status}
                </td>
                <td className="py-4 text-sm font-light text-neutral-600">
                  {new Date(operation.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleEdit(operation)}
                    className="mr-2 p-2 hover:bg-neutral-100"
                  >
                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(operation.id)}
                    className="p-2 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" strokeWidth={1.5} />
                  </button>
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
  );
}
