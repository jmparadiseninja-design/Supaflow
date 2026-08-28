
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SecretItem { id: string; key_name: string; encrypted_value: string; description?: string; last_rotated: string; isRevealed?: boolean; }

export default function VaultSafe() {
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [newKey, setNewKey] = useState(''); const [newValue, setNewValue] = useState(''); const [loading, setLoading] = useState(true);

  const fetchSecrets = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vault_secrets').select('*').order('created_at', { ascending: false });
    if (!error && data) setSecrets(data.map((s:any)=>({ ...s, isRevealed: false })));
    setLoading(false);
  };

  useEffect(()=>{ fetchSecrets(); },[]);

  const toggleReveal = (id: string) => setSecrets(secrets.map(s => s.id === id ? { ...s, isRevealed: !s.isRevealed } : s));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if(!newKey||!newValue) return;
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) { alert('Login first'); return; }
    const { error } = await supabase.from('vault_secrets').insert({ user_id: user.id, key_name: newKey.toUpperCase().replace(/\s+/g,'_'), encrypted_value: newValue, description: 'Added via UI' });
    if(!error){ setNewKey(''); setNewValue(''); fetchSecrets(); } else { alert(error.message); }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
      <div className="border-b border-zinc-800 pb-4 mb-6"><h2 className="text-xl font-semibold">🔐 Vault Safe (FIXED - Real DB)</h2><p className="text-xs text-zinc-400">Now connected to vault_secrets table with RLS</p></div>
      {loading ? <div className="text-sm text-zinc-500">Loading secrets...</div> : 
      <div className="space-y-3 mb-6">{secrets.length===0 ? <div className="text-sm text-zinc-500">No secrets yet. Add one below or run seed.</div> : secrets.map(s=><div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 gap-3"><div className="font-mono text-sm"><span className="text-white font-semibold">{s.key_name}</span><span className="text-zinc-500 text-xs block">{s.description}</span></div><div className="font-mono text-xs flex-1 sm:mx-6 bg-black/40 px-3 py-2 rounded border border-zinc-900 overflow-x-auto"><span className={s.isRevealed?"text-emerald-400":"text-zinc-600 tracking-widest"}>{s.isRevealed?(s as any).encrypted_value:"••••••••••••••••"}</span></div><div className="flex gap-3 text-xs"><span className="text-zinc-500 hidden md:inline">{new Date(s.last_rotated).toLocaleDateString()}</span><button onClick={()=>toggleReveal(s.id)} className="px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900">{s.isRevealed?'Hide':'Reveal'}</button></div></div>)}</div>}
      <form onSubmit={handleAdd} className="border-t border-zinc-900 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="VARIABLE_NAME" value={newKey} onChange={e=>setNewKey(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono"/><div className="flex gap-2"><input type="password" placeholder="secret value" value={newValue} onChange={e=>setNewValue(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm flex-1 font-mono"/><button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm">Secure</button></div></form>
    </div>
  );
}
