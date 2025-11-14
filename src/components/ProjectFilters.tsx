import { X } from "lucide-react";
import { useState } from "react";

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

export default function ProjectFilters({
  onClose,
  onApply,
  currentFilters,
}: ProjectFiltersProps) {
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 500000);
  const [location, setLocation] = useState(currentFilters.location || "");
  const [minUnits, setMinUnits] = useState(currentFilters.minUnits || 0);
  const [deliveryYear, setDeliveryYear] = useState(
    currentFilters.deliveryYear || ""
  );

  const handleMinPriceChange = (value: number) => {
    if (value <= maxPrice) {
      setMinPrice(value);
    } else {
      setMinPrice(maxPrice);
    }
  };

  const handleMaxPriceChange = (value: number) => {
    if (value >= minPrice) {
      setMaxPrice(value);
    } else {
      setMaxPrice(minPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filters: FilterValues = {
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 500000 ? maxPrice : undefined,
      location: location || undefined,
      minUnits: minUnits > 0 ? minUnits : undefined,
      deliveryYear: deliveryYear || undefined,
    };

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(500000);
    setLocation("");
    setMinUnits(0);
    setDeliveryYear("");
    onApply({});
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-8 py-6">
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
          <div className="space-y-8">
            {/* Rango de Precio con Slider */}
            <div>
              <label className="mb-4 block text-sm font-light tracking-wide text-neutral-700">
                RANGO DE PRECIO (USD)
              </label>
              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-light text-neutral-500">
                    Precio Mínimo: USD {minPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={minPrice}
                    onChange={(e) =>
                      handleMinPriceChange(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-light text-neutral-500">
                    Precio Máximo: USD {maxPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={maxPrice}
                    onChange={(e) =>
                      handleMaxPriceChange(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-sm font-light text-neutral-700">
                  USD {minPrice.toLocaleString()}
                </span>
                <span className="text-sm font-light text-neutral-500">—</span>
                <span className="text-sm font-light text-neutral-700">
                  USD {maxPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                UBICACIÓN
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Pocitos, Punta Carretas..."
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
                value={minUnits || ""}
                onChange={(e) => setMinUnits(Number(e.target.value))}
                placeholder="Cantidad mínima"
                className="w-full border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
              />
            </div>

            {/* Año de Entrega */}
            <div>
              <label className="mb-3 block text-sm font-light tracking-wide text-neutral-700">
                AÑO DE ENTREGA
              </label>
              <select
                value={deliveryYear}
                onChange={(e) => setDeliveryYear(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 text-sm font-light focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="submit"
              className="w-full border border-neutral-900 bg-neutral-900 px-6 py-4 text-sm tracking-wider text-white transition-all hover:bg-neutral-800"
            >
              APLICAR FILTROS
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full border border-neutral-300 bg-white px-6 py-4 text-sm tracking-wider text-neutral-900 transition-all hover:border-neutral-900"
            >
              LIMPIAR FILTROS
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
