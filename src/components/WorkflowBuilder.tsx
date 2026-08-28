'use client';
import { useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: any[] = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start' } },
  { id: '2', position: { x: 300, y: 100 }, data: { label: 'Process' } },
];

const initialEdges: any[] = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

export default function WorkflowBuilder({ aiWorkflow }: { aiWorkflow?: any }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (aiWorkflow?.nodes?.length) {
      setNodes(aiWorkflow.nodes);
      setEdges(aiWorkflow.edges || []);
    }
  }, [aiWorkflow]);

  return (
    <div className="w-full h-[650px] bg-[#0f172a] rounded-xl border border-white/10 p-4 flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-4">Canvas (AI Generated)</h2>
      <div className="w-full flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
} 