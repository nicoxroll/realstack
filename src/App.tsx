import { useState, useEffect } from 'react';
import { supabase, Project, PageConfig } from './lib/supabase';
import { Home } from 'lucide-react';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import AllProjects from './components/AllProjects';
import ProjectDetails from './components/ProjectDetails';
import About from './components/About';
import Contact from './components/Contact';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Admin from './pages/Admin';

type View = 'home' | 'admin' | 'all-projects';

function App() {
  const [view, setView] = useState<View>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<PageConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [projectsRes, configRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('page_config').select('*').maybeSingle(),
    ]);

    if (projectsRes.data) {
      setProjects(projectsRes.data);
      setFeaturedProjects(projectsRes.data.filter((p) => p.is_featured).slice(0, 6));
    }

    if (configRes.data) {
      setConfig(configRes.data);
    }
  };

  const handleViewDetails = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleViewAll = () => {
    setView('all-projects');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // altura del header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (view === 'admin') {
    return <Admin onBackToHome={() => setView('home')} />;
  }

  if (view === 'all-projects') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-xl font-light tracking-widest text-neutral-900 transition-colors hover:text-neutral-600"
            >
              <Home size={24} />
              REAL ESTATE
            </button>
            <button
              onClick={() => setView('admin')}
              className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              ADMIN
            </button>
          </div>
        </nav>

        <div className="pt-20">
          <AllProjects projects={projects} onViewDetails={handleViewDetails} />
        </div>

        {config && (
          <Footer email={config.contact_email} phone={config.contact_phone} />
        )}

        {selectedProject && (
          <ProjectDetails
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-xl font-light tracking-widest text-neutral-900 transition-colors hover:text-neutral-600"
          >
            <Home size={24} />
            REAL ESTATE
          </button>
          
          {/* Menú de navegación central */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('inicio')}
              className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              INICIO
            </button>
            <button
              onClick={handleViewAll}
              className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              PROYECTOS
            </button>
            <button
              onClick={() => scrollToSection('nosotros')}
              className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              NOSOTROS
            </button>
          </div>

          <button
            onClick={() => setView('admin')}
            className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
          >
            ADMIN
          </button>
        </div>
      </nav>

      {config && (
        <>
          <div id="inicio">
            <Hero title={config.hero_title} subtitle={config.hero_subtitle} />
          </div>

          {featuredProjects.length > 0 && (
            <FeaturedProjects
              projects={featuredProjects}
              onViewAll={handleViewAll}
              onViewDetails={handleViewDetails}
            />
          )}

          <About
            email={config.contact_email}
            phone={config.contact_phone}
            mapsUrl={config.maps_embed_url}
          />

          <Newsletter />

          <Contact
            email={config.contact_email}
            phone={config.contact_phone}
            mapsUrl={config.maps_embed_url}
          />

          <Footer email={config.contact_email} phone={config.contact_phone} />
        </>
      )}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default App;
