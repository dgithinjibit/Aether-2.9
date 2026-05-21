import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, HelpCircle, Eye, EyeOff, Search } from 'lucide-react';

interface SecurityViewProps {
    isEli5Mode: boolean;
    setEli5Mode: (val: boolean) => void;
}

const DICTIONARY: Record<string, { trans: string; desc: string; cat: string }> = {
    'LocalStorage': { trans: 'Browser Secret Drawer', desc: 'A small portion of lockable storage in your web browser that recalls variables even if you refresh or lock the screen.', cat: 'data' },
    'Callback': { trans: 'Later Instructions', desc: 'A programmatic checklist waiting for an external task to clear before initiating its own instructions.', cat: 'code' },
    'Async/Await': { trans: 'Red-Light Signal Handler', desc: 'Tells the processor to park its vehicle and wait until a slow network payload arrives before accelerating.', cat: 'code' },
    'Backend': { trans: 'Server Vault Machinery', desc: 'A secure cloud engine that handles raw inputs, stores database lockers, and runs authentication away from the browser.', cat: 'servers' },
    'Environment Variables': { trans: 'Secure Keyring Set', desc: 'Settings, passwords, and private identifiers kept in a system-example file to configure variables without rewriting raw lines.', cat: 'security' },
    'Deployment': { trans: 'Going Live Internationally', desc: 'Taking all bundle distributions and shipping them to production web servers so other browsers can fetch them.', cat: 'deploy' },
    'CI/CD': { trans: 'Autopilot Delivery Tracks', desc: 'An automatic pipeline that builds, tests, checks security issues, and updates the app live whenever you save changes to the cloud.', cat: 'operations' },
    'API Keys': { trans: 'VIP Entrance Passes', desc: 'Special security keys that authenticate your app to interact with external databases (such as Gemini NLP) securely.', cat: 'security' }
};

export const SecurityView: React.FC<SecurityViewProps> = ({ isEli5Mode, setEli5Mode }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDict = Object.entries(DICTIONARY).filter(([key, val]) => {
        return key.toLowerCase().includes(searchQuery.toLowerCase()) || 
               val.trans.toLowerCase().includes(searchQuery.toLowerCase()) ||
               val.desc.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-8 custom-scrollbar">
            {/* ELI5 Translation Toggle Banner */}
            <div className="bg-gradient-to-r from-indigo-950/40 to-black/20 border border-indigo-500/10 p-5 rounded-3xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-xl pointer-events-none rounded-full" />
                <div className="flex-1 mr-4 z-10">
                    <h3 className="text-sm font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                        {isEli5Mode ? "👶 ELI5 Translator Engaged" : "🛡️ Jargon Translate Mode"}
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        {isEli5Mode 
                            ? "Converting advanced developer terminology into simplified, kindergarten physical analogies." 
                            : "Standard production jargon is shown. Flip the switch below to decode specialized developer slang."}
                    </p>
                </div>
                <button
                    onClick={() => setEli5Mode(!isEli5Mode)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${isEli5Mode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                    {isEli5Mode ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isEli5Mode ? "ELI5: On" : "Simplify Jargon"}</span>
                </button>
            </div>

            {/* Checklist Section */}
            <div className="bg-[#141419] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <Shield size={120} />
                </div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <CheckCircle size={14} className="text-indigo-400" />
                     Production Ship Audit
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                    {[
                        { label: 'Sandbox Integrity Check', jargon: 'Unbreachable Guardrails', status: true, desc: 'Container security constraints are secure.' },
                        { label: 'Microphone & Media Access Policy', jargon: 'Hardware Pipeline Authorization', status: true, desc: 'Prompts configured appropriately.' },
                        { label: 'Secrets Injection Audit', jargon: 'No Keys Leaked Outside Keyring', status: true, desc: 'Environment configuration isolated.' },
                        { label: 'Asset Package Validation', jargon: 'Optimized Distribution Size', status: true, desc: 'Modules bundles cleared for CDN execution.' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-black/40 rounded-2xl border border-white/5">
                            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs mt-0.5 shrink-0">
                                <CheckCircle size={13} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-200 truncate">
                                    {isEli5Mode ? item.jargon : item.label}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">
                                    {item.desc}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between text-[11px] font-bold mb-2">
                             <span className="text-gray-400">Environment Safety Rating</span>
                             <span className="text-indigo-400">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 w-full transition-all" />
                        </div>
                    </div>
                    <div className="shrink-0 p-3 bg-black/50 rounded-xl border border-white/5 text-center min-w-[70px]">
                        <div className="text-base font-black text-indigo-400 leading-none">0</div>
                        <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">Faults</div>
                    </div>
                </div>
            </div>

            {/* Dictionary / Look Up Cards */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <HelpCircle size={14} className="text-gray-500" />
                            Aether Developer Lexicon
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1">
                            A quick simplified directory translation checklist of common production phrases.
                        </p>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search lexicon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                        />
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDict.map(([key, item]) => (
                        <div key={key} className="p-4 bg-[#141419] border border-white/5 rounded-2xl flex flex-col gap-2 transition-all hover:border-indigo-500/20">
                            <div className="flex justify-between items-start gap-2">
                                <span className="font-mono text-xs text-gray-200 font-bold">{key}</span>
                                <span className="text-[8px] uppercase font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full select-none">
                                    {item.cat}
                                </span>
                            </div>
                            <div className="p-2 border-l-2 border-indigo-500 bg-indigo-500/5 rounded-r">
                                <div className="text-[10px] font-bold text-indigo-300">
                                    ELI5: {item.trans}
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-sans mt-0.5">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                    {filteredDict.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500 italic text-xs">
                            No match found in our active ledger.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
