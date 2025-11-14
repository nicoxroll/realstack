import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AboutProps {
  email: string;
  phone: string;
  mapsUrl?: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '2010',
    title: 'Fundación',
    description: 'Iniciamos nuestro camino en el sector inmobiliario con una visión clara de excelencia.',
    image: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2015',
    title: 'Expansión Regional',
    description: 'Ampliamos nuestra presencia a múltiples ciudades, consolidando nuestro liderazgo.',
    image: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2020',
    title: 'Innovación Digital',
    description: 'Implementamos tecnología de punta para mejorar la experiencia de nuestros clientes.',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    year: '2025',
    title: 'Líderes del Mercado',
    description: 'Reconocidos como referentes en desarrollo inmobiliario sostenible y de lujo.',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function About({ email, phone, mapsUrl }: AboutProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = timelineRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => [...new Set([...prev, index])]);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

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
    <section id="nosotros" className="bg-white px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide text-neutral-900 md:text-5xl">
            Nosotros
          </h2>
          <div className="mx-auto h-px w-24 bg-neutral-300" />
          <p className="mx-auto mt-8 max-w-2xl text-lg font-light text-neutral-600">
            Con más de 15 años de experiencia, hemos construido un legado de excelencia
            en el desarrollo inmobiliario de lujo.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <h3 className="mb-12 text-center text-3xl font-light tracking-wide text-neutral-900">
            Nuestra Historia
          </h3>
          <div className="relative">
            {/* Línea vertical central */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-neutral-200 lg:block" />

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div
                  key={event.year}
                  ref={(el) => (timelineRefs.current[index] = el)}
                  className={`relative flex flex-col items-center gap-8 transition-all duration-1000 lg:flex-row ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } ${
                    visibleItems.includes(index)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {/* Contenido */}
                  <div className="w-full lg:w-5/12">
                    <div
                      className={`rounded-sm bg-neutral-50 p-6 ${
                        index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'
                      }`}
                    >
                      <div className="mb-2 text-sm font-light tracking-widest text-neutral-400">
                        {event.year}
                      </div>
                      <h4 className="mb-3 text-xl font-light tracking-wide text-neutral-900">
                        {event.title}
                      </h4>
                      <p className="font-light text-neutral-600">{event.description}</p>
                    </div>
                  </div>

                  {/* Punto central */}
                  <div className="relative z-10 hidden h-4 w-4 rounded-full border-4 border-white bg-neutral-900 shadow-lg lg:block" />

                  {/* Imagen */}
                  <div className="w-full lg:w-5/12">
                    <div className="aspect-video overflow-hidden rounded-sm shadow-lg">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario y Mapa */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Formulario */}
          <div>
            <h3 className="mb-8 text-2xl font-light tracking-wide text-neutral-900">
              Envíanos un Mensaje
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  NOMBRE
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  TELÉFONO
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-light tracking-wider text-neutral-700"
                >
                  MENSAJE
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none border border-neutral-300 bg-white px-4 py-3 font-light text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 bg-neutral-900 px-8 py-4 font-light tracking-wider text-white transition-all hover:bg-neutral-800 disabled:bg-neutral-400"
              >
                {isSubmitting ? (
                  'ENVIANDO...'
                ) : (
                  <>
                    ENVIAR MENSAJE
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </button>

              {submitMessage && (
                <div
                  className={`flex items-center gap-2 rounded-sm p-4 ${
                    submitMessage.includes('Error')
                      ? 'bg-red-50 text-red-800'
                      : 'bg-green-50 text-green-800'
                  }`}
                >
                  {!submitMessage.includes('Error') && (
                    <Check className="h-5 w-5" strokeWidth={1.5} />
                  )}
                  <p className="text-sm font-light">{submitMessage}</p>
                </div>
              )}
            </form>
          </div>

          {/* Información de contacto y mapa */}
          <div>
            <h3 className="mb-8 text-2xl font-light tracking-wide text-neutral-900">
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
                  className="font-light text-neutral-900 transition-colors hover:text-neutral-600"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-neutral-900">
                <Phone className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-light text-neutral-500">Teléfono</p>
                <a
                  href={`tel:${phone}`}
                  className="font-light text-neutral-900 transition-colors hover:text-neutral-600"
                >
                  {phone}
                </a>
              </div>
            </div>

            {mapsUrl && (
              <div className="aspect-video w-full overflow-hidden border border-neutral-200 shadow-md">
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
        </div>
      </div>
    </section>
  );
}
