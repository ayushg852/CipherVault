'use client';

import { useState, useEffect } from 'react';
import { Activity, Box, Clock, ShieldAlert, RefreshCw, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlobStat {
  id: string;
  size: number;
  expiresAt: string;
  createdAt: string;
  failedAttempts: number;
}

export default function NetworkStatus() {
  const [stats, setStats] = useState<{ activeBlobs: number; files: BlobStat[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/files/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to sync with node cluster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const getTimeRemaining = (expiry: string) => {
    const remaining = new Date(expiry).getTime() - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="border border-terminal-green/30 p-6 bg-terminal-black/50 border-glow overflow-hidden flex flex-col h-[400px]">
      {/* Dashboard Header */}
      <div className="p-4 border-b border-terminal-green/30 flex items-center justify-between bg-terminal-green/5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-terminal-green animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Live Node Monitor</h2>
        </div>
        <button onClick={fetchStats} className="hover:rotate-180 transition-transform duration-500">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 border-b border-terminal-green/30 bg-terminal-black/80">
        <div className="p-3 text-center border-r border-terminal-green/30">
          <span className="block text-[8px] opacity-50 uppercase">Active Blobs</span>
          <span className="text-xl font-bold">{stats?.activeBlobs || 0}</span>
        </div>
        <div className="p-3 text-center border-r border-terminal-green/30">
          <span className="block text-[8px] opacity-50 uppercase">Cluster Load</span>
          <span className="text-xl font-bold text-terminal-green">{(stats?.activeBlobs || 0) * 4}%</span>
        </div>
        <div className="p-3 text-center">
          <span className="block text-[8px] opacity-50 uppercase">Node Status</span>
          <span className="text-[10px] font-bold text-terminal-green uppercase leading-7">Encrypted</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-[10px] text-left">
          <thead className="sticky top-0 bg-terminal-black uppercase text-terminal-green/40 border-b border-terminal-green/10">
            <tr>
              <th className="p-3 font-normal">Blob ID</th>
              <th className="p-3 font-normal text-right">Size</th>
              <th className="p-3 font-normal text-right">TTL</th>
              <th className="p-3 font-normal text-right">Fails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-green/5">
            {stats?.files.map((file) => (
              <tr key={file.id} className="hover:bg-terminal-green/5 transition-colors group">
                <td className="p-3 font-mono opacity-60 group-hover:opacity-100">{file.id.slice(-8)}...</td>
                <td className="p-3 text-right opacity-60">{formatSize(file.size)}</td>
                <td className="p-3 text-right text-terminal-green/80 flex items-center justify-end">
                  <Clock className="w-2 h-2 mr-1" /> {getTimeRemaining(file.expiresAt)}
                </td>
                <td className="p-3 text-right">
                  {file.failedAttempts > 0 ? (
                    <span className="text-red-500 flex items-center justify-end">
                      <ShieldAlert className="w-2 h-2 mr-1" /> {file.failedAttempts}
                    </span>
                  ) : (
                    <span className="opacity-30">0</span>
                  )}
                </td>
              </tr>
            ))}
            {stats?.files.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center opacity-30 italic">
                  No active encrypted packets detected in cluster.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info */}
      <div className="p-2 bg-terminal-green/5 border-t border-terminal-green/30 flex justify-between text-[8px] uppercase opacity-40">
        <span className="flex items-center"><Database className="w-2 h-2 mr-1" /> Protocol: AES-256-GCM</span>
        <span>Last Sync: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
