import NetworkStatus from '@/components/NetworkStatus';
import { Activity } from 'lucide-react';

export default function NetworkPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-20 relative">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Network Monitor</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Real-time telemetry from the CipherVault node cluster. Monitoring active encrypted blobs.
        </p>
      </div>
      
      <NetworkStatus />

      <div className="mt-12 grid md:grid-cols-2 gap-6 text-[10px] uppercase tracking-widest text-slate-500">
        <div className="p-4 border border-white/5 rounded-xl bg-white/2 flex items-center space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Cluster Location: Singapore-Node-01</span>
        </div>
        <div className="p-4 border border-white/5 rounded-xl bg-white/2 flex items-center space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Shredder Service: Active & Synchronized</span>
        </div>
      </div>
    </main>
  );
}
