import { useState } from 'react';
import { Project } from '../lib/supabase';

interface FeaturedProjectsProps {
  projects: Project[];
  onViewAll: () => void;
  onViewDetails: (id: string) => void;
}

export default function FeaturedProjects({ projects, onViewAll, onViewDetails }: FeaturedProjectsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="bg-neutral-50 px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide text-neutral-900 md:text-5xl">
            Proyectos Destacados
          </h2>
          <div className="mx-auto h-px w-24 bg-neutral-400" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative aspect-[4/5] cursor-pointer overflow-hidden"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onViewDetails(project.id)}
            >
              <img
                src={project.image_url}
                alt={project.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 ${
                  hoveredId === project.id ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <h3 className="mb-2 text-2xl font-light tracking-wide">
                  {project.name}
                </h3>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    hoveredId === project.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="mb-1 text-sm font-light text-white/80">
                    {project.location}
                  </p>
                  <p className="mb-4 text-lg font-light">
                    Desde USD {project.price_from.toLocaleString()}
                  </p>
                  <button className="border border-white/30 bg-white/10 px-6 py-2 text-sm tracking-wider backdrop-blur-sm transition-all hover:bg-white/20">
                    MÁS INFORMACIÓN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={onViewAll}
            className="border border-neutral-900 bg-transparent px-12 py-4 text-sm tracking-widest text-neutral-900 transition-all hover:bg-neutral-900 hover:text-white"
          >
            VER TODOS LOS PROYECTOS
          </button>
        </div>
      </div>
    </section>
  );
}
