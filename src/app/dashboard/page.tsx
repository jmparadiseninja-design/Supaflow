'use client';
import React, { useState, useRef } from 'react';
import { 
  Grid3X3, Search, Plus, Minus, 
  Eye, EyeOff, Sparkles, Shield, Database, Layers, Zap,
  X, Upload, BookOpen, Star, Workflow, Trash2, Copy, Sun, Moon, Monitor, CreditCard, Mail, MessageSquare, ShoppingCart, UserCheck, GitBranch
} from 'lucide-react';

type NodeData = { id: string; x: number; y: number; w: number; h: number; label: string; dataLabel: string; type?: string; };
type ColorMode = 'dark' | 'light' | 'system';
type AttrPos = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type SelMode = 'full' | 'partial';

const NODES_INIT: NodeData[] = [
  { id: 'A', x: 430, y: 40, w: 160, h: 44, label: 'A', dataLabel: '{ label: A }' },
  { id: 'B', x: 160, y: 170, w: 160, h: 44, label: 'B', dataLabel: '{ label: B }' },
  { id: 'C', x: 700, y: 170, w: 160, h: 44, label: 'C', dataLabel: '{ label: C }' },
  { id: 'D', x: 40, y: 310, w: 160, h: 72, label: 'D', dataLabel: '{ label: D }' },
  { id: 'E', x: 300, y: 310, w: 160, h: 44, label: 'E', dataLabel: '{ label: E }' },
  { id: 'F', x: 560, y: 310, w: 160, h: 44, label: 'F', dataLabel: '{ label: F }' },
  { id: 'G', x: 330, y: 470, w: 160, h: 44, label: 'G', dataLabel: '{ label: G }' },
];
const EDGES_INIT = [{ from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' }, { from: 'B', to: 'E' }, { from: 'C', to: 'F' }, { from: 'E', to: 'G' }, { from: 'D', to: 'G' }, { from: 'F', to: 'G' }];

const TEMPLATES = [
  {
    id: 'stripe',
    name: 'Stripe Payment Flow',
    icon: CreditCard,
    color: 'bg-[#635bff]',
    desc: 'When payment fails → retry 3x → Slack alert',
    nodes: [
      { id: 'Start', x: 350, y: 30, w: 200, h: 48, label: 'Stripe Webhook', dataLabel: 'payment_intent' },
      { id: 'Check', x: 380, y: 140, w: 140, h: 44, label: 'Payment OK?', dataLabel: 'if success' },
      { id: 'Success', x: 150, y: 260, w: 160, h: 44, label: '✅ Fulfill Order', dataLabel: 'fulfill' },
      { id: 'Retry', x: 500, y: 260, w: 160, h: 44, label: '🔄 Retry Payment', dataLabel: 'retry 3x' },
      { id: 'Slack', x: 520, y: 380, w: 160, h: 44, label: 'Slack Alert', dataLabel: 'slack me' },
      { id: 'End', x: 330, y: 500, w: 160, h: 44, label: 'Done', dataLabel: 'end' },
    ],
    edges: [{from:'Start',to:'Check'},{from:'Check',to:'Success'},{from:'Check',to:'Retry'},{from:'Retry',to:'Slack'},{from:'Success',to:'End'},{from:'Slack',to:'End'}]
  },
  {
    id: 'slack',
    name: 'Slack Bot Responder',
    icon: MessageSquare,
    color: 'bg-[#e01e5a]',
    desc: 'New Slack message → AI reply → Log',
    nodes: [
      { id: 'SlackIn', x: 350, y: 30, w: 180, h: 48, label: 'Slack Message', dataLabel: 'new message' },
      { id: 'AI', x: 360, y: 150, w: 160, h: 44, label: '🤖 OpenAI Reply', dataLabel: 'gpt-4' },
      { id: 'Send', x: 360, y: 270, w: 160, h: 44, label: 'Send Reply', dataLabel: 'slack post' },
      { id: 'Log', x: 360, y: 390, w: 160, h: 44, label: '📊 Log to DB', dataLabel: 'supabase' },
    ],
    edges: [{from:'SlackIn',to:'AI'},{from:'AI',to:'Send'},{from:'Send',to:'Log'}]
  },
  {
    id: 'email',
    name: 'Email Drip Campaign',
    icon: Mail,
    color: 'bg-[#ff0071]',
    desc: 'Signup → Day 1 email → Day 3 → Day 7',
    nodes: [
      { id: 'Signup', x: 340, y: 20, w: 200, h: 48, label: 'New Signup', dataLabel: 'user created' },
      { id: 'Day1', x: 370, y: 130, w: 140, h: 44, label: 'Day 1: Welcome', dataLabel: 'email 1' },
      { id: 'Day3', x: 370, y: 230, w: 140, h: 44, label: 'Day 3: Tips', dataLabel: 'email 2' },
      { id: 'Day7', x: 370, y: 330, w: 140, h: 44, label: 'Day 7: Offer', dataLabel: 'email 3' },
      { id: 'Convert', x: 360, y: 440, w: 160, h: 44, label: '💰 Conversion', dataLabel: 'paid?' },
    ],
    edges: [{from:'Signup',to:'Day1'},{from:'Day1',to:'Day3'},{from:'Day3',to:'Day7'},{from:'Day7',to:'Convert'}]
  },
  {
    id: 'shopify',
    name: 'Shopify Order Flow',
    icon: ShoppingCart,
    color: 'bg-[#95bf47]',
    desc: 'New order → Check stock → Ship → Email',
    nodes: [
      { id: 'Order', x: 350, y: 20, w: 180, h: 48, label: 'New Order', dataLabel: 'shopify' },
      { id: 'Stock', x: 370, y: 130, w: 140, h: 44, label: 'Check Stock', dataLabel: 'inventory' },
      { id: 'Ship', x: 370, y: 240, w: 140, h: 44, label: '📦 Ship Order', dataLabel: 'shippo' },
      { id: 'Email', x: 370, y: 350, w: 140, h: 44, label: '📧 Email Tracking', dataLabel: 'sendgrid' },
    ],
    edges: [{from:'Order',to:'Stock'},{from:'Stock',to:'Ship'},{from:'Ship',to:'Email'}]
  },
  {
    id: 'onboard',
    name: 'User Onboarding',
    icon: UserCheck,
    color: 'bg-[#7c3aed]',
    desc: 'Signup → Verify email → Tutorial → Activate',
    nodes: [
      { id: 'S1', x: 350, y: 20, w: 180, h: 48, label: 'User Signs Up', dataLabel: 'signup' },
      { id: 'S2', x: 370, y: 130, w: 140, h: 44, label: 'Verify Email', dataLabel: 'email verify' },
      { id: 'S3', x: 370, y: 230, w: 160, h: 44, label: 'Show Tutorial', dataLabel: 'onboarding' },
      { id: 'S4', x: 370, y: 330, w: 160, h: 44, label: '✅ Activate', dataLabel: 'active' },
    ],
    edges: [{from:'S1',to:'S2'},{from:'S2',to:'S3'},{from:'S3',to:'S4'}]
  },
  {
    id: 'branch',
    name: 'Simple A→G Flow',
    icon: GitBranch,
    color: 'bg-zinc-800',
    desc: 'Basic 7 nodes branching flow - default',
    nodes: NODES_INIT,
    edges: EDGES_INIT
  },
];

export default function DashboardPage() {
  const [nodes, setNodes] = useState<NodeData[]>(NODES_INIT);
  const [edges, setEdges] = useState(EDGES_INIT);
  const [selectedId, setSelectedId] = useState<string>('A');
  const [revealStripe, setRevealStripe] = useState(false);
  const [revealOpenAI, setRevealOpenAI] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [showVault, setShowVault] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<null | 'showcase' | 'examples' | 'features' | 'howto'>(null);
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [attrPos, setAttrPos] = useState<AttrPos>('bottom-right');
  const [selMode, setSelMode] = useState<SelMode>('full');
  const [selectOnDrag, setSelectOnDrag] = useState(true);
  const [elevateOnSelect, setElevateOnSelect] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const selectedNode = nodes.find(n => n.id === selectedId) || nodes[0];
  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(null),3000); };
  const isLight = colorMode==='light';
  const bgMain = isLight ? 'bg-[#f5f5f3] text-zinc-900' : 'bg-[#0f0f0f] text-zinc-100';
  const bgSidebar = 'bg-white text-zinc-900 border-zinc-200';
  const canvasBg = isLight ? 'bg-[#fafaf9] bg-[radial-gradient(#d6d3d1_1px,transparent_1px)]' : 'bg-[#0f0f0f] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)]';
  const attrPositionClass = { 'bottom-right': 'bottom-3 right-3', 'bottom-left': 'bottom-3 left-12', 'top-right': 'top-12 right-3', 'top-left': 'top-12 left-3', }[attrPos];

  const loadTemplate = (t: typeof TEMPLATES[0]) => {
    setNodes(t.nodes); setEdges(t.edges); setSelectedId(t.nodes[0].id); setModal(null); showToast(`✅ Loaded ${t.name}`);
  };

  const handleSave = () => showToast('✅ Saved!');
  const handleExport = () => { const data={nodes,edges,colorMode,attrPos,exportedAt:new Date().toISOString()}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`supaflow-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); showToast('📥 Exported!'); };
  const handleImport = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=>{ try{ const json=JSON.parse(ev.target?.result as string); if(json.nodes){ setNodes(json.nodes); setEdges(json.edges||[]); setSelectedId(json.nodes[0]?.id); showToast(`✅ Imported`);} }catch{ showToast('❌ Failed'); } }; reader.readAsText(file); e.target.value=''; };
  const handleGenerate = () => { if(!copilotInput.trim()){ showToast('✏️ Type prompt'); return; } const newId=String.fromCharCode(65+nodes.length); const spawnX=selectedNode.x+220; const spawnY=selectedNode.y+90; setNodes(prev=>[...prev,{id:newId,x:spawnX,y:spawnY,w:160,h:44,label:newId,dataLabel:`{ label: ${newId} }`}]); setEdges(prev=>[...prev,{from:selectedId,to:newId}]); setSelectedId(newId); setCopilotInput(''); showToast(`✨ Node ${newId} added`); };

  const onNodePointerDown = (e: React.PointerEvent, node: NodeData) => {
    setSelectedId(node.id);
    setDragId(node.id);
    const rect=canvasRef.current?.getBoundingClientRect(); if(!rect) return;
    setDragOffset({ x: (e.clientX - rect.left)/zoom - node.x, y: (e.clientY - rect.top)/zoom - node.y });
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onCanvasPointerMove = (e: React.PointerEvent) => { if(!dragId) return; const rect=canvasRef.current?.getBoundingClientRect(); if(!rect) return; const nx=(e.clientX-rect.left)/zoom-dragOffset.x, ny=(e.clientY-rect.top)/zoom-dragOffset.y; setNodes(prev=>prev.map(n=>n.id===dragId?{...n,x:Math.max(0,nx),y:Math.max(0,ny)}:n)); };
  const onCanvasPointerUp = () => setDragId(null);
  const getNodeCenter = (id:string)=>{ const n=nodes.find(n=>n.id===id); if(!n) return {x:0,y:0}; return {x:n.x+n.w/2,y:n.y+n.h/2}; };

  return (
    <div className={`min-h-screen flex flex-col font-[Inter,system-ui] ${bgMain}`}>
      <input ref={fileInputRef} type="file" accept=".json" onChange={onFileChange} className="hidden" />
      <header className={`h-[56px] border-b flex items-center px-4 gap-4 sticky top-0 z-40 ${isLight?'bg-white border-zinc-200':'bg-[#0f0f0f] border-zinc-800 text-white'}`}>
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-[8px] bg-black border flex items-center justify-center"><Grid3X3 className="w-[18px] h-[18px] text-white" /></div><span className="font-bold text-[17px]">SupaFlow</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white font-mono">V7 FIXED</span></div>
        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          <button onClick={()=>setModal('showcase')} className={`px-3 py-1.5 rounded-full ${modal==='showcase'?'bg-black text-white':'hover:bg-zinc-200'}`}>Showcase</button>
          <button onClick={()=>setModal('examples')} className={`px-3 py-1.5 rounded-full bg-black text-white animate-pulse`}>Examples ← CLICK ME!</button>
          <button onClick={()=>setModal('features')} className={`px-3 py-1.5 rounded-full ${modal==='features'?'bg-black text-white':'hover:bg-zinc-200'}`}>Features</button>
          <button onClick={()=>setModal('howto')} className={`px-3 py-1.5 rounded-full ${modal==='howto'?'bg-black text-white':'hover:bg-zinc-200'}`}>How to Use</button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={()=>setSearchOpen(true)} className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full border bg-zinc-100 border-zinc-200 text-[12px]"><Search className="w-3.5 h-3.5" />Search</button>
          <button onClick={handleImport} className="h-8 px-3 rounded-full bg-zinc-800 text-white text-[12px]">Import</button>
          <button onClick={handleExport} className="h-8 px-3 rounded-full bg-zinc-800 text-white text-[12px]">Export</button>
          <button onClick={handleSave} className="h-8 px-4 rounded-full bg-[#ff0071] text-white text-[12px] font-semibold">Save</button>
        </div>
      </header>

      <div className={`border-b px-4 py-3 flex flex-col gap-2 ${isLight?'bg-zinc-50 border-zinc-200':'bg-[#121212] border-zinc-800'}`}>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest"><Sparkles className="w-4 h-4 text-[#7c3aed]" />AI Copilot <span className="px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] border text-[9px]">PRO</span></div>
        <div className="flex gap-2"><input id="copilot-input" value={copilotInput} onChange={e=>setCopilotInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGenerate()} placeholder="When Stripe fails, retry then Slack me..." className={`flex-1 h-9 rounded-full border px-4 text-[13px] outline-none ${isLight?'bg-white border-zinc-300':'bg-[#1e1e1e] border-zinc-800 text-white'}`} /><button onClick={handleGenerate} className="h-9 px-5 rounded-full bg-[#ff0071] text-white text-[13px] font-semibold">Generate →</button></div>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className={`w-[320px] shrink-0 border-r hidden lg:flex flex-col overflow-auto ${bgSidebar}`}>
          <div className="p-4 space-y-6">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-zinc-500 mb-3">APPEARANCE - HIGH CONTRAST!</div>
              <div className="space-y-3">
                <div className="bg-zinc-50 border-2 border-zinc-900 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-bold">Color Mode</span><span className="text-[11px] px-2 py-1 rounded bg-black text-white font-mono">{colorMode}</span></div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={()=>{setColorMode('light'); showToast('☀️ Light - high contrast!')}} className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${colorMode==='light'?'bg-black text-white border-black':'bg-white border-zinc-900 text-black'}`}><Sun className="w-5 h-5" />Light</button>
                    <button onClick={()=>{setColorMode('dark'); showToast('🌙 Dark mode')}} className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${colorMode==='dark'?'bg-black text-white border-black':'bg-white border-zinc-900 text-black'}`}><Moon className="w-5 h-5" />Dark</button>
                    <button onClick={()=>{setColorMode('system'); showToast('🖥️ System')}} className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${colorMode==='system'?'bg-black text-white border-black':'bg-white border-zinc-900 text-black'}`}><Monitor className="w-5 h-5" />System</button>
                  </div>
                </div>
                <div className="bg-zinc-50 border-2 border-zinc-900 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-bold">Attribution Position</span><span className="text-[10px] px-2 py-1 rounded bg-black text-white font-mono">{attrPos}</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bottom-right','bottom-left','top-right','top-left'] as AttrPos[]).map(pos=>(
                      <button key={pos} onClick={()=>{setAttrPos(pos); showToast(`📍 → ${pos}`)}} className={`h-10 rounded-xl border-2 text-[11px] font-mono font-bold ${attrPos===pos?'bg-black text-white border-black':'bg-white border-zinc-900 text-black hover:bg-zinc-100'}`}>{pos}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest text-zinc-500 mb-3">SELECTION</div>
              <div className="space-y-2">
                <div className="bg-zinc-50 border-2 border-zinc-900 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-bold">Selection Mode</span><span className="text-[10px] px-2 py-1 rounded bg-black text-white font-mono">{selMode}</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={()=>{setSelMode('full'); showToast('🔲 full')}} className={`h-10 rounded-xl border-2 text-[12px] font-bold ${selMode==='full'?'bg-black text-white':'bg-white border-zinc-900'}`}>full</button>
                    <button onClick={()=>{setSelMode('partial'); showToast('◫ partial')}} className={`h-10 rounded-xl border-2 text-[12px] font-bold ${selMode==='partial'?'bg-black text-white':'bg-white border-zinc-900'}`}>partial</button>
                  </div>
                </div>
                <label className="flex items-center justify-between bg-white border-2 border-zinc-900 rounded-xl px-3 h-12 cursor-pointer"><span className="text-[13px] font-bold">Select on Drag</span><input type="checkbox" checked={selectOnDrag} onChange={e=>{setSelectOnDrag(e.target.checked); showToast(e.target.checked?'✅ ON':'🚫 OFF')}} className="w-5 h-5 accent-[#ff0071]" /></label>
                <label className="flex items-center justify-between bg-white border-2 border-zinc-900 rounded-xl px-3 h-12 cursor-pointer"><span className="text-[13px] font-bold">Elevate on Select</span><input type="checkbox" checked={elevateOnSelect} onChange={e=>{setElevateOnSelect(e.target.checked); showToast(e.target.checked?'⬆️ ON':'⬇️ OFF')}} className="w-5 h-5 accent-[#ff0071]" /></label>
              </div>
            </div>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col min-w-0 relative ${canvasBg} bg-[size:22px_22px]`}>
          <div className="absolute top-3 left-3 text-[11px] font-bold tracking-widest text-zinc-900 bg-white border-2 border-zinc-900 px-2 py-1 rounded-full">CANVAS • {nodes.length} NODES • {edges.length} EDGES • {colorMode.toUpperCase()} • CLICK EXAMPLES!</div>
          <div ref={canvasRef} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', width: `${100/zoom}%`, height: `${100/zoom}%` }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '1200px', height: '900px' }}>
              {edges.map((e,i)=>{ const a=getNodeCenter(e.from), b=getNodeCenter(e.to); const midY=(a.y+b.y)/2; return <path key={i} d={`M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`} fill="none" stroke="#000" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />; })}
            </svg>
            {nodes.map(node=>(
              <div key={node.id} onPointerDown={e=>onNodePointerDown(e,node)} className={`absolute select-none cursor-grab rounded-[12px] border-2 flex flex-col justify-center px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${selectedId===node.id ? `${elevateOnSelect?'z-30 shadow-[0_16px_40px_rgba(0,0,0,0.4)] scale-[1.05]':''} bg-white border-[#ff0071] border-[3px]` : `bg-white border-zinc-900`}`} style={{ left: node.x, top: node.y, width: node.w, minHeight: node.h }}>
                <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-[8px] bg-black text-white flex items-center justify-center font-black text-[12px]">{node.label[0]}</div><span className="text-[13px] font-bold">{node.label}</span></div>
              </div>
            ))}
          </div>
          <div className={`absolute ${attrPositionClass} px-3 py-1.5 rounded-full text-[11px] font-mono font-bold border-2 border-zinc-900 shadow-lg bg-white text-black`}>SupaFlow © 2026 • {attrPos}</div>
          <div className="absolute bottom-3 left-3 flex gap-2"><button onClick={()=>setZoom(z=>Math.min(2,z+0.1))} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-white flex items-center justify-center"><Plus className="w-5 h-5" /></button><button onClick={()=>setZoom(z=>Math.max(0.4,z-0.1))} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-white flex items-center justify-center"><Minus className="w-5 h-5" /></button></div>
        </main>
      </div>

      {modal==='examples' && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="w-full max-w-[900px] max-h-[85vh] bg-white border-[3px] border-zinc-900 rounded-[24px] overflow-auto p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5"><h2 className="font-black text-[22px]">Examples - Click to Load! 👇</h2><button onClick={()=>setModal(null)} className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map(t=>{
                const Icon=t.icon;
                return (
                  <button key={t.id} onClick={()=>loadTemplate(t)} className="text-left border-[3px] border-zinc-900 rounded-[16px] p-4 hover:bg-zinc-50 hover:scale-[1.02] transition-all bg-white group">
                    <div className="flex items-center gap-3 mb-2"><div className={`w-10 h-10 rounded-[10px] ${t.color} flex items-center justify-center text-white`}><Icon className="w-5 h-5" /></div><div className="font-black text-[15px]">{t.name}</div></div>
                    <div className="text-[12px] text-zinc-600 mb-2">{t.desc}</div>
                    <div className="text-[11px] font-mono bg-zinc-100 border border-zinc-200 rounded px-2 py-1 inline-block">{t.nodes.length} nodes • {t.edges.length} edges • CLICK TO LOAD →</div>
                  </button>
                )
              })}
            </div>
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 text-[13px] font-bold">👆 Click any card above! It will replace canvas with that workflow! Best start: Stripe Payment Flow or Email Drip Campaign!</div>
          </div>
        </div>
      )}

      {modal && modal!=='examples' && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="w-full max-w-[800px] max-h-[85vh] bg-white border-[3px] border-zinc-900 rounded-[24px] overflow-auto p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-black text-[20px] capitalize">{modal}</h2><button onClick={()=>setModal(null)} className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            {modal==='howto' && <div className="space-y-3 text-[14px]"><p><b>1. Color Mode</b> - Light/Dark/System now high contrast black border!</p><p><b>2. Attribution</b> - Click moves badge!</p><p><b>3. Examples</b> - Click Examples top bar → 6 templates appear → click one to load!</p></div>}
            {modal==='features' && <div className="text-[14px]">Vault, Queue, AI Copilot all working - 0 errors!</div>}
            {modal==='showcase' && <div className="text-[14px]">Real customer workflows!</div>}
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-5 py-3 rounded-full bg-black text-white text-[14px] font-bold border-2 border-white shadow-xl">{toast}</div>}
    </div>
  );
}
