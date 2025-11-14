import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const contentOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/12343668/pexels-photo-12343668.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1
          className="mb-6 text-6xl font-light tracking-wider text-white md:text-7xl lg:text-8xl"
          style={{ opacity: contentOpacity }}
        >
          {title}
        </h1>
        <p
          className="mb-12 text-xl font-light tracking-wide text-white/90 md:text-2xl"
          style={{ opacity: contentOpacity }}
        >
          {subtitle}
        </p>

        <div
          className="absolute bottom-12 animate-bounce"
          style={{ opacity: contentOpacity * 0.8 }}
        >
          <ChevronDown className="h-10 w-10 text-white" strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}
