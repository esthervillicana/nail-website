"use client";
import Image from "next/image";

import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
})

const services = [
  {
    title: "Gel Manicure",
    description: "Includes cuticle prep, shaping, and gel polish application",
    price: "$40",
    image:"/images/pricing.jpg"
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
      className={`${playfair.className} min-h-screen bg-cover bg-center bg-[length:500%] flex flex-col items-center justify-center py-24 px-6`}
         >
            {/* Oil spill background */}
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
      <h1  className="text-4xl sm:text-5xl md:text-6xl
             font-bold text-center tracking-wide
             leading-tight
             text-[#c6a53a]
             [ text-shadow:0_1px_0_rgba(255,255,255,0.2) ]

             drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
           
        >
        Pricing
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 justify-items-center">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center">

            {/* Frosted Glass Flip Card */}
            <div className="group w-72 h-96 [perspective:900px]">
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                {/* Front */}
                <div className="absolute w-full h-full rounded-xl overflow-hidden border border-white/40 shadow-lg [backface-visibility:hidden]">

                {/* Image */}
                {service.image && (
                    <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    />
                )}

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Title */}
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-white text-center px-4">
                    {service.title}
                </div>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full rounded-xl border border-white/40 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center text-white p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <p className="mb-4">{service.description}</p>
                  <p className="text-2xl font-bold">{service.price}</p>
                  <a
                    href="/booking"
                    className="mt-4 px-4 py-2 bg-[#c6a53a] rounded-full text-white hover:bg-[#edbcf0] transition"
                  >
                    Book Now
                  </a>
                </div>

              </div>
            </div>

          </div>
        ))}
      </div>
    </main>
  )
}
