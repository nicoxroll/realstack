import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = Math.max(0, 1 - scrollY / 600);
  const scale = Math.max(0.9, 1 - scrollY / 2000);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/12343668/pexels-photo-12343668.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1
          className="mb-6 text-6xl font-light tracking-wider text-white md:text-7xl lg:text-8xl"
          style={{ opacity }}
        >
          {title}
        </h1>
        <p
          className="mb-12 text-xl font-light tracking-wide text-white/90 md:text-2xl"
          style={{ opacity }}
        >
          {subtitle}
        </p>

        <div
          className="absolute bottom-12 animate-bounce"
          style={{ opacity: opacity * 0.8 }}
        >
          <ChevronDown className="h-10 w-10 text-white" strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}
