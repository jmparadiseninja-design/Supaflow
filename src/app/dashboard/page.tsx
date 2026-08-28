'use client';
import { useState } from 'react';
import AICopilot from '@/components/AICopilot';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import VaultSafe from '@/components/VaultSafe';
import QueueMonitor from '@/components/QueueMonitor';

export default function DashboardPage() {
  const [aiWorkflow, setAiWorkflow] = useState<any>(null);

  const handleGenerate = (nodes: any[], edges: any[], explanation: string) => {
    setAiWorkflow({ nodes, edges, explanation });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">SupaFlow V2 Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AICopilot onGenerateWorkflow={handleGenerate} />
          <WorkflowBuilder aiWorkflow={aiWorkflow} />
        </div>
        <div className="space-y-6">
          <VaultSafe />
          <QueueMonitor />
        </div>
      </div>
    </div>
  );
}