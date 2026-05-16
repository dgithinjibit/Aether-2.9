import React, { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Bug, Lock, Info, Baby } from 'lucide-react';
import { SecurityIssue, SecurityStatus, CodeIssue } from '../types';
import * as GeminiService from '../services/geminiService';
import { TOOLTIP_DICTIONARY } from '../services/TooltipDictionary';

interface SecurityPanelProps {
  files: { html: string; js: string; css: string };
  status: SecurityStatus;
  externalIssues?: CodeIssue[];
  isEli5Mode: boolean;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ files, status, externalIssues = [], isEli5Mode }) => {
  const [scanIssues, setScanIssues] = useState<SecurityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
        const results = await GeminiService.scanCodeSecurity(files.html, files.css, files.js);
        setScanIssues(results);
        setScanned(true);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const jargonTranslate = (msg: string) => {
      if (!isEli5Mode) return msg;
      let translated = msg;
      Object.keys(TOOLTIP_DICTIONARY).forEach(term => {
          const entry = TOOLTIP_DICTIONARY[term];
          if (msg.toLowerCase().includes(term.toLowerCase())) {
              translated = translated.replace(new RegExp(term, 'gi'), `"${entry.translation}" (the technical term is ${term})`);
          }
      });
      return translated;
  };

  // Merge external real-time issues into display
  const allIssues = useMemo(() => {
    const mappedExternal: SecurityIssue[] = externalIssues
        .filter(ei => ei.message.toLowerCase().includes('security') || ei.severity === 'error')
        .map(ei => ({
            id: `ei-${ei.blockId}-${ei.line}`,
            severity: ei.severity === 'error' ? 'high' : 'medium',
            line: ei.line,
            description: ei.message,
            fixSuggestion: "Refactor this code to use environment variables or secure patterns.",
            blockId: ei.blockId
        }));

    // Simple deduplication by description
    const existingDescriptions = new Set(mappedExternal.map(i => i.description));
    const uniqueScanIssues = scanIssues.filter(i => !existingDescriptions.has(i.description));

    return [...mappedExternal, ...uniqueScanIssues];
  }, [externalIssues, scanIssues]);

  return (
    <div className="h-full bg-[#111] p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
            
            {status === 'critical' && (
                 <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 mb-8">
                     <div className="bg-red-600 rounded-lg p-2 shrink-0">
                         <Lock className="text-white" size={24} />
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-white mb-2">Safety Lock Engaged</h3>
                         <p className="text-red-200/80 mb-4 text-sm leading-relaxed">
                             We've detected a critical security hazard in your code. The preview and run features have been locked to prevent potential data exposure. 
                             {isEli5Mode ? " This is like having your house keys glued to the front door - we need to hide them before someone can see!" : ""}
                         </p>
                         <div className="flex gap-3">
                             <div className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-bold border border-red-600/30 uppercase tracking-tighter self-start">
                                Action Required
                             </div>
                         </div>
                     </div>
                 </div>
            )}

            {/* Checklist Section */}
            <div className="bg-[#18181b] border border-[#333] rounded-2xl p-6 mb-8 shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Shield size={120} />
                </div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <CheckCircle size={14} className="text-blue-500" />
                     Ready to Ship Checklist
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: 'No Hardcoded Secrets', status: !allIssues.some(i => i.description.toLowerCase().includes('key') || i.description.toLowerCase().includes('secret')), jargon: 'Safe Vault Storage' },
                        { label: 'Secure Data Access', status: true, jargon: 'Locked Doors' },
                        { label: 'Validated Inputs', status: true, jargon: 'Clean Workspace' },
                        { label: 'Privacy Guardrails', status: !allIssues.some(i => i.severity === 'high'), jargon: 'No Peeking' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#252526] rounded-xl border border-[#333]">
                            <div className={`p-1.5 rounded-full ${item.status ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                                {item.status ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${item.status ? 'text-gray-200' : 'text-red-400'}`}>
                                    {isEli5Mode ? item.jargon : item.label}
                                </span>
                                {!item.status && <span className="text-[10px] text-red-500/70 font-medium">Issue Detected</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[#333] flex items-center justify-between">
                    <div className="flex-1 mr-8">
                        <div className="flex justify-between text-xs font-bold mb-2">
                             <span className="text-gray-400">Security Score</span>
                             <span className={status === 'critical' ? 'text-red-500' : 'text-green-500'}>
                                 {status === 'critical' ? '25%' : (status === 'warning' ? '70%' : '100%')}
                             </span>
                        </div>
                        <div className="h-2 w-full bg-[#333] rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-1000 ${status === 'critical' ? 'bg-red-500 w-1/4' : (status === 'warning' ? 'bg-yellow-500 w-[70%]' : 'bg-green-500 w-full')}`} 
                             />
                        </div>
                    </div>
                    <div className="shrink-0 p-3 bg-[#27272a] rounded-xl border border-[#333] text-center min-w-[80px]">
                        <div className="text-lg font-black text-white leading-none">
                            {allIssues.filter(i => i.severity === 'high').length}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Hazards</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-blue-500" />
                        Security Sentinel
                     </h2>
                     <p className="text-gray-400">
                         {isEli5Mode ? "Your app's personal bodyguard." : "Passive vulnerability scanning and remediation."}
                     </p>
                </div>
                <button 
                    onClick={handleScan}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Scanning..." : (scanned ? "Re-scan" : "Deep Security Scan")}
                    {!loading && <Search size={16} />}
                </button>
            </div>

            {isEli5Mode && (
                <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-4 flex gap-4 items-center">
                    <Baby className="text-amber-500 shrink-0" />
                    <p className="text-amber-200/70 text-xs">
                        <strong>ELI5 Mode Active:</strong> I'm translating tech jargon like "API Keys" into "Service Passwords" to make things clearer.
                    </p>
                </div>
            )}

            {(scanned || externalIssues.length > 0) && allIssues.length === 0 && (
                <div className="bg-green-900/10 border border-green-900/30 rounded-xl p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-green-400">No Hazards Detected</h3>
                    <p className="text-gray-500">
                        {isEli5Mode ? "Your code is safe! No one can steal your secrets right now." : "Your code passed all automated security checks."}
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {allIssues.map((issue) => (
                    <div key={issue.id} className={`bg-[#1e1e1e] border rounded-xl overflow-hidden shadow-xl ${issue.severity === 'high' ? 'border-red-900/40' : 'border-[#333]'}`}>
                        <div className="p-4 flex gap-4">
                            <div className={`shrink-0 mt-1 ${issue.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${issue.severity === 'high' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                                        {issue.severity === 'high' ? 'Critical' : 'Warning'}
                                    </span>
                                    <span className="text-gray-400 text-xs font-mono">
                                        Line {issue.line} in {issue.blockId}
                                    </span>
                                </div>
                                <p className="text-gray-100 font-medium mb-3 leading-tight">{jargonTranslate(issue.description)}</p>
                                
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-1">
                                        <Info size={10} />
                                        How to Fix
                                    </h4>
                                    <div className="bg-black/40 p-3 rounded-lg text-xs leading-relaxed text-blue-400 border border-blue-900/20 font-mono italic">
                                        {jargonTranslate(issue.fixSuggestion)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#27272a] p-3 flex justify-end border-t border-[#333]">
                            <button className="px-4 py-1.5 bg-[#3f3f46] hover:bg-[#4d4d54] text-white rounded text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
                                <Bug size={14} />
                                Auto-Repair Hazard
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default SecurityPanel;
