'use client';

import Link from 'next/link';
import { Shield, Lock, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 relative">
      {/* Hero Section */}
      <section className="text-center space-y-8 mb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Zap className="w-3 h-3" />
          <span>v1.2.0: Now with Digital Seal Verification</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-tight"
        >
          The Future of <br />
          <span className="text-gradient">Secure Sharing</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed"
        >
          CipherVault uses client-side AES-256-GCM encryption. Your master key never leaves your browser, ensuring absolute Zero-Knowledge privacy.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8"
        >
          <Link href="/upload" className="btn-primary w-full sm:w-auto group">
            Encrypt Packet <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/download" className="btn-secondary w-full sm:w-auto">
            Access Vault
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <motion.section 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8"
      >
        <motion.div variants={item} className="glass-card p-8 group hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">Zero-Knowledge</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Encryption happens in your browser. We store only encrypted blobs. We can't see your data, even if we wanted to.
          </p>
        </motion.div>

        <motion.div variants={item} className="glass-card p-8 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">Digital Seal</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Each packet is cryptographically hashed. Our "Digital Seal" ensures your file hasn't been tampered with by the node cluster.
          </p>
        </motion.div>

        <motion.div variants={item} className="glass-card p-8 group hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">Auto-Shred</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Security by design. Packets are automatically purged after 1 download or 24 hours of cluster persistence.
          </p>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
        <p>&copy; 2026 CipherVault Protocol. Authorized access only.</p>
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <Link href="/docs" className="hover:text-white transition-colors uppercase tracking-widest font-bold">Documentation</Link>
          <Link href="/audit" className="hover:text-white transition-colors uppercase tracking-widest font-bold">Security Audit</Link>
          <a href="https://github.com/ayushg852/CipherVault" className="flex items-center space-x-1 hover:text-white transition-colors">
            <span>Source</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
