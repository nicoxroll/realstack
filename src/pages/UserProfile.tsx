import {
  Calendar,
  Heart,
  Home,
  Loader,
  LogOut,
  Menu,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import AppointmentCalendar from "../components/AppointmentCalendar";
import { useConfirm } from "../hooks/useConfirm";
import { useNotification } from "../hooks/useNotification";
import { Project, supabase } from "../lib/supabase";

interface UserProfileProps {
  onBackToHome: () => void;
  onViewProject: (projectId: string) => void;
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

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
}

export default function UserProfile({
  onBackToHome,
  onViewProject,
}: UserProfileProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });
  const [activeTab, setActiveTab] = useState<"favorites" | "visits" | "profile">(
    "favorites"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const { showNotification, NotificationComponent } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProfile(user.id);
      if (activeTab === "favorites") {
        loadFavorites(user.id);
      } else if (activeTab === "visits") {
        loadVisits(user.id);
      }
    }
  }, [activeTab, user]);

  const loadUserData = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await loadProjects();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onBackToHome(); // Si no hay usuario, volver al home
    }
  };

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("*");
    if (data) setProjects(data);
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
      setProfileForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      phone: profileForm.phone,
      address: profileForm.address,
    });

    if (error) {
      showNotification("Error al guardar el perfil", "error");
    } else {
      showNotification("Perfil actualizado exitosamente", "success");
      setIsEditingProfile(false);
      loadUserProfile(user.id);
    }
  };

  const loadFavorites = async (userId: string) => {
    setIsLoadingFavorites(true);
    const { data } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTimeout(() => {
      if (data) setFavorites(data);
      setIsLoadingFavorites(false);
    }, 1000); // Simula 1 segundo de carga
  };

  const loadVisits = async (userId: string) => {
    setIsLoadingVisits(true);
    const { data } = await supabase
      .from("user_visits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setVisits(data);
    setIsLoadingVisits(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBackToHome();
  };

  const removeFavorite = async (favoriteId: string) => {
    const confirmed = await confirm({
      message: "¿Estás seguro de que deseas quitar este proyecto de favoritos?",
      confirmText: "SÍ, QUITAR",
      cancelText: "NO",
    });

    if (!confirmed) return;

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      showNotification("Error al quitar de favoritos", "error");
    } else {
      showNotification("Proyecto eliminado de favoritos", "success");
      if (user) loadFavorites(user.id);
    }
  };

  const removeVisit = async (visitId: string) => {
    const confirmed = await confirm({
      message: "¿Estás seguro de que deseas cancelar esta visita?",
      confirmText: "SÍ, CANCELAR",
      cancelText: "NO",
    });

    if (!confirmed) return;

    const { error } = await supabase
      .from("user_visits")
      .delete()
      .eq("id", visitId);

    if (error) {
      showNotification("Error al cancelar la visita", "error");
    } else {
      showNotification("Visita cancelada exitosamente", "success");
      if (user) loadVisits(user.id);
    }
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Loader className="h-12 w-12 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl md:text-2xl font-light tracking-wide text-neutral-900">
            Mi Perfil
          </h1>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="flex flex-col p-4 space-y-3">
              <div className="pb-3 border-b border-neutral-200">
                <span className="text-sm font-light text-neutral-600">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => {
                  onBackToHome();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 border border-neutral-300 px-4 py-3 text-sm tracking-wider transition-all hover:border-neutral-900"
              >
                <Home className="h-4 w-4" strokeWidth={1.5} />
                VOLVER AL SITIO
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 border border-neutral-300 px-4 py-3 text-sm tracking-wider text-red-600 transition-all hover:border-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider transition-all ${
              activeTab === "favorites"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-600 hover:border-neutral-900"
            }`}
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            MIS FAVORITOS
          </button>
          <button
            onClick={() => setActiveTab("visits")}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider transition-all ${
              activeTab === "visits"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-600 hover:border-neutral-900"
            }`}
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            VISITAS PENDIENTES
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-wider transition-all ${
              activeTab === "profile"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-600 hover:border-neutral-900"
            }`}
          >
            <User className="h-4 w-4" strokeWidth={1.5} />
            MIS DATOS
          </button>
        </div>

        {activeTab === "favorites" && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-light tracking-wide">
              Proyectos Favoritos
            </h2>
            {isLoadingFavorites ? (
              <div className="flex justify-center items-center py-16">
                <Loader className="h-8 w-8 animate-spin text-neutral-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((favorite) => {
                    const project = getProject(favorite.project_id);
                    if (!project) return null;

                    return (
                      <div
                        key={favorite.id}
                        className="group cursor-pointer overflow-hidden border border-neutral-200 transition-all hover:border-neutral-400 hover:shadow-lg"
                        onClick={() => onViewProject(project.id)}
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={project.image_url}
                            alt={project.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="mb-2 text-lg font-light">
                            {project.name}
                          </h3>
                          <p className="mb-2 text-sm font-light text-neutral-600">
                            {project.location}
                          </p>
                          <p className="mb-4 text-lg font-light">
                            USD {project.price_from.toLocaleString()}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(favorite.id);
                            }}
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
              </>
            )}
          </div>
        )}

        {activeTab === "visits" && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-light tracking-wide">
              Visitas Pendientes
            </h2>
            {isLoadingVisits ? (
              <div className="flex justify-center items-center py-16">
                <Loader className="h-8 w-8 animate-spin text-neutral-500" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {visits.map((visit) => {
                    const project = getProject(visit.project_id);
                    if (!project) return null;

                    return (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                        onClick={() => setEditingVisit(visit)}
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
                            <h3 className="mb-1 text-lg font-light">
                              {project.name}
                            </h3>
                            <p className="text-sm font-light text-neutral-600">
                              {project.location}
                            </p>
                            {visit.visit_date && (
                              <p className="mt-1 text-sm font-light text-neutral-500">
                                Fecha:{" "}
                                {new Date(visit.visit_date).toLocaleDateString(
                                  "es-AR"
                                )}
                              </p>
                            )}
                            {visit.notes && (
                              <p className="mt-1 text-xs font-light text-neutral-400">
                                {visit.notes}
                              </p>
                            )}
                            <span
                              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-light ${
                                visit.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : visit.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {visit.status === "completed"
                                ? "Completada"
                                : visit.status === "cancelled"
                                ? "Cancelada"
                                : "Pendiente"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVisit(visit.id);
                          }}
                          className="p-2 hover:bg-red-50"
                        >
                          <Trash2
                            className="h-4 w-4 text-red-600"
                            strokeWidth={1.5}
                          />
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
              </>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-light tracking-wide">
                Datos Personales
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="border border-neutral-900 px-6 py-2 text-sm tracking-wider transition-all hover:bg-neutral-900 hover:text-white"
                >
                  EDITAR
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-light tracking-wider text-neutral-700">
                    NOMBRE
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, first_name: e.target.value })
                      }
                      className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <p className="px-4 py-3 font-light text-neutral-900">
                      {userProfile?.first_name || "No especificado"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-light tracking-wider text-neutral-700">
                    APELLIDO
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, last_name: e.target.value })
                      }
                      className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                      placeholder="Tu apellido"
                    />
                  ) : (
                    <p className="px-4 py-3 font-light text-neutral-900">
                      {userProfile?.last_name || "No especificado"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-light tracking-wider text-neutral-700">
                  EMAIL
                </label>
                <p className="px-4 py-3 font-light text-neutral-500 bg-neutral-50">
                  {user?.email} (no editable)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-light tracking-wider text-neutral-700">
                  TELÉFONO
                </label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                    placeholder="+54 9 11 1234-5678"
                  />
                ) : (
                  <p className="px-4 py-3 font-light text-neutral-900">
                    {userProfile?.phone || "No especificado"}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-light tracking-wider text-neutral-700">
                  DIRECCIÓN
                </label>
                {isEditingProfile ? (
                  <textarea
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, address: e.target.value })
                    }
                    className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                    placeholder="Tu dirección completa"
                    rows={3}
                  />
                ) : (
                  <p className="px-4 py-3 font-light text-neutral-900">
                    {userProfile?.address || "No especificado"}
                  </p>
                )}
              </div>

              {isEditingProfile && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-neutral-900 px-6 py-3 text-sm tracking-wider text-white transition-all hover:bg-neutral-800"
                  >
                    GUARDAR CAMBIOS
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        first_name: userProfile?.first_name || "",
                        last_name: userProfile?.last_name || "",
                        phone: userProfile?.phone || "",
                        address: userProfile?.address || "",
                      });
                    }}
                    className="flex-1 border border-neutral-300 px-6 py-3 text-sm tracking-wider transition-all hover:border-neutral-900"
                  >
                    CANCELAR
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {NotificationComponent}
      {ConfirmComponent}

      {editingVisit &&
        (() => {
          const project = getProject(editingVisit.project_id);
          if (!project) return null;

          // Extraer el horario de las notas si existe
          const timeMatch = editingVisit.notes?.match(/(\d{2}:\d{2})/);
          const existingTime = timeMatch ? timeMatch[1] : undefined;

          return (
            <AppointmentCalendar
              projectId={editingVisit.project_id}
              projectName={project.name}
              existingVisitId={editingVisit.id}
              existingDate={editingVisit.visit_date || undefined}
              existingTime={existingTime}
              onClose={() => {
                setEditingVisit(null);
                if (user) loadVisits(user.id);
              }}
            />
          );
        })()}
    </div>
  );
}
