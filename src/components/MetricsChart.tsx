
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MetricsChart() {
  const [metrics, setMetrics] = useState<any[]>([
    { day: 'Mon', success: 94, failures: 6, avgSpeed: '124ms' },
    { day: 'Tue', success: 98, failures: 2, avgSpeed: '110ms' },
    { day: 'Wed', success: 87, failures: 13, avgSpeed: '240ms' },
    { day: 'Thu', success: 99, failures: 1, avgSpeed: '95ms' },
    { day: 'Fri', success: 95, failures: 5, avgSpeed: '118ms' },
  ]);
  const [realStats, setRealStats] = useState<{total:number, success:number, failed:number} | null>(null);

  useEffect(()=>{
    // FIXED: Try to fetch real stats from execution_logs
    supabase.from('execution_logs').select('status').then(({data})=>{
      if(data && data.length>0){
        const total=data.length;
        const success=data.filter(d=>d.status==='success').length;
        const failed=data.filter(d=>d.status==='failed').length;
        setRealStats({total, success, failed});
      }
    });
  },[]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6"><div><h2 className="text-xl font-semibold text-white">📊 Performance Telemetry (FIXED)</h2><p className="text-xs text-zinc-400">{realStats ? `Real: ${realStats.total} logs, ${realStats.success} success, ${realStats.failed} failed` : 'Demo data - will show real logs after seed'}</p></div><div className="flex gap-4 text-xs font-mono"><span className="text-emerald-400">● Success</span><span className="text-rose-500">● Failure</span></div></div>
      <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-zinc-900 pb-2">
        {metrics.map((d,i)=><div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end"><div className="w-full flex flex-col justify-end h-full rounded bg-zinc-900/40 overflow-hidden"><div style={{height:`${(d.failures/(d.success+d.failures))*100}%`}} className="w-full bg-rose-950 border-t border-rose-500"></div><div style={{height:`${(d.success/(d.success+d.failures))*100}%`}} className="w-full bg-emerald-950 border-t border-emerald-500"></div></div><span className="text-xs font-mono text-zinc-500">{d.day}</span></div>)}
      </div>
    </div>
  );
}
