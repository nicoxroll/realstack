import { useState, useEffect } from 'react';
import { supabase, Project, PageConfig } from './lib/supabase';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import AllProjects from './components/AllProjects';
import ProjectDetails from './components/ProjectDetails';
import Contact from './components/Contact';
import Admin from './pages/Admin';

type View = 'home' | 'admin';

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
    document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (view === 'admin') {
    return <Admin onBackToHome={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-light tracking-widest text-neutral-900">
            REAL ESTATE
          </h1>
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
          <Hero title={config.hero_title} subtitle={config.hero_subtitle} />

          {featuredProjects.length > 0 && (
            <FeaturedProjects
              projects={featuredProjects}
              onViewAll={handleViewAll}
              onViewDetails={handleViewDetails}
            />
          )}

          {projects.length > 0 && (
            <AllProjects projects={projects} onViewDetails={handleViewDetails} />
          )}

          <Contact
            email={config.contact_email}
            phone={config.contact_phone}
            mapsUrl={config.maps_embed_url}
          />
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
