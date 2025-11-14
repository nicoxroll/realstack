import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import { Home, Heart, Calendar, LogOut, Trash2 } from 'lucide-react';

interface UserProfileProps {
  onBackToHome: () => void;
}

interface Favorite {
  id: string;
  project_id: string;
  created_at: string;
}

interface Visit {
  id: string;
  project_id: string;
  visit_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function UserProfile({ onBackToHome }: UserProfileProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'visits'>('favorites');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      loadFavorites(user.id);
      loadVisits(user.id);
      loadProjects();
    }
  };

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    if (data) setProjects(data);
  };

  const loadFavorites = async (userId: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setFavorites(data);
  };

  const loadVisits = async (userId: string) => {
    const { data } = await supabase
      .from('user_visits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setVisits(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBackToHome();
  };

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from('user_favorites').delete().eq('id', favoriteId);
    if (user) loadFavorites(user.id);
  };

  const removeVisit = async (visitId: string) => {
    await supabase.from('user_visits').delete().eq('id', visitId);
    if (user) loadVisits(user.id);
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-light tracking-wide text-neutral-900">
            Mi Perfil
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-light text-neutral-600">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-neutral-300 px-6 py-2 text-sm tracking-wider text-red-600 transition-all hover:border-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              CERRAR SESIÓN
            </button>
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 border border-neutral-300 px-6 py-2 text-sm tracking-wider transition-all hover:border-neutral-900"
            >
              <Home className="h-4 w-4" strokeWidth={1.5} />
              VOLVER AL SITIO
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider transition-all ${
              activeTab === 'favorites'
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            MIS FAVORITOS
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider transition-all ${
              activeTab === 'visits'
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-300 text-neutral-600 hover:border-neutral-900'
            }`}
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            VISITAS PENDIENTES
          </button>
        </div>

        {activeTab === 'favorites' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-light tracking-wide">
              Proyectos Favoritos
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => {
                const project = getProject(favorite.project_id);
                if (!project) return null;

                return (
                  <div
                    key={favorite.id}
                    className="border border-neutral-200 transition-all hover:border-neutral-400"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 text-lg font-light">{project.name}</h3>
                      <p className="mb-2 text-sm font-light text-neutral-600">
                        {project.location}
                      </p>
                      <p className="mb-4 text-lg font-light">
                        USD {project.price_from.toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="flex w-full items-center justify-center gap-2 border border-red-600 px-4 py-2 text-sm text-red-600 transition-all hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        QUITAR DE FAVORITOS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {favorites.length === 0 && (
              <p className="py-8 text-center text-sm font-light text-neutral-500">
                No tienes proyectos favoritos aún
              </p>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-light tracking-wide">
              Visitas Pendientes
            </h2>
            <div className="space-y-4">
              {visits.map((visit) => {
                const project = getProject(visit.project_id);
                if (!project) return null;

                return (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between border border-neutral-200 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-32 overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-light">{project.name}</h3>
                        <p className="text-sm font-light text-neutral-600">
                          {project.location}
                        </p>
                        {visit.visit_date && (
                          <p className="mt-1 text-sm font-light text-neutral-500">
                            Fecha: {new Date(visit.visit_date).toLocaleDateString('es-AR')}
                          </p>
                        )}
                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-light ${
                            visit.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : visit.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {visit.status === 'completed'
                            ? 'Completada'
                            : visit.status === 'cancelled'
                            ? 'Cancelada'
                            : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeVisit(visit.id)}
                      className="p-2 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
            {visits.length === 0 && (
              <p className="py-8 text-center text-sm font-light text-neutral-500">
                No tienes visitas pendientes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
