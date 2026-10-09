import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resort Hotel | Enjoy A Luxury Experience",
  description:
    "Experience luxury rooms and suites at Resort Hotel. View rooms, toilets, washrooms, filter by AC/Non-AC, price and bed capacity, with instant WhatsApp booking to 8822308551.",
  keywords: [
    "luxury hotel",
    "oceanfront suites",
    "hotel room booking",
    "penthouse suite",
    "Resort Hotel",
    "family room",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#161719] text-slate-100 selection:bg-[#F5A623]/30 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
