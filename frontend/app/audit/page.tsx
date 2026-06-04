'use client';

import { ShieldAlert, CheckCircle2, AlertTriangle, FileSearch, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditPage() {
  const auditItems = [
    {
      id: "CV-001",
      threat: "Server-Side Data Exposure",
      mitigation: "Client-side AES-256-GCM encryption ensure the server never receives plaintext.",
      status: "SECURE"
    },
    {
      id: "CV-002",
      threat: "Brute-Force Attack on Master Key",
      mitigation: "PBKDF2 with 100k iterations makes brute-forcing computationally expensive.",
      status: "SECURE"
    },
    {
      id: "CV-003",
      threat: "Data Persistence after Access",
      mitigation: "Automated shredding protocol purges data immediately upon successful retrieval.",
      status: "SECURE"
    },
    {
      id: "CV-004",
      threat: "Man-in-the-Middle Tampering",
      mitigation: "Cryptographic hash (SHA-256) verification detects unauthorized payload modification.",
      status: "SECURE"
    },
    {
      id: "CV-005",
      threat: "Key Leakage via Transmission",
      mitigation: "Master key is used only locally in RAM; zero transmission of sensitive keys.",
      status: "SECURE"
    }
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-20 relative">
      <div className="flex items-center space-x-4 mb-12">
        <div className="p-3 bg-cyan-500/10 rounded-xl shadow-glow">
          <FileSearch className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Security Audit</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-glow">System Hardening Report: ALPHA-4</p>
        </div>
      </div>

      <div className="grid gap-6">
        {auditItems.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-cyan-500/30 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-cyan-500/50 bg-cyan-500/5 px-2 py-0.5 rounded">{item.id}</span>
                <h3 className="font-bold text-white uppercase tracking-tight">{item.threat}</h3>
              </div>
              <p className="text-slate-400 text-sm">{item.mitigation}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{item.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-10 glass-card bg-emerald-500/5 border-emerald-500/10 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Certified Zero-Knowledge</h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          CipherVault protocol has been verified for complete cryptographic isolation. No unencrypted data is ever accessible by the host node or network administrators.
        </p>
      </div>
    </main>
  );
}
