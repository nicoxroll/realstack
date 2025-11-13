import { X, MapPin, Calendar, Home, Check } from 'lucide-react';
import { Project } from '../lib/supabase';

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetails({ project, onClose }: ProjectDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto bg-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <X className="h-6 w-6 text-neutral-900" strokeWidth={1.5} />
        </button>

        <div className="relative aspect-[21/9] w-full">
          <img
            src={project.image_url}
            alt={project.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <h2 className="mb-2 text-4xl font-light tracking-wide text-white md:text-5xl">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-lg font-light">{project.location}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-8 grid grid-cols-1 gap-6 border-b border-neutral-200 pb-8 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm font-light text-neutral-500">Precio desde</p>
              <p className="text-3xl font-light text-neutral-900">
                USD {project.price_from.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-neutral-500" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-light text-neutral-500">Disponibles</p>
                <p className="text-xl font-light text-neutral-900">
                  {project.units_available} de {project.total_units} unidades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neutral-500" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-light text-neutral-500">Entrega estimada</p>
                <p className="text-xl font-light text-neutral-900">
                  {project.delivery_date}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-light tracking-wide text-neutral-900">
              Descripción
            </h3>
            <p className="font-light leading-relaxed text-neutral-700">
              {project.description}
            </p>
          </div>

          {project.amenities && project.amenities.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-2xl font-light tracking-wide text-neutral-900">
                Amenities
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {project.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-neutral-100">
                      <Check className="h-4 w-4 text-neutral-700" strokeWidth={1.5} />
                    </div>
                    <span className="font-light text-neutral-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button className="flex-1 border border-neutral-900 bg-neutral-900 px-8 py-4 text-sm tracking-wider text-white transition-all hover:bg-transparent hover:text-neutral-900">
              SOLICITAR INFORMACIÓN
            </button>
            <button className="flex-1 border border-neutral-300 bg-transparent px-8 py-4 text-sm tracking-wider text-neutral-900 transition-all hover:border-neutral-900">
              AGENDAR VISITA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
