
import React, { useState, useEffect, useRef } from 'react';
import { RemediationResult } from '../types';
import { BrainCircuit, X, Wrench, List, AlertTriangle, ChevronDown, ChevronRight, Activity, Terminal, Shield, Play } from 'lucide-react';

interface NeuralLogsProps {
  isLoading: boolean;
  result: RemediationResult | null;
  onClose: () => void;
  onApply: () => void;
  targetTitle: string;
}

const NeuralLogs: React.FC<NeuralLogsProps> = ({ isLoading, result, onClose, onApply, targetTitle }) => {
  const [activeTab, setActiveTab] = useState<'thought' | 'plan' | 'tools'>('thought');
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-expand on new result
  useEffect(() => {
    if (result) {
        setIsExpanded(true);
        setActiveTab('thought');
    }
  }, [result]);
  
  // Auto-scroll logic for simulated streaming effect
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, activeTab]);

  if (!isLoading && !result) return null;

  return (
    <div className="absolute top-16 right-4 w-[480px] z-50 bg-[#09090b]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 ring-1 ring-white/10">
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#333] bg-[#121214]">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${isLoading ? 'bg-purple-900/20 border-purple-500/50 text-purple-400 animate-pulse' : 'bg-blue-900/20 border-blue-500/50 text-blue-400'}`}>
                {isLoading ? <BrainCircuit size={20} /> : <Shield size={20} />}
            </div>
            <div>
                <h3 className="text-sm font-bold text-white leading-none tracking-tight">
                    {isLoading ? 'Running Deep Scan...' : 'Remediation Engine'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Target: {targetTitle}</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-1">
             <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#333] transition-colors">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
             </button>
             <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-[#333] transition-colors">
                <X size={16} />
             </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col max-h-[600px]">
            {/* Loading State Animation */}
            {isLoading && (
                <div className="p-8 space-y-6 text-center bg-[#09090b]">
                    <div className="flex justify-center items-center space-x-2 relative h-8">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Omniscient Context Engine</p>
                        <p className="text-xs text-purple-300/80 font-mono animate-pulse">
                            Scanning Global Dependency Graph...
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 text-[10px] text-gray-500 font-mono">
                         <span className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#333]">Parsing HTML</span>
                         <span className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#333]">Trace Dependencies</span>
                         <span className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#333]">Anti-Patch Check</span>
                    </div>
                </div>
            )}

            {/* Results Content - The "Cognitive Accordion" */}
            {!isLoading && result && (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-[#333] bg-[#121214] sticky top-0 z-10">
                        <button 
                            onClick={() => setActiveTab('thought')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 uppercase tracking-wide ${activeTab === 'thought' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <Activity size={14} />
                            Thought Stream
                        </button>
                        <button 
                            onClick={() => setActiveTab('plan')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 uppercase tracking-wide ${activeTab === 'plan' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <List size={14} />
                            Scratchpad
                        </button>
                        <button 
                            onClick={() => setActiveTab('tools')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 uppercase tracking-wide ${activeTab === 'tools' ? 'border-green-500 text-green-400 bg-green-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <Terminal size={14} />
                            Tools
                        </button>
                    </div>

                    {/* Scrollable Body - Glass Box Transparency */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-0 bg-[#09090b] scroll-smooth min-h-[300px] max-h-[400px]">
                        
                        {/* Tab: Thoughts (Stream of Consciousness) */}
                        {activeTab === 'thought' && (
                            <div className="p-4">
                                <div className="pl-4 border-l-2 border-purple-500/30 space-y-4">
                                    <div className="text-xs font-mono text-purple-200/90 leading-relaxed whitespace-pre-wrap">
                                        {result.thoughtStream}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-purple-400/50 uppercase font-bold tracking-widest mt-4">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                        Cognitive Process Complete
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Plan (Structured) */}
                        {activeTab === 'plan' && (
                            <div className="p-4 space-y-3">
                                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Strategic Execution Plan</div>
                                {result.plan.map((step, i) => (
                                    <div key={i} className="flex gap-3 text-sm group">
                                        <div className="mt-0.5 w-5 h-5 rounded bg-[#1e1e1e] border border-blue-500/30 group-hover:border-blue-500 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 transition-colors">
                                            {i + 1}
                                        </div>
                                        <p className="text-gray-300 group-hover:text-white transition-colors leading-snug">{step}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab: Tools (Terminal View) */}
                        {activeTab === 'tools' && (
                            <div className="p-4 font-mono text-[11px] space-y-1.5 selection:bg-green-900/50">
                                {result.toolLogs.map((log, i) => (
                                    <div key={i} className="flex gap-2 border-b border-white/5 pb-1">
                                        <span className="text-green-500 font-bold shrink-0">{'>'}</span>
                                        <span className="text-gray-400">{log}</span>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    <span className="text-green-500 font-bold blink">{'>'}</span>
                                    <span className="text-green-400">Root Cause Analysis: FINISHED</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ripple Effect Warning - Always Visible */}
                    <div className="p-4 bg-[#1a0f0f] border-t border-red-500/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                        <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                            <AlertTriangle size={14} className="animate-pulse" />
                            Ripple Effect Warning
                        </div>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                            Applying this holistic fix will modify <span className="text-white font-bold">{result.impactedFiles.length} file(s)</span> to ensure architectural integrity.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.impactedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-red-900/20 border border-red-500/30 rounded text-[10px] text-red-200 font-mono">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    {file}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-3 border-t border-[#333] bg-[#121214] flex justify-end gap-3">
                         <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1e1e1e] transition-colors"
                        >
                            Discard Analysis
                        </button>
                        <button 
                            onClick={onApply}
                            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-white/10"
                        >
                            <Wrench size={14} />
                            Apply Holistic Fix
                        </button>
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default NeuralLogs;
