import { Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

interface ContactProps {
  email: string;
  phone: string;
  mapsUrl?: string;
}

export default function Contact({ email, phone, mapsUrl }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const { error } = await supabase.from("clients").insert([formData]);

      if (error) throw error;

      setSubmitMessage(
        "Mensaje enviado correctamente. Nos contactaremos pronto."
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setSubmitMessage(
        "Error al enviar el mensaje. Por favor intente nuevamente."
      );
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-neutral-100 px-6 py-24 text-neutral-900 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide md:text-5xl">
            Contáctanos
          </h2>
          <div className="mx-auto h-px w-24 bg-neutral-400" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-8 text-2xl font-light tracking-wide">
              Información de Contacto
            </h3>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-neutral-900">
                <Mail className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-light text-neutral-500">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="font-light transition-colors hover:text-neutral-600"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="mb-12 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-neutral-900">
                <Phone className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-light text-neutral-500">Teléfono</p>
                <a
                  href={`tel:${phone}`}
                  className="font-light transition-colors hover:text-neutral-600"
                >
                  {phone}
                </a>
              </div>
            </div>

            {mapsUrl && (
              <div className="aspect-video w-full overflow-hidden border border-neutral-300">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación"
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-8 text-2xl font-light tracking-wide">
              Envíanos un Mensaje
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full border border-neutral-300 bg-white px-6 py-4 font-light text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full border border-neutral-300 bg-white px-6 py-4 font-light text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-neutral-300 bg-white px-6 py-4 font-light text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  placeholder="Mensaje"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full resize-none border border-neutral-300 bg-white px-6 py-4 font-light text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 bg-neutral-900 px-8 py-4 text-sm tracking-wider text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {submitMessage && (
                <p
                  className={`text-center text-sm font-light ${
                    submitMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
