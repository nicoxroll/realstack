import { X } from 'lucide-react';

interface ProjectFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minUnits?: number;
  deliveryYear?: string;
}

export default function ProjectFilters({ onClose, onApply, currentFilters }: ProjectFiltersProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const filters: FilterValues = {
      minPrice: formData.get('minPrice') ? Number(formData.get('minPrice')) : undefined,
      maxPrice: formData.get('maxPrice') ? Number(formData.get('maxPrice')) : undefined,
      location: formData.get('location')?.toString() || undefined,
      minUnits: formData.get('minUnits') ? Number(formData.get('minUnits')) : undefined,
      deliveryYear: formData.get('deliveryYear')?.toString() || undefined,
    };

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    onApply({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl">
        <div className="border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-wide text-neutral-900">
              Filtros
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            {/* Rango de Precio */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                RANGO DE PRECIO (USD)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Mínimo"
                  defaultValue={currentFilters.minPrice}
                  className="border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Máximo"
                  defaultValue={currentFilters.maxPrice}
                  className="border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                UBICACIÓN
              </label>
              <input
                type="text"
                name="location"
                placeholder="Ej: Pocitos, Punta Carretas..."
                defaultValue={currentFilters.location}
                className="w-full border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
              />
            </div>

            {/* Unidades Disponibles */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                UNIDADES DISPONIBLES (MÍNIMO)
              </label>
              <input
                type="number"
                name="minUnits"
                placeholder="Cantidad mínima"
                defaultValue={currentFilters.minUnits}
                className="w-full border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
              />
            </div>

            {/* Año de Entrega */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                AÑO DE ENTREGA
              </label>
              <select
                name="deliveryYear"
                defaultValue={currentFilters.deliveryYear}
                className="w-full border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 border border-neutral-300 bg-white px-6 py-4 text-sm tracking-wider text-neutral-900 transition-all hover:border-neutral-900"
            >
              LIMPIAR FILTROS
            </button>
            <button
              type="submit"
              className="flex-1 border border-neutral-900 bg-neutral-900 px-6 py-4 text-sm tracking-wider text-white transition-all hover:bg-white hover:text-neutral-900"
            >
              APLICAR FILTROS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
