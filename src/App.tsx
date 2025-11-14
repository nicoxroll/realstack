import { useState, useEffect } from 'react';
import { supabase, Project, PageConfig } from './lib/supabase';
import { Home, User, LogIn, LogOut } from 'lucide-react';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import AllProjects from './components/AllProjects';
import ProjectDetails from './components/ProjectDetails';
import ProjectLanding from './components/ProjectLanding';
import About from './components/About';
import Contact from './components/Contact';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Login from './pages/Login';
import Admin from './pages/Admin';
import UserProfile from './pages/UserProfile';

type View = 'home' | 'login' | 'admin' | 'profile' | 'all-projects' | 'project-landing';

function App() {
  const [view, setView] = useState<View>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      console.log('Usuario autenticado:', user.email);
      
      // Verificar el rol del usuario desde la base de datos
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      console.log('Datos de rol:', roleData, 'Error:', error);
      
      const userIsAdmin = roleData?.role === 'admin';
      console.log('Es admin?', userIsAdmin);
      setIsAdmin(userIsAdmin);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

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

  const handleViewMore = (id: string) => {
    setSelectedProject(null);
    setSelectedProjectId(id);
    setView('project-landing');
    window.scrollTo(0, 0);
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

  const handleAuthClick = () => {
    if (user) {
      // Si está logueado, ir a su perfil correspondiente
      setView(isAdmin ? 'admin' : 'profile');
    } else {
      // Si no está logueado, ir al login
      setView('login');
    }
  };

  const handleLoginSuccess = async () => {
    await checkUser();
    // Esperar un momento para que se actualice el estado
    setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        const isUserAdmin = roleData?.role === 'admin';
        setView(isUserAdmin ? 'admin' : 'profile');
      }
    }, 100);
  };

  if (view === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === 'admin') {
    return <Admin onBackToHome={() => {
      setView('home');
      checkUser();
    }} />;
  }

  if (view === 'profile') {
    return <UserProfile onBackToHome={() => {
      setView('home');
      checkUser();
    }} />;
  }

  if (view === 'project-landing' && selectedProjectId) {
    return (
      <ProjectLanding
        projectId={selectedProjectId}
        onClose={() => {
          setView('home');
          setSelectedProjectId(null);
        }}
      />
    );
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

            {/* Menú de navegación central */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => {
                  setView('home');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
              >
                INICIO
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => setView('all-projects'), 300);
                }}
                className="text-sm font-light tracking-wider text-neutral-900 border-b-2 border-neutral-900"
              >
                PROYECTOS
              </button>
              <button
                onClick={() => {
                  setView('home');
                  setTimeout(() => scrollToSection('nosotros'), 100);
                }}
                className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
              >
                NOSOTROS
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAuthClick}
                className="flex items-center gap-2 text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {user ? (
                  <>
                    <User size={18} />
                    <span>{user.email}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    LOGIN
                  </>
                )}
              </button>

              {user && (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setIsAdmin(false);
                    setView('home');
                  }}
                  className="flex items-center gap-2 text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-red-600"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
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
            onViewMore={() => handleViewMore(selectedProject.id)}
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
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              INICIO
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => handleViewAll(), 300);
              }}
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

          <div className="flex items-center gap-4">
            <button
              onClick={handleAuthClick}
              className="flex items-center gap-2 text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {user ? (
                <>
                  <User size={18} />
                  <span>{user.email}</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  LOGIN
                </>
              )}
            </button>

            {user && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  setIsAdmin(false);
                  setView('home');
                }}
                className="flex items-center gap-2 text-sm font-light tracking-wider text-neutral-600 transition-colors hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
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

          <About />

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
          onViewMore={() => handleViewMore(selectedProject.id)}
        />
      )}
    </div>
  );
}

export default App;
