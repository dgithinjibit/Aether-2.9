
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { Terminal, XCircle, AlertTriangle, Info, Ban, ChevronDown, ChevronRight, FileCode, Search, Filter } from 'lucide-react';

interface ConsoleProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

const LogItem: React.FC<{ log: LogEntry; isEven: boolean }> = ({ log, isEven }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasDetails = log.stack || log.fileName;

    return (
        <div className={`font-mono text-[11px] leading-relaxed border-b border-[#2a2a2a] group ${isEven ? 'bg-[#1e1e1e]' : 'bg-[#18181b]'} hover:bg-[#2a2d2e] transition-colors`}>
            {/* Main Log Row */}
            <div 
                className="flex items-start gap-2 px-2 py-1 cursor-pointer"
                onClick={() => hasDetails && setIsExpanded(!isExpanded)}
            >
                {/* Icon */}
                <div className="mt-0.5 shrink-0 opacity-80">
                    {log.type === 'error' && <XCircle size={14} className="text-red-500" />}
                    {log.type === 'warn' && <AlertTriangle size={14} className="text-yellow-500" />}
                    {log.type === 'info' && <Info size={14} className="text-blue-500" />}
                    {log.type === 'log' && <div className="w-3.5" />} {/* Spacer */}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 overflow-hidden break-words">
                     <span className={`${
                        log.type === 'error' ? 'text-red-300' : 
                        log.type === 'warn' ? 'text-yellow-300' : 
                        'text-gray-300'
                     }`}>
                        {log.message}
                     </span>
                </div>

                {/* Right Side Info */}
                <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     {log.fileName && (
                        <div className="text-gray-500 hover:text-blue-400 hover:underline cursor-pointer flex items-center gap-1" title={`${log.fileName}:${log.lineNumber}`}>
                            <span className="truncate max-w-[100px]">{log.fileName}{log.lineNumber ? `:${log.lineNumber}` : ''}</span>
                        </div>
                    )}
                </div>

                {/* Count Badge (Grouping) */}
                {log.count > 1 && (
                     <div className="px-1.5 py-0.5 rounded-full bg-gray-700 text-white text-[10px] font-bold min-w-[20px] text-center shadow-sm">
                        {log.count}
                    </div>
                )}
            </div>

            {/* Expanded Stack Trace */}
            {isExpanded && hasDetails && (
                <div className="px-8 pb-2 pt-1 bg-black/20 text-gray-500 border-l-2 border-gray-700/50 ml-4 mb-1">
                    {log.stack ? (
                        <div className="space-y-0.5">
                            {log.stack.split('\n').map((line, i) => (
                                <div key={i} className={`whitespace-pre-wrap ${i === 0 ? 'font-semibold text-gray-400' : 'pl-4 hover:text-gray-300'}`}>
                                    {line.trim().replace(/^at /, '')}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                             <FileCode size={12} />
                             Source: <span className="text-blue-400">{log.fileName}:{log.lineNumber}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Console: React.FC<ConsoleProps> = ({ logs, isOpen, onToggle, onClear }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warn' | 'info'>('all');

  // Counts for the badges
  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const filteredLogs = useMemo(() => {
      return logs.filter(log => {
          const matchesText = log.message.toLowerCase().includes(filterText.toLowerCase());
          const matchesType = filterType === 'all' || log.type === filterType;
          return matchesText && matchesType;
      });
  }, [logs, filterText, filterType]);

  return (
    <div className={`flex flex-col bg-[#1e1e1e] border-t border-[#333] transition-all duration-300 ${isOpen ? 'h-64' : 'h-8'}`}>
      
      {/* Console Toolbar */}
      <div 
        className="flex items-center justify-between px-3 h-8 bg-[#252526] select-none border-b border-[#333] cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
                <Terminal size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">Console</span>
            </div>

            {/* Interactive Counters (VS Code style) */}
            <div className="flex items-center gap-3 text-[11px]" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setFilterType(filterType === 'error' ? 'all' : 'error')}
                    className={`flex items-center gap-1 px-1 rounded hover:bg-[#333] transition-colors ${filterType === 'error' ? 'bg-[#333] text-white' : 'text-gray-400'}`}
                >
                    <XCircle size={12} className={errorCount > 0 ? "text-red-500" : "text-gray-500"} />
                    <span>{errorCount}</span>
                </button>
                <button 
                    onClick={() => setFilterType(filterType === 'warn' ? 'all' : 'warn')}
                    className={`flex items-center gap-1 px-1 rounded hover:bg-[#333] transition-colors ${filterType === 'warn' ? 'bg-[#333] text-white' : 'text-gray-400'}`}
                >
                    <AlertTriangle size={12} className={warnCount > 0 ? "text-yellow-500" : "text-gray-500"} />
                    <span>{warnCount}</span>
                </button>
            </div>
        </div>

        {isOpen && (
             <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <Search className="absolute left-2 top-1.5 text-gray-500" size={12} />
                    <input 
                        type="text" 
                        placeholder="Filter" 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="bg-[#3c3c3c] text-white text-[11px] rounded pl-6 pr-2 py-0.5 border border-transparent focus:border-blue-500 focus:outline-none w-32 focus:w-48 transition-all"
                    />
                </div>
                <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
                <button 
                    onClick={onClear}
                    className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                    title="Clear Console"
                >
                    <Ban size={14} />
                </button>
                <button 
                    onClick={onToggle}
                    className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronDown size={14} />
                </button>
            </div>
        )}
      </div>

      {/* Log Output */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
            {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 italic gap-2 opacity-50">
                    <span>No output to display</span>
                </div>
            ) : (
                <div className="flex flex-col min-h-full pb-2">
                    {filteredLogs.map((log, idx) => (
                        <LogItem key={log.id || idx} log={log} isEven={idx % 2 === 0} />
                    ))}
                    <div ref={endRef} />
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Console;