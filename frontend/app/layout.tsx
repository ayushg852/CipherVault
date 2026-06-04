import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CipherVault | Zero-Knowledge Secure Storage",
  description: "End-to-end encrypted file sharing with digital seal verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-200 min-h-screen pt-16`}
      >
        <div className="ambient-glow top-[-10%] left-[-10%]" />
        <div className="ambient-glow bottom-[-10%] right-[-10%] opacity-50" />
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        
        <Navbar />
        {children}
      </body>
    </html>
  );
}
