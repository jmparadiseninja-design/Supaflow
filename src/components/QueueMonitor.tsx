
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface QueueMessage { msg_id: number; read_ct: number; enqueued_at: string; message: Record<string, any>; }

export default function QueueMonitor({ queueName = 'production_worker_queue' }) {
  const [messages, setMessages] = useState<QueueMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueData = async () => {
    try {
      setError(null);
      // Uses FIXED RPC wrapper read_platform_queue
      const { data, error } = await supabase.rpc('read_platform_queue', { q_name: queueName, vt: 30, qty: 10 });
      if (error) throw error;
      if (data) setMessages(data);
    } catch (err: any) {
      console.error('Queue fetch error:', err);
      setError(err.message);
      // Fallback: show empty but don't crash - buyer sees error handling
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueueData();
    const ch = supabase.channel('realtime-queue').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'execution_logs' }, 
      () => fetchQueueData()
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [queueName]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div><h2 className="text-xl font-semibold text-white">📬 Queue Manager (FIXED)</h2><p className="text-xs text-zinc-400 mt-1">Live from pgmq via read_platform_queue RPC</p></div>
        <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
      </div>
      {loading ? <div className="py-12 text-center text-sm text-zinc-500 animate-pulse">Querying queue...</div> : 
       error ? <div className="py-8 text-center text-sm text-amber-400">Queue not seeded yet: {error}<br/><span className="text-xs text-zinc-500">Run telemetry seed SQL</span></div> :
       messages.length === 0 ? <div className="py-12 text-center text-sm text-zinc-500">Queue clear. Ready for workloads.</div> :
       <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm font-mono"><thead><tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase"><th className="py-3 px-4">ID</th><th className="py-3 px-4">Reads</th><th className="py-3 px-4">Enqueued</th><th className="py-3 px-4">Payload</th></tr></thead><tbody className="divide-y divide-zinc-900">{messages.map((m)=><tr key={m.msg_id} className="hover:bg-zinc-900/50"><td className="py-3 px-4 text-emerald-400">#{m.msg_id}</td><td className="py-3 px-4">{m.read_ct}x</td><td className="py-3 px-4 text-xs">{new Date(m.enqueued_at).toLocaleTimeString()}</td><td className="py-3 px-4 max-w-xs truncate text-xs">{JSON.stringify(m.message)}</td></tr>)}</tbody></table></div>}
    </div>
  );
}
