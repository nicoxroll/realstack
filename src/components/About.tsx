import { useState, useEffect, useRef } from 'react';

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

export default function About() {
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

  return (
    <section id="nosotros" className="bg-white px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-wide text-neutral-900 md:text-5xl">
            Nosotros
          </h2>
          <div className="mx-auto h-px w-24 bg-neutral-300" />
        </div>

        {/* Quiénes Somos con Imagen */}
        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h3 className="mb-6 text-3xl font-light tracking-wide text-neutral-900">
              Quiénes Somos
            </h3>
            <div className="space-y-4 text-lg font-light leading-relaxed text-neutral-700">
              <p>
                Somos una empresa líder en el sector inmobiliario con más de 15 años de 
                experiencia en el desarrollo de proyectos residenciales y comerciales de lujo. 
                Nuestra misión es transformar espacios en hogares y oportunidades de inversión 
                excepcionales.
              </p>
              <p>
                Nos especializamos en crear comunidades sostenibles que combinan diseño 
                arquitectónico innovador, tecnología de vanguardia y un compromiso inquebrantable 
                con la calidad. Cada proyecto refleja nuestra pasión por la excelencia y nuestra 
                dedicación a superar las expectativas de nuestros clientes.
              </p>
              <p>
                Con un equipo multidisciplinario de expertos en arquitectura, ingeniería, diseño 
                y gestión de proyectos, garantizamos que cada desarrollo inmobiliario no solo 
                cumpla con los más altos estándares de construcción, sino que también ofrezca 
                un valor excepcional a largo plazo.
              </p>
              <p className="font-medium text-neutral-900">
                Nuestra visión es ser el referente en desarrollo inmobiliario sostenible, 
                creando espacios que mejoren la calidad de vida de las personas y comunidades.
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="aspect-[4/5] w-full overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Edificio moderno"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-24">
          <h3 className="mb-12 text-center text-3xl font-light tracking-wide text-neutral-900">
            Nuestros Valores
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 aspect-square w-full max-w-xs overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Excelencia"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h4 className="mb-3 text-xl font-light tracking-wide text-neutral-900">
                Excelencia
              </h4>
              <p className="font-light text-neutral-600">
                Nos comprometemos a entregar proyectos que superen los estándares de calidad 
                y diseño en la industria inmobiliaria.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 aspect-square w-full max-w-xs overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Innovación"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h4 className="mb-3 text-xl font-light tracking-wide text-neutral-900">
                Innovación
              </h4>
              <p className="font-light text-neutral-600">
                Implementamos las últimas tecnologías y tendencias en construcción sostenible 
                para crear espacios modernos y eficientes.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 aspect-square w-full max-w-xs overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Confianza"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h4 className="mb-3 text-xl font-light tracking-wide text-neutral-900">
                Confianza
              </h4>
              <p className="font-light text-neutral-600">
                Construimos relaciones duraderas con nuestros clientes basadas en la 
                transparencia, honestidad y cumplimiento de promesas.
              </p>
            </div>
          </div>
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
      </div>
    </section>
  );
}
