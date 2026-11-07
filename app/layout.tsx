import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SetsByEsther",
  description: "Book your next nail appointment with SetsByEsther.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<body
className={`${playfair.className} antialiased min-h-screen flex flex-col`}  style={{
    background: `
      radial-gradient(ellipse at 20% 20%, #5A4030, transparent 55%),
      radial-gradient(ellipse at 80% 35%, #38291F, transparent 60%),
      radial-gradient(ellipse at 50% 90%, #796452, transparent 70%),
      #211914
    `,
  }}
>        <div className="flex-1">
          {children}
        </div>
<footer className="border-t border-white/10 bg-[#211914] px-6 py-3 text-center text-white">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-400">            
          <a href="/" className="transition hover:text-[#c6a53a]">
              Home
            </a>
            <a href="/pricing" className="transition hover:text-[#c6a53a]">
              Pricing
            </a>
            <a href="/booking" className="transition hover:text-[#c6a53a]">
              Book an Appointment
            </a>
            <a href="/policies" className="transition hover:text-[#c6a53a]">
              Booking Policies
            </a>
            <a
              href="https://www.instagram.com/setsbyesther"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#c6a53a]"
            >
              Instagram
            </a>
          </nav>

          <p className="mt-2 text-xs text-gray-500">
            © {new Date().getFullYear()} SetsByEsther. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}