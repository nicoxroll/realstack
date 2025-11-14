import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

// Declaración de tipos para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default function MapPicker({ 
  latitude, 
  longitude, 
  onLocationSelect, 
  onClose 
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    const loadLeaflet = async () => {
      // @ts-expect-error Leaflet se carga dinámicamente
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!mounted || !mapRef.current) return;

      const L = window.L;

      if (!mapInstanceRef.current) {
        // Crear mapa centrado en Buenos Aires por defecto
        const defaultLat = latitude || -34.603722;
        const defaultLng = longitude || -58.381592;

        try {
          mapInstanceRef.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);

          // Si hay coordenadas iniciales, crear marker
          if (latitude && longitude) {
            markerRef.current = L.marker([latitude, longitude], {
              draggable: true,
            }).addTo(mapInstanceRef.current);

            markerRef.current.on('dragend', () => {
              const pos = markerRef.current.getLatLng();
              setSelectedCoords({ lat: pos.lat, lng: pos.lng });
            });
          }

          // Click en el mapa para colocar/mover marker
          mapInstanceRef.current.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], {
                draggable: true,
              }).addTo(mapInstanceRef.current);

              markerRef.current.on('dragend', () => {
                const pos = markerRef.current.getLatLng();
                setSelectedCoords({ lat: pos.lat, lng: pos.lng });
              });
            }

            setSelectedCoords({ lat, lng });
          });
        } catch (error) {
          console.error('Error loading map:', error);
        }
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
  }, [latitude, longitude]);

  const handleSearchAddress = async () => {
    if (!address.trim()) return;

    setSearching(true);

    try {
      // Usar Nominatim API de OpenStreetMap para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);

        // Centrar mapa en la ubicación encontrada
        mapInstanceRef.current?.setView([latNum, lngNum], 15);

        // Crear o mover marker
        const L = window.L;
        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum]);
        } else {
          markerRef.current = L.marker([latNum, lngNum], {
            draggable: true,
          }).addTo(mapInstanceRef.current);

          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            setSelectedCoords({ lat: pos.lat, lng: pos.lng });
          });
        }

        setSelectedCoords({ lat: latNum, lng: lngNum });
      } else {
        alert('No se encontró la dirección. Intente con otra búsqueda.');
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
      alert('Error al buscar la dirección');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng);
    }
  }, [selectedCoords]);

  return (
    <div>

        {/* Buscador de dirección */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
              placeholder="Buscar dirección (ej: Av. Corrientes 1234, Buenos Aires)"
              className="w-full border border-neutral-300 py-2 pl-10 pr-4 focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearchAddress}
            disabled={searching}
            className="border border-neutral-900 bg-neutral-900 px-6 py-2 text-sm tracking-wider text-white transition-all hover:bg-transparent hover:text-neutral-900 disabled:opacity-50"
          >
            {searching ? 'BUSCANDO...' : 'BUSCAR'}
          </button>
        </div>

        <p className="mb-4 text-sm font-light text-neutral-600">
          Haz click en el mapa para seleccionar la ubicación exacta, o arrastra el marcador.
        </p>

        {/* Mapa */}
        <div 
          ref={mapRef} 
          className="mb-4 h-96 w-full border border-neutral-200"
        />

        {/* Coordenadas seleccionadas */}
        {selectedCoords && (
          <div className="mt-3 flex items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-3 py-2">
            <MapPin className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
            <p className="text-xs font-light text-neutral-600">
              <span className="font-normal">Lat:</span> {selectedCoords.lat.toFixed(6)} | 
              <span className="font-normal ml-2">Lng:</span> {selectedCoords.lng.toFixed(6)}
            </p>
          </div>
        )}
    </div>
  );
}
