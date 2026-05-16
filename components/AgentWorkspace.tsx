import React from 'react';
import { AgentPlan, AgentState, AgentTask, AgentLog } from '../types';
import { CheckCircle, Circle, Play, Loader2, FileText, ListChecks, ShieldCheck, Terminal, BrainCircuit, Activity, Stethoscope } from 'lucide-react';

interface AgentWorkspaceProps {
  state: AgentState;
  plan: AgentPlan | null;
  logs: AgentLog[];
  onApprovePlan: () => void;
  onCancel: () => void;
}

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ state, plan, logs, onApprovePlan, onCancel }) => {
  
  if (state === AgentState.PLANNING) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#18181b] border-l border-[#333]">
        <div className="relative mb-6">
            <BrainCircuit size={48} className="text-purple-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Architecting Solution...</h3>
        <p className="text-gray-400 text-sm max-w-xs">Aether is analyzing requirements, breaking down tasks, and defining success criteria.</p>
      </div>
    );
  }

  if (!plan) return null;

  // Find the active task for highlighting
  const activeTask = plan.tasks.find(t => t.status === 'running');

  return (
    <div className="h-full flex flex-col bg-[#18181b] border-l border-[#333] text-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333] bg-[#1f1f22] flex items-center justify-between">
        <div className="flex items-center gap-2">
            <BrainCircuit className="text-purple-500" size={18} />
            <span className="font-semibold text-white">Agentic Core</span>
        </div>
        <div className="text-xs px-2 py-0.5 rounded bg-[#333] text-gray-300">
            {state === AgentState.REVIEW_PLAN ? 'Waiting Approval' : state === AgentState.EXECUTING ? 'Autonomous Mode' : 'Completed'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. The Plan (Markdown Overview) */}
        <div className="p-4 border-b border-[#333]">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
                <FileText size={16} />
                <h4 className="font-bold uppercase text-xs tracking-wider">Plan.md</h4>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 text-xs leading-relaxed bg-[#27272a] p-3 rounded-lg border border-[#3f3f46]">
                {plan.overview}
            </div>
        </div>

        {/* 2. Task List */}
        <div className="p-4 border-b border-[#333]">
            <div className="flex items-center gap-2 mb-3 text-green-400">
                <ListChecks size={16} />
                <h4 className="font-bold uppercase text-xs tracking-wider">Tasks.json</h4>
            </div>
            <div className="space-y-2">
                {plan.tasks.map((task) => (
                    <div 
                        key={task.id} 
                        className={`p-3 rounded border transition-colors ${
                            task.status === 'running' ? 'bg-blue-900/10 border-blue-500/50' : 
                            task.status === 'completed' ? 'bg-green-900/10 border-green-900/30' : 
                            task.status === 'failed' ? 'bg-red-900/10 border-red-900/30' :
                            'bg-[#27272a] border-[#3f3f46]'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {task.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                                {task.status === 'pending' && <Circle size={16} className="text-gray-500" />}
                                {task.status === 'running' && (
                                    task.subStatus === 'healing' ? <Stethoscope size={16} className="text-red-400 animate-pulse" /> :
                                    task.subStatus === 'verifying' ? <ShieldCheck size={16} className="text-yellow-400 animate-pulse" /> :
                                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                                )}
                                {task.status === 'failed' && <Circle size={16} className="text-red-500" />}
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between items-start">
                                    <h5 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                        {task.label}
                                    </h5>
                                    {task.status === 'running' && task.subStatus && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${
                                            task.subStatus === 'healing' ? 'bg-red-900/30 text-red-400' :
                                            task.subStatus === 'verifying' ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-blue-900/30 text-blue-400'
                                        }`}>
                                            {task.subStatus}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                
                                {/* Critique Display if active */}
                                {task.critique && task.status !== 'completed' && (
                                    <div className="mt-2 p-2 bg-red-900/20 border border-red-900/40 rounded text-xs text-red-300">
                                        <div className="flex items-center gap-1 mb-1 font-semibold">
                                            <Activity size={12} />
                                            <span>Issues Detected:</span>
                                        </div>
                                        {task.critique}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. Tests / Quality Gate */}
        <div className="p-4 border-b border-[#333]">
            <div className="flex items-center gap-2 mb-2 text-yellow-400">
                <ShieldCheck size={16} />
                <h4 className="font-bold uppercase text-xs tracking-wider">Tests.spec</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs pl-1">
                {plan.tests.map((test, idx) => (
                    <li key={idx}>{test}</li>
                ))}
            </ul>
        </div>
        
        {/* 4. Shadow Critic / Logs */}
        <div className="p-4">
             <div className="flex items-center gap-2 mb-2 text-purple-400">
                <Terminal size={16} />
                <h4 className="font-bold uppercase text-xs tracking-wider">Thinking Process</h4>
            </div>
            <div className="font-mono text-xs space-y-2">
                {logs.slice().reverse().map((log) => (
                    <div key={log.id} className={`p-2 rounded border-l-2 ${
                        log.stage === 'heal' ? 'bg-red-900/10 border-red-500' :
                        log.stage === 'review' ? 'bg-yellow-900/10 border-yellow-500' :
                        'bg-black/30 border-purple-500/50'
                    }`}>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span className="uppercase font-bold">{log.stage}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{log.message}</p>
                        {log.thoughtProcess && (
                            <div className="mt-1 pt-1 border-t border-gray-800 text-gray-500 italic">
                                "{log.thoughtProcess}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-[#333] bg-[#1f1f22]">
        {state === AgentState.REVIEW_PLAN ? (
            <div className="flex gap-2">
                <button 
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-[#27272a] hover:bg-[#333] text-white rounded font-medium transition-colors"
                >
                    Reject
                </button>
                <button 
                    onClick={onApprovePlan}
                    className="flex-[2] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                    <Play size={16} fill="currentColor" />
                    Approve Plan & Execute
                </button>
            </div>
        ) : state === AgentState.EXECUTING ? (
            <div className="flex items-center justify-center gap-2 text-blue-400 py-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="font-medium animate-pulse">
                    {activeTask?.subStatus === 'verifying' ? 'Verifying...' : 
                     activeTask?.subStatus === 'healing' ? 'Self-Healing...' : 
                     'Executing Task...'}
                </span>
            </div>
        ) : (
             <button 
                onClick={onCancel}
                className="w-full px-4 py-2 bg-[#27272a] hover:bg-[#333] text-gray-300 rounded text-sm transition-colors"
            >
                Start New Task
            </button>
        )}
      </div>
    </div>
  );
};

export default AgentWorkspace;