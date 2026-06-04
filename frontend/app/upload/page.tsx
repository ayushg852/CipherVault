import FileUploader from '@/components/FileUploader';
import { Shield } from 'lucide-react';

export default function UploadPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 relative">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Secure Encryption</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Prepare your data packet for zero-knowledge transmission. Files are encrypted locally using AES-256-GCM.
        </p>
      </div>
      
      <FileUploader />

      <div className="mt-12 p-6 glass-card border-emerald-500/20 bg-emerald-500/5 flex items-start space-x-4">
        <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase">Privacy Notice</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your master password is used to derive a key via PBKDF2 (100,000 iterations). This process happens entirely in RAM. No unencrypted data or passwords ever touch our network.
          </p>
        </div>
      </div>
    </main>
  );
}
