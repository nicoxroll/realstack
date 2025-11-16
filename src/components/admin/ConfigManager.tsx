import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { PageConfig, supabase } from "../../lib/supabase";

export default function ConfigManager() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase
      .from("page_config")
      .select("*")
      .maybeSingle();

    if (data) {
      setConfig(data);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      await supabase
        .from("page_config")
        .update({
          hero_title: config.hero_title,
          hero_subtitle: config.hero_subtitle,
          contact_email: config.contact_email,
          contact_phone: config.contact_phone,
          maps_embed_url: config.maps_embed_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      setSaveMessage("Configuración guardada correctamente");
    } catch (error) {
      setSaveMessage("Error al guardar la configuración");
      console.error("Error saving config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-center text-sm font-light text-neutral-500">
          Cargando configuración...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-light tracking-wide">
          Configuración de Página
        </h2>
        <p className="mt-2 text-sm font-light text-neutral-600">
          Personaliza los textos y contenido de la página principal
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-light text-neutral-700">
            Título del Hero
          </label>
          <input
            type="text"
            value={config.hero_title}
            onChange={(e) =>
              setConfig({ ...config, hero_title: e.target.value })
            }
            className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-light text-neutral-700">
            Subtítulo del Hero
          </label>
          <input
            type="text"
            value={config.hero_subtitle}
            onChange={(e) =>
              setConfig({ ...config, hero_subtitle: e.target.value })
            }
            className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Email de Contacto
            </label>
            <input
              type="email"
              value={config.contact_email}
              onChange={(e) =>
                setConfig({ ...config, contact_email: e.target.value })
              }
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-neutral-700">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              value={config.contact_phone}
              onChange={(e) =>
                setConfig({ ...config, contact_phone: e.target.value })
              }
              className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-light text-neutral-700">
            URL de Google Maps Embed
          </label>
          <input
            type="text"
            value={config.maps_embed_url || ""}
            onChange={(e) =>
              setConfig({ ...config, maps_embed_url: e.target.value })
            }
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="w-full border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
          />
          <p className="mt-1 text-xs font-light text-neutral-500">
            Para obtener la URL: Ve a Google Maps, busca la ubicación, haz clic
            en "Compartir" {">"} "Insertar un mapa" y copia la URL del iframe
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-neutral-900 px-6 py-3 text-sm tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>

          {saveMessage && (
            <p
              className={`text-sm font-light ${
                saveMessage.includes("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
