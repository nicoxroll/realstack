import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  email: string;
  phone: string;
}

export default function Footer({ email, phone }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 px-6 py-12 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Sobre nosotros */}
          <div>
            <h3 className="mb-6 text-lg font-light tracking-widest">REAL ESTATE</h3>
            <p className="mb-6 font-light leading-relaxed text-white/70">
              Desarrollamos proyectos inmobiliarios de lujo con más de 15 años de
              experiencia en el mercado.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/10"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/10"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="mb-6 text-sm font-light tracking-widest text-white/90">
              NAVEGACIÓN
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#inicio"
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#proyectos"
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  Proyectos
                </a>
              </li>
              <li>
                <a
                  href="#nosotros"
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  Nosotros
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="mb-6 text-sm font-light tracking-widest text-white/90">
              SERVICIOS
            </h4>
            <ul className="space-y-3">
              <li className="font-light text-white/70">Venta de Propiedades</li>
              <li className="font-light text-white/70">Asesoría Inmobiliaria</li>
              <li className="font-light text-white/70">Desarrollo de Proyectos</li>
              <li className="font-light text-white/70">Inversiones</li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-6 text-sm font-light tracking-widest text-white/90">
              CONTACTO
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 text-white/70" strokeWidth={1.5} />
                <a
                  href={`mailto:${email}`}
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-white/70" strokeWidth={1.5} />
                <a
                  href={`tel:${phone}`}
                  className="font-light text-white/70 transition-colors hover:text-white"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-white/70" strokeWidth={1.5} />
                <span className="font-light text-white/70">
                  Ciudad, País
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
          <p className="text-sm font-light text-white/60">
            © {currentYear} Real Estate. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="font-light text-white/60 transition-colors hover:text-white"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="font-light text-white/60 transition-colors hover:text-white"
            >
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
