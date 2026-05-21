import React, { useState } from 'react';
import { Database, Plus, Trash2, Cpu, Globe, Check, Sparkles, CheckCircle } from 'lucide-react';
import { LibraryPackage } from '../types';

interface StudioViewProps {
    packages: LibraryPackage[];
    onAddPackage: (name: string, url: string) => void;
    onRemovePackage: (url: string) => void;
    onInjectCapability: (cap: { title: string; filename: string; content: string; blockType: string }) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
    packages,
    onAddPackage,
    onRemovePackage,
    onInjectCapability
}) => {
    const [libName, setLibName] = useState('');
    const [libUrl, setLibUrl] = useState('');
    const [statusToast, setStatusToast] = useState('');

    const CAPABILITIES = [
        {
            title: 'Voice dictation prompt capture model',
            desc: 'Converts hardware audio streams from permission requests into system actions.',
            filename: 'voice_command.js',
            blockType: 'js',
            content: `// Voice Command Listener Module\nasync function captureVoiceCommand() {\n  console.log("[System]: Activating hardware audio pipeline stream...");\n  // Prompt voice modal\n  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();\n  recognition.start();\n  recognition.onresult = (event) => {\n    const text = event.results[0][0].transcript;\n    console.log("[Audio Output]: Voice detected: " + text);\n  };\n}`
        },
        {
            title: 'Biometric Android Security Locker',
            desc: 'Local high-security keychain model utilizing modern SQLite container bounds.',
            filename: 'security_locker.json',
            blockType: 'json',
            content: `{\n  "secure_vault": true,\n  "encryption": "AES-256-GCM",\n  "offline_synced": true,\n  "android_keychain_enabled": true\n}`
        },
        {
            title: 'Direct GPS Real-Time Matrix',
            desc: 'Establishes continuous telemetry links with precise device spatial models.',
            filename: 'spatial_matrix.css',
            blockType: 'css',
            content: `/* Coordinate Matrix */\n.matrix-canvas {\n  position: relative;\n  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%);\n  border: 1px solid rgba(255,255,255,0.05);\n}`
        }
    ];

    const handleAdd = () => {
        if (!libName.trim() || !libUrl.trim()) return;
        onAddPackage(libName.trim(), libUrl.trim());
        setLibName('');
        setLibUrl('');
        setStatusToast('Library bounds compiled successfully!');
        setTimeout(() => setStatusToast(''), 4000);
    };

    const handleInject = (cap: typeof CAPABILITIES[0]) => {
        onInjectCapability(cap);
        setStatusToast(`Capability injected: ${cap.filename}`);
        setTimeout(() => setStatusToast(''), 4000);
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-8 custom-scrollbar">
            {/* Status Toast Notification */}
            {statusToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-500 font-sans text-xs text-white font-bold px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom-2">
                    <CheckCircle size={14} />
                    <span>{statusToast}</span>
                </div>
            )}

            {/* Capability Deck */}
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={14} className="text-indigo-400" />
                        Aether App Capability Deck
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">
                        Inject secure pre-formatted systems directly into your local codebase.
                    </p>
                </div>

                <div className="space-y-3">
                    {CAPABILITIES.map((cap, i) => (
                        <div key={i} className="bg-[#141419] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-200 truncate">{cap.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 leading-normal">{cap.desc}</p>
                                <span className="inline-block text-[8px] font-mono font-bold bg-white/5 text-gray-400 px-2 mt-2 rounded border border-white/5">{cap.filename}</span>
                            </div>
                            <button
                                onClick={() => handleInject(cap)}
                                className="shrink-0 flex items-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                            >
                                <Sparkles size={11} className="animate-pulse text-indigo-400 group-hover:text-white" />
                                <span>Inject</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Library Manager */}
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={14} className="text-gray-400" />
                        CDN Library Packages
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">
                        Sync and include remote scripts safely inside your sandboxed app instance.
                    </p>
                </div>

                <div className="bg-[#141419] p-5 border border-white/5 rounded-3xl flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Register Remote CDN Link</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="lodash"
                            value={libName}
                            onChange={(e) => setLibName(e.target.value)}
                            className="bg-black/40 border border-[#333] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                        />
                        <input
                            type="text"
                            placeholder="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
                            value={libUrl}
                            onChange={(e) => setLibUrl(e.target.value)}
                            className="bg-black/40 border border-[#333] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={14} />
                        Add Library to Sandbox Bundle
                    </button>
                </div>

                {/* Library Listing */}
                <div className="space-y-2">
                    {packages.map((pkg, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl text-xs">
                            <div className="flex-1 min-w-0 pr-4">
                                <span className="font-bold text-gray-200 block truncate">{pkg.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono truncate block mt-0.5">{pkg.url}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <span className="text-[10px] font-mono text-gray-400">{pkg.size}</span>
                                <button
                                    onClick={() => onRemovePackage(pkg.url)}
                                    className="p-1 px-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
