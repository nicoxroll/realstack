import { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactProps {
  email: string;
  phone: string;
  mapsUrl?: string;
}

export default function Contact({ email, phone, mapsUrl }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { error } = await supabase.from('clients').insert([formData]);

      if (error) throw error;

      setSubmitMessage('Mensaje enviado correctamente. Nos contactaremos pronto.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSubmitMessage('Error al enviar el mensaje. Por favor intente nuevamente.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-neutral-900 px-6 py-24 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide md:text-5xl">
            Contáctanos
          </h2>
          <div className="mx-auto h-px w-24 bg-neutral-500" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-8 text-2xl font-light tracking-wide">
              Información de Contacto
            </h3>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-white/10">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-light text-white/60">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="font-light transition-colors hover:text-white/80"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="mb-12 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-white/10">
                <Phone className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-light text-white/60">Teléfono</p>
                <a
                  href={`tel:${phone}`}
                  className="font-light transition-colors hover:text-white/80"
                >
                  {phone}
                </a>
              </div>
            </div>

            {mapsUrl && (
              <div className="aspect-video w-full overflow-hidden border border-white/10">
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-white/20 bg-transparent px-6 py-4 font-light text-white placeholder-white/40 transition-colors focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border border-white/20 bg-transparent px-6 py-4 font-light text-white placeholder-white/40 transition-colors focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-white/20 bg-transparent px-6 py-4 font-light text-white placeholder-white/40 transition-colors focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  placeholder="Mensaje"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full resize-none border border-white/20 bg-transparent px-6 py-4 font-light text-white placeholder-white/40 transition-colors focus:border-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 border border-white bg-white px-8 py-4 text-sm tracking-wider text-neutral-900 transition-all hover:bg-transparent hover:text-white disabled:opacity-50"
              >
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {submitMessage && (
                <p className={`text-center text-sm font-light ${submitMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
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
