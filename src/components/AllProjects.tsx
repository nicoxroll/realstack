import { useState, useEffect } from 'react';
import { MapPin, Calendar, Home, ChevronDown, Map, Grid, SlidersHorizontal } from 'lucide-react';
import { Project } from '../lib/supabase';
import ProjectsMap from './ProjectsMap';
import ProjectFilters, { FilterValues } from './ProjectFilters';

interface AllProjectsProps {
  projects: Project[];
  onViewDetails: (id: string) => void;
}

export default function AllProjects({ projects, onViewDetails }: AllProjectsProps) {
  const [scrollY, setScrollY] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let result = [...projects];

    if (filters.minPrice) {
      result = result.filter(p => p.price_from >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price_from <= filters.maxPrice!);
    }
    if (filters.location) {
      result = result.filter(p => 
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters.minUnits) {
      result = result.filter(p => p.units_available >= filters.minUnits!);
    }
    if (filters.deliveryYear) {
      result = result.filter(p => p.delivery_date.includes(filters.deliveryYear!));
    }

    setFilteredProjects(result);
  }, [filters, projects]);

  const opacity = Math.max(0, 1 - scrollY / 600);
  const scale = Math.max(0.9, 1 - scrollY / 2000);

  return (
    <>
      {/* Hero con Parallax */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            opacity,
            transform: `scale(${scale})`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-4xl" style={{ opacity }}>
            <h1 className="mb-6 text-5xl font-light tracking-wide text-white md:text-6xl lg:text-7xl">
              Nuestros Proyectos
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/90 md:text-xl">
              Descubre nuestra selección completa de desarrollos inmobiliarios de lujo
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white transition-opacity hover:opacity-70"
          style={{ opacity }}
        >
          <ChevronDown size={40} strokeWidth={1} />
        </button>
      </section>

      {/* Grid de proyectos */}
      <section id="projects-grid" className="bg-white px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-light tracking-wide text-neutral-900 md:text-5xl">
              Todos los Proyectos
            </h2>
            <div className="mx-auto h-px w-24 bg-neutral-400" />
            <p className="mt-4 text-sm font-light text-neutral-600">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </p>
          </div>

          {/* Toggle Vista y Filtros */}
          <div className="mb-8 flex justify-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-sm tracking-wider text-neutral-900 transition-all hover:border-neutral-900"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
              FILTROS
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 border px-6 py-3 text-sm tracking-wider transition-all ${
                viewMode === 'grid'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900'
              }`}
            >
              <Grid className="h-4 w-4" strokeWidth={1.5} />
              LISTA
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 border px-6 py-3 text-sm tracking-wider transition-all ${
                viewMode === 'map'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900'
              }`}
            >
              <Map className="h-4 w-4" strokeWidth={1.5} />
              MAPA
            </button>
          </div>

          {viewMode === 'map' ? (
            <ProjectsMap
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              onProjectSelect={(id) => {
                setSelectedProjectId(id);
                onViewDetails(id);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer overflow-hidden border border-neutral-200 transition-all hover:border-neutral-400 hover:shadow-2xl"
              onClick={() => onViewDetails(project.id)}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-light tracking-wide text-white">
                    {project.name}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-light">{project.location}</span>
                </div>

                <p className="mb-6 line-clamp-2 text-sm font-light leading-relaxed text-neutral-700">
                  {project.description}
                </p>

                <div className="mb-6 flex items-center gap-6 border-t border-neutral-200 pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                    <span className="font-light text-neutral-600">
                      {project.units_available} unidades
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                    <span className="font-light text-neutral-600">
                      {project.delivery_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-neutral-500">Desde</p>
                    <p className="text-2xl font-light text-neutral-900">
                      USD {project.price_from.toLocaleString()}
                    </p>
                  </div>
                  <button className="border border-neutral-900 bg-neutral-900 px-8 py-3 text-sm tracking-wider text-white transition-all hover:bg-transparent hover:text-neutral-900">
                    VER DETALLES
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
          )}
      </div>
    </section>

    {showFilters && (
      <ProjectFilters
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
    )}
    </>
  );
}
