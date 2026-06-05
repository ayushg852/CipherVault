'use client';

import { useState, useEffect } from 'react';
import { Upload, Lock, Loader2, CheckCircle2, AlertCircle, Copy, KeyRound, ShieldCheck, Box, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { encryptFile, bufferToBase64 } from '@/lib/crypto';

interface FileUploaderProps {
  onUnsavedChange?: (isUnsaved: boolean) => void;
}

export const WARNING_MESSAGE = "WARNING: You haven't copied your Access Token. If you leave this page, you will LOSE access to your file forever. Proceed?";

export default function FileUploader({ onUnsavedChange }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'encrypting' | 'transmitting' | 'success'>('idle');
  const [uploadResult, setUploadResult] = useState<{ id: string; expiresAt: string } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnsaved = !!uploadResult && !hasCopied;

  useEffect(() => {
    onUnsavedChange?.(isUnsaved);
    
    // 1. Browser Level Guard (Reload/Close Tab)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUnsaved) {
        e.preventDefault();
        e.returnValue = WARNING_MESSAGE;
      }
    };

    // 2. Internal Link Guard (Next.js Navigation)
    const handleInternalNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest('a');
      if (isUnsaved && closestLink) {
        const confirmNav = window.confirm(WARNING_MESSAGE);
        if (!confirmNav) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalNavigation, true); // Use capture phase to intercept
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [isUnsaved, onUnsavedChange]);

  const handleUpload = async () => {
    if (!file || !password) return;
    if (password !== confirmPassword) {
      setError('VALIDATION_ERROR: Passwords do not match.');
      return;
    }
    setIsUploading(true);
    setError(null);
    setHasCopied(false);
    setUploadState('encrypting');

    try {
      const { encryptedBlob, iv, salt, fileHash } = await encryptFile(file, password);
      
      await new Promise(r => setTimeout(r, 1200));
      setUploadState('transmitting');
      
      const formData = new FormData();
      formData.append('file', encryptedBlob, file.name);
      formData.append('iv', bufferToBase64(iv));
      formData.append('salt', bufferToBase64(salt));
      formData.append('fileHash', fileHash);
      formData.append('originalName', file.name);
      formData.append('mimeType', file.type);
      formData.append('expiryHours', '24'); 
      formData.append('maxDownloads', '1'); 

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setUploadResult({ id: data.fileId, expiresAt: data.expiresAt });
      setUploadState('success');
      setFile(null);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Upload failure:', err);
      setError(`CRITICAL_FAILURE: ${err.message || 'Secure transmission interrupted.'}`);
      setUploadState('idle');
    } finally {
      setIsUploading(false);
    }
  };

  const copyId = () => {
    if (uploadResult) {
      navigator.clipboard.writeText(uploadResult.id);
      setHasCopied(true);
    }
  };

  if (uploadResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center space-y-8 border-emerald-500/30"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-glow">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Encryption Success</h3>
          <p className="text-slate-400 text-sm italic">"The server cannot read what it cannot unlock."</p>
        </div>

        <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-inner">
          <label className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-bold italic">Your Unique Access Token</label>
          <code className="text-emerald-400 font-mono text-lg break-all">{uploadResult.id}</code>
          <button 
            onClick={copyId} 
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-300 ${
              hasCopied ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest">{hasCopied ? 'Token Secured' : 'Copy Access Token'}</span>
          </button>
        </div>

        <button 
          onClick={() => {
            if (isUnsaved && !window.confirm(WARNING_MESSAGE)) return;
            setUploadResult(null);
            setHasCopied(false);
            setUploadState('idle');
          }}
          className="text-[10px] text-slate-500 hover:text-white underline uppercase tracking-[0.2em] transition-colors"
        >
          Initialize New Encryption Session
        </button>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-8 md:p-12 space-y-8">
      <div className="space-y-6">
        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-emerald-500/40 transition-colors group bg-white/[0.02]">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
            </div>
            {file ? (
              <span className="text-emerald-400 font-bold tracking-tight">PACKET READY: {file.name}</span>
            ) : (
              <div className="space-y-1">
                <p className="text-white font-semibold">Drop secure packet or click to browse</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black opacity-80">Max payload: 50MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-black">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-black">Confirm Key</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !password || !confirmPassword || isUploading}
          className="btn-primary w-full h-14 uppercase tracking-[0.3em] font-black disabled:opacity-20 relative overflow-hidden"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] animate-pulse flex items-center">
                {uploadState === 'encrypting' && <><Box className="w-3 h-3 mr-2" /> Sealing Packet in RAM...</>}
                {uploadState === 'transmitting' && <><Send className="w-3 h-3 mr-2" /> Routing to Node Cluster...</>}
              </span>
              <div className="w-48 h-1 bg-white/20 mt-2 relative overflow-hidden rounded-full">
                <motion.div 
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-slate-900"
                />
              </div>
            </div>
          ) : (
            'Encrypt and Send'
          )}
        </button>

        {error && (
          <div className="flex items-center justify-center space-x-2 text-red-400 text-[10px] font-black uppercase tracking-widest pt-4 animate-bounce">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
