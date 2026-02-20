"use client";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useState } from "react";

const playfair = Playfair_Display({ subsets: ["latin"] });

const services = [
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
  // Track which cards are flipped
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <main className={`${playfair.className} relative min-h-screen flex flex-col items-center justify-center py-24 px-6 overflow-hidden`}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image src="/images/pricing.jpg" alt="Nail background" fill priority className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Heading */}
      <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg">Pricing</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mt-16">
        {services.map((service, index) => (
          <div
            key={index}
            className="group w-72 h-96 [perspective:1200px]"
            onClick={() => toggleFlip(index)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-[1300ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-[0_25px_60px_rgba(0,0,0,0.5)] [transform-style:preserve-3d] 
                ${flipped[index] ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"}`}
            >
              {/* FRONT */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:translateZ(10px)]">
                <div className="relative w-full h-full rounded-2xl border-[3px] border-[#c6a53a] shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white/25 backdrop-blur-xl" />
                  <div className="relative z-10 h-full flex items-center justify-center text-white">
                    <span className="text-2xl font-semibold text-center px-4">{service.title}</span>
                  </div>
                </div>
              </div>

              {/* BACK */}
              <div className="absolute inset-0 [transform:rotateY(180deg)_translateZ(10px)] [backface-visibility:hidden]">
                <div className="relative w-full h-full rounded-2xl border-[3px] border-[#c6a53a] shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white/25 backdrop-blur-xl" />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-6">
                    <p className="mb-4">{service.description}</p>
                    <p className="text-2xl font-bold">{service.price}</p>
                    <a
                      href="/booking"
                      className="mt-4 px-6 py-3 rounded-full inline-block text-white transition-all duration-[1100ms] ease-out hover:text-[#c6a53a] hover:shadow-lg"
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}