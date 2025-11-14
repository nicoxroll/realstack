import { MapPin, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Project } from "../lib/supabase";

// Declaración de tipos para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface ProjectsMapProps {
  projects: Project[];
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onClose?: () => void;
}

export default function ProjectsMap({
  projects,
  selectedProjectId,
  onProjectSelect,
  onClose,
}: ProjectsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filtrar proyectos que tienen coordenadas
  const projectsWithCoords = projects.filter((p) => p.latitude && p.longitude);

  useEffect(() => {
    if (!mapRef.current || projectsWithCoords.length === 0) return;

    let mounted = true;

    // Lazy load Leaflet
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

      // @ts-expect-error Leaflet se carga dinámicamente
      const L = window.L;

      try {
        if (!mapInstanceRef.current) {
          // Crear mapa centrado en el promedio de las ubicaciones
          const avgLat =
            projectsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) /
            projectsWithCoords.length;
          const avgLng =
            projectsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) /
            projectsWithCoords.length;

          mapInstanceRef.current = L.map(mapRef.current).setView(
            [avgLat, avgLng],
            12
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);
        }

        // Limpiar markers anteriores
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Crear markers para cada proyecto
        projectsWithCoords.forEach((project) => {
          if (!project.latitude || !project.longitude) return;

          const isSelected = project.id === selectedProjectId;

          // Crear marker con pin por defecto
          const marker = L.marker([project.latitude, project.longitude])
            .addTo(mapInstanceRef.current)
            .on("click", () => onProjectSelect(project.id));

          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">${
                project.name
              }</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${
                project.location
              }</p>
              <p style="margin: 0; font-size: 14px; font-weight: 500;">USD ${project.price_from.toLocaleString()}</p>
            </div>
          `;

          marker.bindPopup(popupContent);

          if (isSelected) {
            marker.openPopup();
            mapInstanceRef.current.setView(
              [project.latitude, project.longitude],
              14
            );
          }

          markersRef.current.push(marker);
        });
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
  }, [projectsWithCoords.length, selectedProjectId]);

  if (projectsWithCoords.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="text-center">
          <MapPin
            className="mx-auto mb-4 h-12 w-12 text-neutral-400"
            strokeWidth={1.5}
          />
          <p className="text-sm font-light text-neutral-600">
            No hay proyectos con ubicación disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-0">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white p-2 shadow-lg transition-colors hover:bg-neutral-100"
          aria-label="Cerrar mapa"
        >
          <X className="h-5 w-5 text-neutral-900" strokeWidth={1.5} />
        </button>
      )}
      <div
        ref={mapRef}
        className="h-96 w-full rounded-lg border border-neutral-200"
        style={{ minHeight: "400px", position: "relative", zIndex: 0 }}
      />
    </div>
  );
}
