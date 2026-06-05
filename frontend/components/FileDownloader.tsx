'use client';

import { useState } from 'react';
import { Download, Lock, Loader2, ShieldAlert, ShieldCheck, Box, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { decryptFile, base64ToBuffer } from '@/lib/crypto';

export default function FileDownloader() {
  const [fileId, setFileId] = useState('');
  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'fetching' | 'decrypting' | 'verifying' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    const cleanId = fileId.trim();
    if (!cleanId || !password) return;

    setIsDownloading(true);
    setError(null);
    setVerificationState('fetching');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/files/download/${cleanId}`);
      if (response.status === 410 || response.status === 404) throw new Error('ACCESS_DENIED: Packet purged from cluster.');
      if (!response.ok) throw new Error('CONNECTION_FAILURE: Node unreachable.');

      const data = await response.json();
      setVerificationState('decrypting');

      let decryptedBlob: Blob;
      try {
        const encryptedBlob = await (await fetch(`data:application/octet-stream;base64,${data.blob}`)).blob();
        const iv = base64ToBuffer(data.iv);
        const salt = base64ToBuffer(data.salt);

        decryptedBlob = await decryptFile(encryptedBlob, password, iv, salt);
        
        setVerificationState('verifying');
        const fileBuffer = await decryptedBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        await new Promise(resolve => setTimeout(resolve, 2000));

        if (calculatedHash !== data.fileHash) {
          throw new Error('SECURITY_CRITICAL: Integrity seal broken!');
        }

        setVerificationState('success');
        await fetch(`${apiUrl}/api/files/${cleanId}/shred`, { method: 'POST' });
        
        const url = window.URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.originalName || 'decrypted-file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFileId('');
        setPassword('');
      } catch (decryptErr: any) {
        if (decryptErr.message.includes('SECURITY_CRITICAL')) throw decryptErr;
        const failResponse = await fetch(`${apiUrl}/api/files/${cleanId}/fail`, { method: 'POST' });
        const failData = await failResponse.json();
        throw new Error(failData.shredded ? 'CRITICAL: Max attempts reached. Packet destroyed.' : `INVALID_KEY: ${failData.remaining} attempts remaining.`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
      setVerificationState('idle');
    }
  };

  return (
    <div className="glass-card p-8 md:p-12 space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-black">Vault Access Token</label>
            <input
              type="text"
              value={fileId}
              disabled={isDownloading}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="Enter packet ID..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-black">Master Decryption Key</label>
            <input
              type="password"
              value={password}
              disabled={isDownloading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
            />
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!fileId || !password || isDownloading}
          className="btn-primary from-cyan-500 to-blue-500 w-full h-14 uppercase tracking-[0.3em] font-black disabled:opacity-20 relative overflow-hidden"
        >
          {isDownloading ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] animate-pulse flex items-center">
                {verificationState === 'fetching' && <><Box className="w-3 h-3 mr-2" /> Accessing Node...</>}
                {verificationState === 'decrypting' && <><Lock className="w-3 h-3 mr-2" /> Decrypting Payload...</>}
                {verificationState === 'verifying' && <><Send className="w-3 h-3 mr-2" /> Scanning Digital Seal...</>}
                {verificationState === 'success' && 'Authenticated'}
              </span>
              {verificationState === 'verifying' && (
                <div className="w-48 h-1 bg-white/20 mt-2 relative overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="absolute top-0 bottom-0 w-1/2 bg-white"
                  />
                </div>
              )}
            </div>
          ) : (
            'Access Vault'
          )}
        </button>

        <AnimatePresence>
          {verificationState === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center space-x-3 shadow-glow"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Integrity Verified</span>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3 text-red-400 text-[10px] uppercase tracking-widest font-bold animate-bounce"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
