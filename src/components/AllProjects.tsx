import { useState, useEffect } from 'react';
import { MapPin, Calendar, Home, ChevronDown } from 'lucide-react';
import { Project } from '../lib/supabase';

interface AllProjectsProps {
  projects: Project[];
  onViewDetails: (id: string) => void;
}

export default function AllProjects({ projects, onViewDetails }: AllProjectsProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            const projectsSection = document.getElementById('projects-grid');
            projectsSection?.scrollIntoView({ behavior: 'smooth' });
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
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((project) => (
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
      </div>
    </section>
    </>
  );
}
