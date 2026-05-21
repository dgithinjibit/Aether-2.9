import React, { useState, useRef, useEffect } from 'react';
import { LogItem } from '../types';
import { Terminal, Trash2, ArrowRight, CornerDownRight, PlayCircle } from 'lucide-react';

interface TerminalViewProps {
    logs: LogItem[];
    onClearLogs: () => void;
    onExecuteCommand: (cmd: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ logs, onClearLogs, onExecuteCommand }) => {
    const [command, setCommand] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;
        onExecuteCommand(command.trim());
        setCommand('');
    };

    // Auto-scroll logs as new entries arrive
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-[#0d0d11] rounded-2xl border border-white/5 overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#13131a] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-indigo-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Aether Interactive Shell</span>
                </div>
                <button
                    onClick={onClearLogs}
                    className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg transition-all"
                    title="Clear Buffer Logs"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Run logs */}
            <div ref={containerRef} className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2.5 custom-scrollbar bg-[#09090c]">
                {logs.length === 0 ? (
                    <div className="text-gray-600 italic select-none">
                        No activity recorded. Ready for evaluation...
                    </div>
                ) : (
                    logs.map((log, i) => {
                        let textClass = 'text-gray-300';
                        if (log.type === 'system') textClass = 'text-indigo-400';
                        if (log.type === 'security') textClass = 'text-amber-500 font-bold';
                        if (log.type === 'success') textClass = 'text-emerald-400 font-bold';
                        if (log.type === 'error') textClass = 'text-rose-500 font-bold';
                        if (log.type === 'output') textClass = 'text-sky-300';
                        if (log.type === 'input') textClass = 'text-gray-500 italic';

                        return (
                            <div key={i} className="flex items-start gap-2 leading-relaxed break-all">
                                <span className="text-indigo-500/70 select-none">❯</span>
                                <div className="flex-1">
                                    {log.fileName && (
                                        <span className="text-[10px] bg-white/5 text-gray-400 px-1 py-0.2 rounded font-sans border border-white/5 mr-1.5">
                                            {log.fileName}
                                        </span>
                                    )}
                                    <span className={textClass}>{log.message}</span>
                                </div>
                                <span className="text-[9px] text-gray-600 font-sans shrink-0">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Terminal input console prompt */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#13131a] border-t border-white/5 flex items-center gap-2">
                <div className="text-indigo-500/70 shrink-0 select-none">
                    <CornerDownRight size={14} />
                </div>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Evaluate code dynamically... e.g. Math.sqrt(81)"
                    className="flex-1 bg-transparent border-none text-gray-100 font-mono text-[11px] placeholder-gray-600 focus:outline-none focus:ring-0"
                />
                <button
                    type="submit"
                    className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white/90 rounded text-[10px] font-sans font-bold flex items-center gap-1.5 transition-all"
                >
                    <span>Send</span>
                    <ArrowRight size={10} />
                </button>
            </form>
        </div>
    );
};
