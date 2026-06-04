'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Lock, Activity, Upload, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Retrieve', href: '/download', icon: Download },
    { name: 'Network', href: '/network', icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-glow group-hover:rotate-12 transition-transform duration-300">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            Cipher<span className="text-emerald-400">Vault</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center space-x-2 text-sm font-medium transition-colors hover:text-emerald-400 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Node: Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
