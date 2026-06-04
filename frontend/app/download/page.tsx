import FileDownloader from '@/components/FileDownloader';
import { Lock } from 'lucide-react';

export default function DownloadPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 relative">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Secure Retrieval</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Access your encrypted storage using your vault token and master key.
        </p>
      </div>
      
      <FileDownloader />

      <div className="mt-12 p-6 glass-card border-cyan-500/20 bg-cyan-500/5 flex items-start space-x-4">
        <Lock className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase">Auto-Shred Alert</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Retrieval attempts are limited. After 3 incorrect password entries, the packet will be permanently destroyed from the node cluster. Successful decryption also triggers immediate data disposal.
          </p>
        </div>
      </div>
    </main>
  );
}
