import { Client } from '../../lib/supabase';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientsManagerProps {
  clients: Client[];
  onUpdate: () => void;
}

export default function ClientsManager({ clients, onUpdate }: ClientsManagerProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await supabase.from('clients').delete().eq('id', id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide">Clientes</h2>
        <p className="mt-2 text-sm font-light text-neutral-600">
          Contactos recibidos desde el formulario de la página
        </p>
      </div>

      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="border border-neutral-200 p-6 transition-all hover:border-neutral-400"
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
              <button
                onClick={() => handleDelete(client.id)}
                className="p-2 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-600" strokeWidth={1.5} />
              </button>
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
          <p className="py-8 text-center text-sm font-light text-neutral-500">
            No hay clientes registrados aún
          </p>
        )}
      </div>
    </div>
  );
}
