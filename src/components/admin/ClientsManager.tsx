import { useState } from 'react';
import { Client } from '../../lib/supabase';
import { Mail, Phone, Trash2, Edit2, Plus, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../hooks/useNotification';
import { useConfirm } from '../../hooks/useConfirm';

interface ClientsManagerProps {
  clients: Client[];
  onUpdate: () => void;
}

export default function ClientsManager({ clients, onUpdate }: ClientsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('clients')
      .insert([formData]);

    if (error) {
      showNotification('Error al crear cliente: ' + error.message, 'error');
      return;
    }

    showNotification('Cliente creado correctamente', 'success');
    resetForm();
    onUpdate();
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      message: client.message || '',
    });
    setEditingId(client.id);
    setShowCreateForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('clients')
      .update(formData)
      .eq('id', editingId);

    if (error) {
      showNotification('Error al actualizar cliente: ' + error.message, 'error');
      return;
    }

    showNotification('Cliente actualizado correctamente', 'success');
    resetForm();
    onUpdate();
  };
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      message: '¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.'
    });
    
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      showNotification('Cliente eliminado correctamente', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('Error al eliminar cliente', 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light tracking-wide text-neutral-900">Clientes</h2>
          <p className="mt-2 text-sm font-light text-neutral-600">
            Gestiona los clientes de tu empresa
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(!showCreateForm);
          }}
          className="flex items-center gap-2 border border-green-500 px-4 py-2 text-sm tracking-wider text-green-600 transition-all hover:bg-green-50"
        >
          {showCreateForm ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
          {showCreateForm ? 'CANCELAR' : 'NUEVO CLIENTE'}
        </button>
      </div>

      {/* Formulario Crear/Editar */}
      {(showCreateForm || editingId) && (
        <div className="mb-6 border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="mb-4 text-lg font-light tracking-wide text-neutral-900">
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-light text-neutral-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-neutral-300 px-4 py-2 font-light outline-none transition-all focus:border-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-light text-neutral-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-neutral-300 px-4 py-2 font-light outline-none transition-all focus:border-neutral-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-neutral-300 px-4 py-2 font-light outline-none transition-all focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Mensaje/Notas
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-neutral-300 px-4 py-2 font-light outline-none transition-all focus:border-neutral-900"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 border border-green-500 px-6 py-3 text-sm tracking-wider text-green-600 transition-all hover:bg-green-50"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {editingId ? 'GUARDAR CAMBIOS' : 'CREAR CLIENTE'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-neutral-300 px-6 py-3 text-sm tracking-wider text-neutral-600 transition-all hover:bg-neutral-50"
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="space-y-4">{clients.map((client) => (
          <div
            key={client.id}
            className="border border-neutral-200 bg-white p-6 transition-all hover:border-neutral-400"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-light">{client.name}</h3>
                <p className="text-sm font-light text-neutral-500">
                  {new Date(client.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 transition-colors hover:bg-blue-50"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 transition-colors hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4 text-red-600" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                <a
                  href={`mailto:${client.email}`}
                  className="font-light text-neutral-700 hover:text-neutral-900"
                >
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                  <a
                    href={`tel:${client.phone}`}
                    className="font-light text-neutral-700 hover:text-neutral-900"
                  >
                    {client.phone}
                  </a>
                </div>
              )}
            </div>

            {client.message && (
              <div className="border-t border-neutral-200 pt-4">
                <p className="text-sm font-light leading-relaxed text-neutral-700">
                  {client.message}
                </p>
              </div>
            )}
          </div>
        ))}

        {clients.length === 0 && (
          <div className="border border-neutral-200 bg-white p-12 text-center">
            <p className="text-sm font-light text-neutral-500">
              No hay clientes registrados aún. Haz clic en "NUEVO CLIENTE" para agregar uno.
            </p>
          </div>
        )}
      </div>
      {NotificationComponent}
      {ConfirmComponent}
    </div>
  );
}
