import {
  Bath,
  Bed,
  Calendar,
  CalendarClock,
  Check,
  ChevronLeft,
  Heart,
  Home,
  MapPin,
  Maximize2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "../hooks/useNotification";
import { Project, supabase } from "../lib/supabase";
import AppointmentCalendar from "./AppointmentCalendar";

// Declaración de tipos para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface ProjectLandingProps {
  projectId: string;
  onClose: () => void;
}

const defaultGallery = {
  kitchen: [
    "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  bathroom: [
    "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  bedroom: [
    "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  living: [
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

const defaultFloorPlan =
  "https://images.pexels.com/photos/271667/pexels-photo-271667.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function ProjectLanding({
  projectId,
  onClose,
}: ProjectLandingProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [visibleAmbientes, setVisibleAmbientes] = useState<number[]>([]);
  const ambientesRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showAppointmentCalendar, setShowAppointmentCalendar] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { showNotification, NotificationComponent } = useNotification();

  useEffect(() => {
    loadProject();
    checkFavoriteStatus();

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [projectId]);

  useEffect(() => {
    const observers = ambientesRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleAmbientes((prev) => [...new Set([...prev, index])]);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -100px 0px",
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [project]);

  // Cargar mapa si el proyecto tiene coordenadas
  useEffect(() => {
    if (!mapRef.current || !project?.latitude || !project?.longitude) return;

    let mounted = true;

    const loadLeaflet = async () => {
      // @ts-expect-error Leaflet se carga dinámicamente
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!mounted || !mapRef.current) return;

      const L = window.L;

      try {
        if (!mapInstanceRef.current && project.latitude && project.longitude) {
          mapInstanceRef.current = L.map(mapRef.current).setView(
            [project.latitude, project.longitude],
            15
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);

          // Agregar marker por defecto
          L.marker([project.latitude, project.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">${project.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${project.location}</p>
              </div>
            `
            )
            .openPopup();
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [project?.latitude, project?.longitude, project?.name, project?.location]);

  const loadProject = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (data) {
      setProject(data);
    }
  };

  const checkFavoriteStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .maybeSingle();
      setIsFavorite(!!data);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showNotification(
        "Debes iniciar sesión para agregar favoritos",
        "warning"
      );
      return;
    }

    if (isFavorite) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("user_favorites")
        .insert([{ user_id: user.id, project_id: projectId }]);
      setIsFavorite(true);
    }
  };

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-lg font-light text-neutral-600">Cargando...</div>
      </div>
    );
  }

  const gallery =
    project.gallery_images &&
    project.gallery_images.bathroom &&
    project.gallery_images.bathroom.length > 0
      ? project.gallery_images
      : defaultGallery;
  const unitTypes = project.unit_types || [];
  const opacity = Math.max(0, 1 - scrollY / 600);

  return (
    <div className="min-h-screen bg-white">
      {/* Header flotante */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 100
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={onClose}
            className={`flex items-center gap-2 text-sm font-light tracking-wider transition-colors ${
              scrollY > 100 ? "text-neutral-900" : "text-white"
            }`}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            VOLVER
          </button>
        </div>
      </header>

      {/* Hero pantalla completa con parallax */}
      <section className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${project.image_url})`,
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div style={{ opacity }}>
            <h1 className="mb-6 text-5xl font-light tracking-wide text-white md:text-7xl">
              {project.name}
            </h1>
            <div className="mb-4 flex items-center justify-center gap-2 text-xl text-white/90">
              <MapPin className="h-6 w-6" strokeWidth={1.5} />
              <span className="font-light">{project.location}</span>
            </div>
            <div className="text-3xl font-light text-white md:text-4xl">
              Desde USD {project.price_from.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Botones flotantes en hero */}
        <div
          className="absolute bottom-8 right-8 flex gap-4"
          style={{ opacity }}
        >
          <button
            onClick={() => setShowAppointmentCalendar(true)}
            className="flex items-center gap-2 border border-white bg-white px-6 py-4 text-neutral-900 shadow-lg transition-all hover:bg-neutral-900 hover:text-white"
          >
            <CalendarClock className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wider">
              AGENDAR TURNO
            </span>
          </button>

          <button onClick={toggleFavorite} className="p-4 transition-all">
            <Heart
              className={`h-6 w-6 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-white"
              }`}
              strokeWidth={1.5}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white"
          style={{ opacity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-light tracking-wider">
              DESCUBRE MÁS
            </span>
            <div className="h-12 w-px bg-white/60" />
          </div>
        </div>
      </section>

      {/* Información general */}
      <section className="bg-white px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <Home
                className="mx-auto mb-4 h-12 w-12 text-neutral-400"
                strokeWidth={1}
              />
              <p className="mb-2 text-sm font-light text-neutral-500">
                Disponibles
              </p>
              <p className="text-3xl font-light text-neutral-900">
                {project.units_available} de {project.total_units}
              </p>
            </div>
            <div className="text-center">
              <Calendar
                className="mx-auto mb-4 h-12 w-12 text-neutral-400"
                strokeWidth={1}
              />
              <p className="mb-2 text-sm font-light text-neutral-500">
                Entrega
              </p>
              <p className="text-3xl font-light text-neutral-900">
                {project.delivery_date}
              </p>
            </div>
            <div className="text-center">
              <Check
                className="mx-auto mb-4 h-12 w-12 text-neutral-400"
                strokeWidth={1}
              />
              <p className="mb-2 text-sm font-light text-neutral-500">Estado</p>
              <p className="text-3xl font-light capitalize text-neutral-900">
                {project.status}
              </p>
            </div>
          </div>

          <div className="prose prose-lg mx-auto max-w-3xl">
            <p className="text-center font-light leading-relaxed text-neutral-700">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* Galería timeline */}
      <section className="bg-neutral-50 px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
            Ambientes
          </h2>

          <div className="relative">
            {/* Línea vertical central */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-neutral-200 lg:block" />

            <div className="space-y-12">
              {/* Baño */}
              {gallery.bathroom && gallery.bathroom.length > 0 && (
                <div
                  ref={(el) => (ambientesRefs.current[0] = el)}
                  className={`relative flex flex-col items-center gap-8 transition-all duration-1000 lg:flex-row ${
                    visibleAmbientes.includes(0)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="w-full lg:w-5/12">
                    <div className="rounded-sm bg-white p-6 lg:text-right">
                      <h3 className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
                        Baño
                      </h3>
                      <p className="font-light text-neutral-600">
                        Espacios elegantes con acabados premium, diseñados para
                        tu comodidad y relajación diaria. Griferías de primera
                        línea y detalles modernos.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden h-4 w-4 rounded-full border-4 border-white bg-neutral-900 shadow-lg lg:block" />

                  <div className="w-full lg:w-5/12">
                    <div className="grid grid-cols-2 gap-2">
                      {gallery.bathroom.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square overflow-hidden shadow-lg"
                        >
                          <img
                            src={img}
                            alt={`Baño ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cocina */}
              {gallery.kitchen && gallery.kitchen.length > 0 && (
                <div
                  ref={(el) => (ambientesRefs.current[1] = el)}
                  className={`relative flex flex-col items-center gap-8 transition-all duration-1000 lg:flex-row-reverse ${
                    visibleAmbientes.includes(1)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="w-full lg:w-5/12">
                    <div className="rounded-sm bg-white p-6 lg:text-left">
                      <h3 className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
                        Cocina
                      </h3>
                      <p className="font-light text-neutral-600">
                        Amplios espacios equipados con electrodomésticos de
                        última generación y encimeras de calidad. Perfecta para
                        crear momentos inolvidables.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden h-4 w-4 rounded-full border-4 border-white bg-neutral-900 shadow-lg lg:block" />

                  <div className="w-full lg:w-5/12">
                    <div className="grid grid-cols-2 gap-2">
                      {gallery.kitchen.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square overflow-hidden shadow-lg"
                        >
                          <img
                            src={img}
                            alt={`Cocina ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Living */}
              {gallery.living && gallery.living.length > 0 && (
                <div
                  ref={(el) => (ambientesRefs.current[2] = el)}
                  className={`relative flex flex-col items-center gap-8 transition-all duration-1000 lg:flex-row ${
                    visibleAmbientes.includes(2)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="w-full lg:w-5/12">
                    <div className="rounded-sm bg-white p-6 lg:text-right">
                      <h3 className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
                        Living
                      </h3>
                      <p className="font-light text-neutral-600">
                        Sala de estar luminosa y espaciosa, ideal para compartir
                        con familia y amigos. Grandes ventanales y diseño
                        abierto que maximiza la luz natural.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden h-4 w-4 rounded-full border-4 border-white bg-neutral-900 shadow-lg lg:block" />

                  <div className="w-full lg:w-5/12">
                    <div className="grid grid-cols-2 gap-2">
                      {gallery.living.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square overflow-hidden shadow-lg"
                        >
                          <img
                            src={img}
                            alt={`Living ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Habitaciones */}
              {gallery.bedroom && gallery.bedroom.length > 0 && (
                <div
                  ref={(el) => (ambientesRefs.current[3] = el)}
                  className={`relative flex flex-col items-center gap-8 transition-all duration-1000 lg:flex-row-reverse ${
                    visibleAmbientes.includes(3)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="w-full lg:w-5/12">
                    <div className="rounded-sm bg-white p-6 lg:text-left">
                      <h3 className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
                        Habitaciones
                      </h3>
                      <p className="font-light text-neutral-600">
                        Dormitorios diseñados para el descanso perfecto, con
                        closets amplios y acabados que combinan confort y estilo
                        contemporáneo.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden h-4 w-4 rounded-full border-4 border-white bg-neutral-900 shadow-lg lg:block" />

                  <div className="w-full lg:w-5/12">
                    <div className="grid grid-cols-2 gap-2">
                      {gallery.bedroom.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square overflow-hidden shadow-lg"
                        >
                          <img
                            src={img}
                            alt={`Habitación ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      {project.amenities && project.amenities.length > 0 && (
        <section className="bg-white px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
              Características
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {project.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border border-neutral-200 p-4"
                >
                  <Check
                    className="h-5 w-5 flex-shrink-0 text-neutral-600"
                    strokeWidth={1.5}
                  />
                  <span className="font-light text-neutral-900">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galería de imágenes adicionales */}
      {project.additional_images && project.additional_images.length > 0 && (
        <section className="bg-neutral-50 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
              Galería
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.additional_images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={img}
                    alt={`Galería ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plano */}
      <section className="bg-neutral-100 px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
            Plano del Proyecto
          </h2>
          <div className="overflow-hidden shadow-2xl">
            <img
              src={project.floor_plan_url || defaultFloorPlan}
              alt="Plano del proyecto"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* Mapa de ubicación */}
      {project.latitude && project.longitude && (
        <section className="bg-white px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
              Ubicación
            </h2>
            <div
              ref={mapRef}
              className="h-96 w-full rounded-lg border border-neutral-200 shadow-2xl"
            />
          </div>
        </section>
      )}

      {/* Tipos de unidades */}
      {unitTypes.length > 0 && (
        <section className="bg-white px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-4xl font-light tracking-wide text-neutral-900">
              Tipos de Unidades
            </h2>

            {/* Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-4">
              {unitTypes.map((unit, idx) => (
                <button
                  key={unit.id}
                  onClick={() => setActiveTab(idx)}
                  className={`px-8 py-3 text-sm font-light tracking-wider transition-all ${
                    activeTab === idx
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-300 text-neutral-600 hover:border-neutral-900"
                  }`}
                >
                  {unit.name}
                </button>
              ))}
            </div>

            {/* Contenido del tab activo */}
            {unitTypes[activeTab] && (
              <div className="mx-auto max-w-4xl">
                <div className="border border-neutral-200 p-8 md:p-12">
                  <h3 className="mb-8 text-center text-3xl font-light tracking-wide text-neutral-900">
                    {unitTypes[activeTab].name}
                  </h3>

                  <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="text-center">
                      <Bed
                        className="mx-auto mb-3 h-10 w-10 text-neutral-400"
                        strokeWidth={1}
                      />
                      <p className="mb-1 text-sm font-light text-neutral-500">
                        Dormitorios
                      </p>
                      <p className="text-2xl font-light text-neutral-900">
                        {unitTypes[activeTab].bedrooms}
                      </p>
                    </div>
                    <div className="text-center">
                      <Bath
                        className="mx-auto mb-3 h-10 w-10 text-neutral-400"
                        strokeWidth={1}
                      />
                      <p className="mb-1 text-sm font-light text-neutral-500">
                        Baños
                      </p>
                      <p className="text-2xl font-light text-neutral-900">
                        {unitTypes[activeTab].bathrooms}
                      </p>
                    </div>
                    <div className="text-center">
                      <Maximize2
                        className="mx-auto mb-3 h-10 w-10 text-neutral-400"
                        strokeWidth={1}
                      />
                      <p className="mb-1 text-sm font-light text-neutral-500">
                        Área
                      </p>
                      <p className="text-2xl font-light text-neutral-900">
                        {unitTypes[activeTab].area} m²
                      </p>
                    </div>
                    <div className="text-center">
                      <Home
                        className="mx-auto mb-3 h-10 w-10 text-neutral-400"
                        strokeWidth={1}
                      />
                      <p className="mb-1 text-sm font-light text-neutral-500">
                        Precio
                      </p>
                      <p className="text-2xl font-light text-neutral-900">
                        ${unitTypes[activeTab].price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-8 text-center">
                    <p className="mb-6 font-light leading-relaxed text-neutral-700">
                      Unidad perfectamente diseñada con acabados de primera
                      calidad y distribución óptima de espacios.
                    </p>
                    <button className="bg-neutral-900 px-12 py-4 text-sm font-light tracking-wider text-white transition-all hover:bg-neutral-800">
                      CONSULTAR DISPONIBILIDAD
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="bg-neutral-900 px-6 py-24 text-white md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-light tracking-wide md:text-5xl">
            ¿Interesado en {project.name}?
          </h2>
          <p className="mb-8 text-lg font-light text-white/80">
            Contáctanos para más información y agenda tu visita
          </p>
          <button
            onClick={() => {
              onClose();
              setTimeout(() => {
                document.getElementById("contact")?.scrollIntoView();
              }, 300);
            }}
            className="border border-white bg-white px-12 py-4 text-sm font-light tracking-wider text-neutral-900 transition-all hover:bg-transparent hover:text-white"
          >
            CONTACTAR
          </button>
        </div>
      </section>

      {/* Modal de calendario para agendar turno */}
      {showAppointmentCalendar && project && (
        <AppointmentCalendar
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowAppointmentCalendar(false)}
        />
      )}
      {NotificationComponent}
    </div>
  );
}
