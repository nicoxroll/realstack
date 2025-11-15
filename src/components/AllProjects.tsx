import {
  Calendar,
  ChevronDown,
  Grid,
  Home,
  Loader,
  Map,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "../lib/supabase";
import ProjectFilters, { FilterValues } from "./ProjectFilters";
import ProjectsMap from "./ProjectsMap";

interface AllProjectsProps {
  projects: Project[];
  onViewDetails: (id: string) => void;
}

export default function AllProjects({
  projects,
  onViewDetails,
}: AllProjectsProps) {
  const [scrollY, setScrollY] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let result = [...projects];

      if (filters.minPrice) {
        result = result.filter((p) => p.price_from >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        result = result.filter((p) => p.price_from <= filters.maxPrice!);
      }
      if (filters.location) {
        result = result.filter((p) =>
          p.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.minUnits) {
        result = result.filter((p) => p.units_available >= filters.minUnits!);
      }
      if (filters.deliveryYear) {
        result = result.filter((p) =>
          p.delivery_date.includes(filters.deliveryYear!)
        );
      }

      setFilteredProjects(result);
      setIsLoading(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [filters, projects]);

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const parallaxOffset = scrollY * 0.5;
  const contentOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <>
      {/* Hero con Parallax */}
      <section className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg)",
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-4xl" style={{ opacity: contentOpacity }}>
            <h1 className="mb-6 text-5xl font-light tracking-wide text-white md:text-6xl lg:text-7xl">
              Nuestros Proyectos
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/90 md:text-xl">
              Descubre nuestra selección completa de desarrollos inmobiliarios
              de lujo
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.scrollTo({ top: 0 });
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white transition-opacity hover:opacity-70"
          style={{ opacity: contentOpacity }}
        >
          <ChevronDown size={40} strokeWidth={1} />
        </button>
      </section>

      {/* Grid de proyectos */}
      <section
        id="projects-grid"
        className="bg-white px-6 py-24 md:px-12 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-light tracking-wide text-neutral-900 md:text-5xl">
              Todos los Proyectos
            </h2>
            <div className="mx-auto h-px w-24 bg-neutral-400" />
            <p className="mt-4 text-sm font-light text-neutral-600">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1
                ? "proyecto encontrado"
                : "proyectos encontrados"}
            </p>
          </div>

          {/* Toggle Vista y Filtros */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(true)}
              className="relative flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-sm tracking-wider text-neutral-900 transition-all hover:border-neutral-900"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
              FILTROS
              {activeFiltersCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 border px-6 py-3 text-sm tracking-wider transition-all ${
                  viewMode === "grid"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                }`}
              >
                <Grid className="h-4 w-4" strokeWidth={1.5} />
                LISTA
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 border px-6 py-3 text-sm tracking-wider transition-all ${
                  viewMode === "map"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                }`}
              >
                <Map className="h-4 w-4" strokeWidth={1.5} />
                MAPA
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader className="h-12 w-12 animate-spin text-neutral-400" />
            </div>
          ) : viewMode === "map" ? (
            <div className="relative z-0">
              <ProjectsMap
                projects={filteredProjects}
                selectedProjectId={selectedProjectId}
                onProjectSelect={(id) => {
                  setSelectedProjectId(id);
                  onViewDetails(id);
                }}
              />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-6 rounded-full bg-neutral-100 p-8">
                <Home className="h-16 w-16 text-neutral-400" strokeWidth={1} />
              </div>
              <h3 className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
                No se encontraron proyectos
              </h3>
              <p className="mb-8 max-w-md text-center font-light text-neutral-600">
                No hay proyectos que coincidan con los filtros seleccionados.
                Intenta ajustar tus criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setFilters({});
                }}
                className="border border-neutral-900 bg-neutral-900 px-8 py-3 text-sm tracking-wider text-white transition-all hover:bg-transparent hover:text-neutral-900"
              >
                LIMPIAR FILTROS
              </button>
            </div>
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
                        <Home
                          className="h-4 w-4 text-neutral-500"
                          strokeWidth={1.5}
                        />
                        <span className="font-light text-neutral-600">
                          {project.units_available} unidades
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar
                          className="h-4 w-4 text-neutral-500"
                          strokeWidth={1.5}
                        />
                        <span className="font-light text-neutral-600">
                          {project.delivery_date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-light text-neutral-500">
                          Desde
                        </p>
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
