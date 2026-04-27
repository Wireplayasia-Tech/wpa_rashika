import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import NavbarMobile from "@/components/shared/NavbarMobile";
import Footer from "@/components/shared/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Wireplay Asia",
  description: "A next-generation platform driven by the power of AI and a passion for innovation. Dedicated to advancing the gaming ecosystem with cutting-edge AI, powerful resources, and a vibrant community. We&apos;re here to support creators, developers, and enthusiasts in their journey to elevate the gaming experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <div className="hidden md:flex">
          <Navbar />
        </div>
        <div className="md:hidden">
          <NavbarMobile />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
