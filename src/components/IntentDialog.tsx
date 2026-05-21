import React, { useState } from 'react';
import { Sparkles, X, BrainCircuit, ArrowRight } from 'lucide-react';

interface IntentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (intent: string) => void;
}

export const IntentDialog: React.FC<IntentDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const [intent, setIntent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!intent.trim()) return;
        onSubmit(intent.trim());
        setIntent('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
            <div className="bg-[#15151b] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-2xl shadow-inner shadow-emerald-500/10">
                                    <BrainCircuit size={18} className="animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-100">AI Module Scaffolder</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Instantly generate client code templates</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                placeholder="e.g. Create a local mock API that fetches weather data and logs temperatures..."
                                rows={4}
                                className="w-full bg-black/40 border border-[#333] rounded-2xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                            />
                            
                            <div className="text-[10px] text-gray-500 italic max-w-[280px]">
                                Simulated Gemini intelligence maps prompt instructions directly inside active Aether modules.
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a24] p-4 flex justify-end gap-3 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs text-gray-400 hover:text-white font-bold px-3 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-1.5"
                        >
                            <span>Scaffold Module</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
