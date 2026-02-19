"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function Home() {
  const images = [
    "/images/IMG_6365.jpeg",
    "/images/nails1.jpg",
    "/images/nails2.jpg",
    "/images/nails3.jpg",
    "/images/nails4.jpg",
    "/images/nails5.jpg",
    "/images/nails6.jpg",
    "/images/nails7.jpg",
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const [scrollState, setScrollState] = useState<{ [key: number]: { opacity: number; scale: number } }>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Center the scroll container on mount
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      updateScrollButtons();
      handleScroll(); // initial fade update
    }
  }, []);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    const newState: Record<number, { opacity: number; scale: number }> = {};

    imageRefs.current.forEach((img, i) => {
      if (!img) return;
      const imgCenter = img.offsetLeft + img.offsetWidth / 2;
      const distance = Math.abs(containerCenter - imgCenter);
      const maxDistance = container.clientWidth / 2 + img.offsetWidth; // fade range
      let opacity = 1 - distance / maxDistance;
      let scale = 1 - distance / (maxDistance * 5);
      opacity = Math.max(0.3, Math.min(1, opacity));
      scale = Math.max(0.9, Math.min(1.05, scale));
      newState[i] = { opacity, scale };
    });

    setScrollState(newState);
    updateScrollButtons();
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = 312;
    container.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <main className={`${playfair.className} relative min-h-screen flex flex-col items-center justify-center`}
    >
      <a
  href="https://www.instagram.com/setsbyesther"
  target="_blank"
  rel="noopener noreferrer"
  className="
    fixed bottom-6 right-6 
    z-50
    w-12 h-12
    rounded-full 
    bg-white/20 backdrop-blur-md 
    flex items-center justify-center
    hover:scale-110 transition-transform
  "
>
  {/* Instagram logo using react-icons */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#efefef"
    className="w-6 h-6"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.918 4.918 0 011.675 1.09 4.918 4.918 0 011.09 1.675c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.918 4.918 0 01-1.09 1.675 4.918 4.918 0 01-1.675 1.09c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.918 4.918 0 01-1.675-1.09 4.918 4.918 0 01-1.09-1.675c-.163-.46-.35-1.26-.403-2.43-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.918 4.918 0 011.09-1.675 4.918 4.918 0 011.675-1.09c.46-.163 1.26-.35 2.43-.403 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.756 0 8.333.013 7.052.072 5.78.13 4.856.308 4.05.6a7.07 7.07 0 00-2.56 1.6 7.07 7.07 0 00-1.6 2.56c-.292.806-.47 1.73-.528 3C-.013 8.333 0 8.756 0 12c0 3.244.013 3.667.072 4.948.058 1.27.236 2.194.528 3a7.07 7.07 0 001.6 2.56 7.07 7.07 0 002.56 1.6c.806.292 1.73.47 3 .528C8.333 23.987 8.756 24 12 24s3.667-.013 4.948-.072c1.27-.058 2.194-.236 3-.528a7.07 7.07 0 002.56-1.6 7.07 7.07 0 001.6-2.56c.292-.806.47-1.73.528-3 .058-1.281.072-1.704.072-4.948s-.013-3.667-.072-4.948c-.058-1.27-.236-2.194-.528-3a7.07 7.07 0 00-1.6-2.56 7.07 7.07 0 00-2.56-1.6c-.806-.292-1.73-.47-3-.528C15.667.013 15.244 0 12 0z"/>
    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8z"/>
    <circle cx="18.406" cy="5.594" r="1.44"/>
  </svg>
</a>
      

      {/* Background */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, #edbcf0, transparent 40%),
              radial-gradient(circle at 75% 40%, #64d2f1, transparent 50%),
              radial-gradient(circle at 25% 70%, #ff4c4c, transparent 50%)
            `,
            mixBlendMode: "screen",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 40% 60%, #ffd700, transparent 30%),
              radial-gradient(circle at 60% 35%, #ffb84c, transparent 25%)
            `,
            mixBlendMode: "screen",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Content card */}
      <section className="flex items-center justify-center pt-16 sm:pt-20 md:pt-24
                            pb-8 sm:pb-10
                           px-4 sm:px-6 pb-10 px-6">
        <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 md:p-10 text-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center tracking-wide leading-tight text-[#B8860B]">
            @setsbyesther
          </h1>
          <p className="text-neutral mb-6">Looking to get your next set?</p>
          <a
            href="/pricing"
            className="relative px-6 py-3 rounded-full inline-block text-white transition-all duration-500 ease-out hover:text-[#c6a53a] hover:shadow-lg"
            style={{
              background: `linear-gradient(
                115deg,
                #6e5a17 0%,
                #a8872a 20%,
                #c6a53a 40%,
                #f2e3a2 50%,
                #c6a53a 60%,
                #a8872a 80%,
                #6e5a17 100%
              )`,
            }}
          >
            <span className="relative z-10">View Pricing</span>
          </a>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative z-10 mt-10 sm:mt-14 md:mt-20 w-full flex justify-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 md:px-8 relative">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl
                        mb-6 sm:mb-8 md:mb-10 text-center">My Work</h2>

          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`hidden sm:block absolute left-6 top-1/2 -translate-y-1/2 z-20 text-3xl ${
              !canScrollLeft ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            ◀
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 z-20 text-3xl ${
              !canScrollRight ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            ▶
          </button>

          {/* Scrollable container with soft fading edges */}
          <div className="relative overflow-hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto scroll-smooth gap-8 px-4 sm:px-16 md:px-24 lg:px-40 py-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", maskRepeat: "no-repeat", maskSize: "cover" }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {images.map((src, i) => (
                <div
                  key={i}
                  ref={(el) => {imageRefs.current[i] = el!;}}
                  className="relative w-[220px] sm:w-[260px] md:w-[280px] h-[300px] sm:h-[330px] md:h-[350px] flex-shrink-0 rounded-3xl overflow-hidden transition-transform duration-300"
                  style={{
                    opacity: scrollState[i]?.opacity || 0.7,
                    transform: `scale(${scrollState[i]?.scale || 0.9})`,
                  }}
                >
                  <Image src={src} alt="Nail set" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
