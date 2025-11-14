import { useState } from 'react';
import { supabase, Project } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { useConfirm } from '../../hooks/useConfirm';
import MapPicker from './MapPicker';

interface ProjectsManagerProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function ProjectsManager({ projects, onUpdate }: ProjectsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();

  const handleCreate = () => {
    setEditingProject({
      name: '',
      description: '',
      location: '',
      image_url: '',
      price_from: 0,
      units_available: 0,
      total_units: 0,
      delivery_date: '',
      amenities: [],
      is_featured: false,
      status: 'available',
    });
    setIsEditing(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingProject) return;

    try {
      if (editingProject.id) {
        const { error } = await supabase
          .from('projects')
          .update(editingProject)
          .eq('id', editingProject.id);
        if (error) throw error;
        showNotification('Proyecto actualizado correctamente', 'success');
      } else {
        const { error } = await supabase.from('projects').insert([editingProject]);
        if (error) throw error;
        showNotification('Proyecto creado correctamente', 'success');
      }
      setIsEditing(false);
      setEditingProject(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving project:', error);
      showNotification('Error al guardar proyecto', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      message: '¿Está seguro de eliminar este proyecto? Esta acción no se puede deshacer.'
    });
    
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      showNotification('Proyecto eliminado correctamente', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      showNotification('Error al eliminar proyecto', 'error');
    }
  };

  if (isEditing && editingProject) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-wide">
            {editingProject.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingProject(null);
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
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={editingProject.name || ''}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, name: e.target.value })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Ubicación <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={editingProject.location || ''}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, location: e.target.value })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Descripción <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              value={editingProject.description || ''}
              onChange={(e) =>
                setEditingProject({ ...editingProject, description: e.target.value })
              }
              rows={3}
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              URL de Imagen <span className="text-red-600">*</span>
            </label>
            <input
              type="url"
              required
              value={editingProject.image_url || ''}
              onChange={(e) =>
                setEditingProject({ ...editingProject, image_url: e.target.value })
              }
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Precio Desde (USD)
              </label>
              <input
                type="number"
                value={editingProject.price_from || 0}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    price_from: Number(e.target.value),
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Unidades Disponibles
              </label>
              <input
                type="number"
                value={editingProject.units_available || 0}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    units_available: Number(e.target.value),
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Total Unidades
              </label>
              <input
                type="number"
                value={editingProject.total_units || 0}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    total_units: Number(e.target.value),
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Fecha de Entrega <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={editingProject.delivery_date || ''}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    delivery_date: e.target.value,
                  })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                placeholder="Ej: Q4 2025, Diciembre 2025"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Estado
              </label>
              <select
                value={editingProject.status || 'available'}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, status: e.target.value })
                }
                className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="available">Disponible</option>
                <option value="sold_out">Agotado</option>
                <option value="coming_soon">Próximamente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Ubicación en Mapa (opcional)
            </label>
            <p className="mb-3 text-xs font-light text-neutral-500">
              Busca una dirección o haz click en el mapa para seleccionar la ubicación
            </p>
            <MapPicker
              latitude={editingProject.latitude}
              longitude={editingProject.longitude}
              onLocationSelect={(lat, lng) => {
                setEditingProject({
                  ...editingProject,
                  latitude: lat,
                  longitude: lng,
                });
              }}
              onClose={() => {}}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Latitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={editingProject.latitude || ''}
                readOnly
                className="w-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-600"
                placeholder="Se actualiza automáticamente"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-light text-neutral-700">
                Longitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={editingProject.longitude || ''}
                readOnly
                className="w-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-600"
                placeholder="Se actualiza automáticamente"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Amenities (separados por coma)
            </label>
            <input
              type="text"
              value={editingProject.amenities?.join(', ') || ''}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  amenities: e.target.value.split(',').map((a) => a.trim()),
                })
              }
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={editingProject.is_featured || false}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  is_featured: e.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <label htmlFor="featured" className="text-sm font-light text-neutral-700">
              Destacado en página principal
            </label>
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
                setEditingProject(null);
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
        <h2 className="text-2xl font-light tracking-wide">Proyectos</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-neutral-900 px-6 py-3 text-sm tracking-wider text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          NUEVO PROYECTO
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Nombre
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Ubicación
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Precio
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Unidades
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Estado
              </th>
              <th className="pb-3 text-left text-sm font-light text-neutral-600">
                Destacado
              </th>
              <th className="pb-3 text-right text-sm font-light text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-neutral-100">
                <td className="py-4 text-sm font-light">{project.name}</td>
                <td className="py-4 text-sm font-light text-neutral-600">
                  {project.location}
                </td>
                <td className="py-4 text-sm font-light">
                  ${project.price_from.toLocaleString()}
                </td>
                <td className="py-4 text-sm font-light">
                  {project.units_available}/{project.total_units}
                </td>
                <td className="py-4 text-sm font-light">{project.status}</td>
                <td className="py-4 text-sm font-light">
                  {project.is_featured ? 'Sí' : 'No'}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleEdit(project)}
                    className="mr-2 p-2 hover:bg-neutral-100"
                  >
                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {NotificationComponent}
      {ConfirmComponent}
    </div>
  );
}
