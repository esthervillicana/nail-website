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
    <main className={`${playfair.className} relative min-h-screen flex flex-col items-center justify-center`}>
      {/* Background */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, #edbcf0, transparent 40%),
              radial-gradient(circle at 70% 40%, #64d2f1, transparent 50%),
              radial-gradient(circle at 50% 70%, #ff4c4c, transparent 50%)
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
      <section className="flex items-center justify-center pt-24 pb-10 px-6">
        <div className="relative z-10 w-full max-w-lg p-10 text-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center tracking-wide leading-tight text-[#c6a53a]">
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
      <section className="relative z-10 mt-6 w-full flex justify-center">
        <div className="w-full max-w-5xl relative">
          <h2 className="text-white text-3xl mb-10 text-center">My Work</h2>

          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 text-3xl ${
              !canScrollLeft ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            ◀
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 text-3xl ${
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
              className="flex overflow-x-auto scroll-smooth gap-8 px-40 py-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", maskRepeat: "no-repeat", maskSize: "cover" }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {images.map((src, i) => (
                <div
                  key={i}
                  ref={(el) => {imageRefs.current[i] = el!;}}
                  className="relative w-[280px] h-[350px] flex-shrink-0 rounded-3xl overflow-hidden transition-transform duration-300"
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
