
'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AICopilot({ onGenerateWorkflow }: { onGenerateWorkflow?: (nodes: any[], edges: any[], explanation: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt: finalPrompt, type: 'generate_workflow', userId: user?.id }
      });
      if (error) throw error;
      setResult(data);
      if (data.nodes && onGenerateWorkflow) onGenerateWorkflow(data.nodes, data.edges, data.explanation || '');
    } catch (err: any) {
      const mock = {
        nodes: [
          { id: '1', type: 'input', position: { x: 100, y: 150 }, data: { label: '⚡ ' + finalPrompt.slice(0,25) } },
          { id: '2', position: { x: 400, y: 150 }, data: { label: '🔐 Vault Check' } },
          { id: '3', type: 'output', position: { x: 700, y: 150 }, data: { label: '📬 Queue Job' } },
        ],
        edges: [{ id: 'e1-2', source: '1', target: '2', animated: true }, { id: 'e2-3', source: '2', target: '3' }],
        explanation: `Demo workflow for: ${finalPrompt}`,
        is_mock: true
      };
      setResult(mock);
      if (onGenerateWorkflow) onGenerateWorkflow(mock.nodes, mock.edges, mock.explanation);
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div><h2 className="text-xl font-semibold text-white">🧠 SupaFlow AI Copilot <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">PRO • AI</span></h2><p className="text-xs text-zinc-400 mt-1">Describe in English — AI builds the canvas</p></div>
        <span className="text-xs font-mono text-zinc-500">{result?.is_mock ? 'Mock Mode' : result ? '✨ AI Generated' : 'Ready'}</span>
      </div>
      <div className="flex gap-2">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} placeholder="e.g. When Stripe payment fails, retry then Slack me..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600" />
        <button onClick={() => handleGenerate()} disabled={loading || !prompt.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white px-6 py-2.5 rounded-md text-sm font-semibold">{loading ? '🧠 Thinking...' : 'Generate →'}</button>
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        {['When Stripe payment fails, retry 3 times then Slack me','Every weekday at 2am vacuum the database','When user signs up, send welcome email via queue'].map((ex) => (
          <button key={ex} onClick={() => { setPrompt(ex); handleGenerate(ex); }} className="text-[11px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 px-3 py-1 rounded-full">{ex}</button>
        ))}
      </div>
      {result && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mt-4">
          <p className="text-sm text-white font-medium">{result.explanation}</p>
          <p className="text-[11px] text-zinc-500 mt-2">{result.is_mock ? '💡 Mock AI - add OPENAI_API_KEY in Supabase for real GPT-4o-mini' : 'Real AI powered by gpt-4o-mini'}</p>
        </div>
      )}
    </div>
  );
}
