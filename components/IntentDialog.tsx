
import React, { useState } from 'react';
import { X, Sparkles, BrainCircuit, Code2, Zap } from 'lucide-react';

interface IntentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (intent: string) => void;
}

const IntentDialog: React.FC<IntentDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const [intent, setIntent] = useState('');

    if (!isOpen) return null;

    const SUGGESTIONS = [
        "A calculator that works in the sidebar",
        "A game loop with a score system",
        "A way to fetch weather data safely",
        "An animation for a page transition"
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600/20 p-2 rounded-lg">
                                <BrainCircuit className="text-purple-500" size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">What are we building?</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        Tell Aether what this module should do in plain English. No jargon required. We'll handle the architectural "Seat Belts" for you.
                    </p>

                    <textarea 
                        autoFocus
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        placeholder="e.g., A system to manage a persistent list of tasks..."
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none min-h-[120px] transition-all resize-none shadow-inner"
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => setIntent(s)}
                                className="text-[10px] bg-[#27272a] hover:bg-[#333] text-gray-400 hover:text-gray-200 px-3 py-1 rounded-full border border-transparent hover:border-[#444] transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#27272a]/50 p-4 flex justify-end gap-3 border-t border-[#333]">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => intent && onSubmit(intent)}
                        disabled={!intent}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                    >
                        <Sparkles size={16} />
                        Scaffold Module
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntentDialog;
