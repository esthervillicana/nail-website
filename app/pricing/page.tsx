
"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

interface Service {
  title: string;
  description: string;
  price: string;
}

const services: Service[] = [
  {
    title: "Gel Manicure",
    description: "Includes cuticle prep, shaping, and gel polish application",
    price: "$40",
  },
  {
    title: "Acrylic Full Set",
    description: "Full sculpted acrylic set with shaping and your choice of color",
    price: "$65",
  },
  {
    title: "Acrylic Refill",
    description: "Fill-in for existing acrylic set with reshaping and polish",
    price: "$50",
  },
];

export default function Pricing() {
  return (
    <main
      className={`${playfair.className} relative flex-1 flex flex-col items-center py-12 px-6 overflow-hidden`}
    >
      {/* Heading */}
      <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg">
        Pricing
      </h1>

      <p className="mt-4 text-white/70 text-center text-sm sm:text-base">
        Explore my services and find your next favorite set.
      </p>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mt-14 w-full max-w-6xl">
        {services.map((service, index) => (
          <div
            key={index}
            className="group relative rounded-2xl border-2 border-[#a8872a] bg-white/[0.08] backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(198,165,58,0.15)]"
          >
            {/* Photo Placeholder */}
            <div className="relative h-64 w-full p-3">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-[#c6a53a]/40 bg-black/20">
                <div className="flex flex-col items-center gap-3 text-white/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-xs tracking-[0.2em] uppercase">
                    Photo coming soon
                  </span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="flex flex-col items-center text-center px-6 pb-7">
              <h2 className="text-2xl font-semibold text-white">
                {service.title}
              </h2>

              <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-white/70">
                {service.description}
              </p>

              <div className="mt-5 mb-5">
                <span className="text-3xl font-bold text-[#e4c66e]">
                  {service.price}
                </span>
              </div>

              {/* Book Button */}
              <a
              href={`/booking?service=${encodeURIComponent(service.title)}`}
                className="inline-block rounded-full px-9 py-3 text-white font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(198,165,58,0.3)]"
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
                Book Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
