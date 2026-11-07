import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <footer className="border-t border-white/10 bg-[#09090b] px-6 py-8 text-center text-white">
          <p className="mb-5 text-lg font-semibold text-[#edbcf0]">
            @setsbyesther
          </p>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-400">
            <a href="/" className="transition hover:text-[#edbcf0]">
              Home
            </a>
            <a href="/pricing" className="transition hover:text-[#edbcf0]">
              Pricing
            </a>
            <a href="/booking" className="transition hover:text-[#edbcf0]">
              Book an Appointment
            </a>
            <a href="/policies" className="transition hover:text-[#edbcf0]">
              Booking Policies
            </a>
            <a
              href="https://www.instagram.com/setsbyesther"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#edbcf0]"
            >
              Instagram
            </a>
          </nav>

          <p className="mt-6 text-xs text-gray-500">
            © {new Date().getFullYear()} SetsByEsther. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}