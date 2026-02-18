"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`${playfair.className} relative min-h-screen flex items-center justify-center overflow-hidden`}
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

      {/* Content card */}
      <div className="relative z-10 w-full max-w-lg p-10 text-center ">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl
             font-bold text-center tracking-wide
             leading-tight
             text-[#c6a53a]
             [ text-shadow:0_1px_0_rgba(255,255,255,0.2) ]

             drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
           
        >
          @setsbyesther
        </h1>

        
        <p className="text-neutral mb-6">Looking to get your next set?</p>

        <a
          href="/pricing"
          className="relative px-6 py-3 rounded-full inline-block 
                    
                    text-white 
                    transition-all duration-500 ease-out
                    hover:text-[#c6a53a] hover:shadow-lg
                    overflow-hidden group"
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
                  )`
                }}
        >
          <span className="relative z-10">View Pricing</span>
          
        </a>
      </div>

      
    </main>
  );
}
