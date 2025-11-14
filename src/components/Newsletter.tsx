import { Check, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const { error } = await supabase.from("clients").insert([
        {
          email,
          name: "Suscriptor Newsletter",
          phone: "",
          message: "Suscripción a newsletter",
        },
      ]);

      if (error) throw error;

      setSubmitMessage(
        "¡Gracias por suscribirte! Pronto recibirás nuestras novedades."
      );
      setEmail("");
    } catch (error) {
      setSubmitMessage("Error al suscribirse. Por favor intente nuevamente.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="relative h-[500px] overflow-hidden">
      {/* Imagen de fondo con parallax */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide text-white md:text-5xl">
            Mantente Informado
          </h2>
          <div className="mx-auto mb-6 h-px w-24 bg-white/40" />
          <p className="mb-8 text-lg font-light leading-relaxed text-white/90">
            Suscríbete a nuestro newsletter y recibe las últimas novedades sobre
            nuestros proyectos exclusivos y oportunidades de inversión.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto max-w-md">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 border border-white/30 bg-white/10 px-6 py-4 font-light text-white placeholder-white/60 backdrop-blur-md transition-all focus:border-white/60 focus:bg-white/20 focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 border border-white bg-white px-8 py-4 font-light tracking-wider text-neutral-900 transition-all hover:bg-transparent hover:text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  "ENVIANDO..."
                ) : (
                  <>
                    SUSCRIBIRSE
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>

            {submitMessage && (
              <div
                className={`mt-4 flex items-center justify-center gap-2 rounded-sm p-4 backdrop-blur-md ${
                  submitMessage.includes("Error")
                    ? "bg-red-500/20 text-red-100"
                    : "bg-green-500/20 text-green-100"
                }`}
              >
                {!submitMessage.includes("Error") && (
                  <Check className="h-5 w-5" strokeWidth={1.5} />
                )}
                <p className="text-sm font-light">{submitMessage}</p>
              </div>
            )}
          </form>

          <p className="mt-6 text-sm font-light text-white/60">
            No compartimos tu información. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
}
