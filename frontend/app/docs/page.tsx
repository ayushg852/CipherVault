'use client';

import { Book, Shield, Lock, Zap, Code, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocsPage() {
  const sections = [
    {
      title: "Master Key Derivation",
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      content: "We never store or transmit your master password. Instead, we use the PBKDF2 (Password-Based Key Derivation Function 2) algorithm with 100,000 iterations of SHA-256 to derive a 256-bit AES key. A random salt is generated for every session to prevent rainbow table attacks."
    },
    {
      title: "Authenticated Encryption",
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      content: "Files are encrypted using AES-256-GCM (Galois/Counter Mode). This provides not just confidentiality, but also authenticity. Every encrypted packet contains an authentication tag that verifies the data hasn't been tampered with while at rest on our nodes."
    },
    {
      title: "Digital Seal Protocol",
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      content: "Before encryption, we calculate a SHA-256 hash of your original file. During retrieval, your browser recalculates this hash after decryption and compares it to the original 'seal' stored on the server. If even a single bit was changed by a malicious node, the verification will fail."
    },
    {
      title: "Zero-Knowledge Storage",
      icon: <Code className="w-5 h-5 text-cyan-400" />,
      content: "Our backend serves as a stateless blob-store. It handles only encrypted data, initialization vectors (IVs), and salts. Because the encryption keys are generated in your local RAM and never transmitted, it is mathematically impossible for us to view your files."
    }
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 relative">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Book className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Documentation</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Protocol Specification v1.2.0</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 space-y-4"
          >
            <div className="flex items-center space-x-3">
              {section.icon}
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">{section.title}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 border border-white/5 rounded-2xl bg-white/[0.02] space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold">
          <Terminal className="w-4 h-4" />
          <span className="text-sm uppercase tracking-widest">System Flowchart</span>
        </div>
        <div className="font-mono text-[10px] text-emerald-500/60 leading-tight bg-slate-950 p-6 rounded-xl overflow-x-auto whitespace-pre">
{`[User File] -> (SHA-256 Hash) -> [Digital Seal]
[Password]  -> (PBKDF2 + Salt) -> [256-bit AES Key]
[User File] -> (AES-256-GCM + Key + IV) -> [Encrypted Blob]
      
[Encrypted Blob] + [Salt] + [IV] + [Seal] -> ROUTE TO NODE CLUSTER
      
DECRYPTION:
[Encrypted Blob] <- FETCH FROM NODE
[Key] <- REGENERATE VIA PASSWORD + SALT
[Decrypted File] <- AES-GCM-DECRYPT(Blob, Key, IV)
VERIFY: HASH(Decrypted File) == Seal ? SUCCESS : TAMPER_ALERT`}
        </div>
      </div>
    </main>
  );
}
