
import React, { useState, useEffect } from 'react';
import { X, Globe, ShieldCheck, Rocket, CheckCircle2, Loader2, Copy, ExternalLink, ArrowRight, Share2, Github } from 'lucide-react';

interface PublishDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isEli5Mode: boolean;
    onShare: () => void;
}

const PublishDialog: React.FC<PublishDialogProps> = ({ isOpen, onClose, isEli5Mode, onShare }) => {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [progress, setProgress] = useState(0);

    const STEPS = [
        { label: 'Analyzing Code Integrity', jargon: 'Validating Snapshot', icon: <ShieldCheck size={18} /> },
        { label: 'Optimizing Asset Bundle', jargon: 'Packaging for Speed', icon: <Rocket size={18} /> },
        { label: 'Pushing to Edge Cloud', jargon: 'Saving to Global Folders', icon: <Globe size={18} /> },
        { label: 'Finalizing Live URL', jargon: 'Creating Your Address', icon: <CheckCircle2 size={18} /> }
    ];

    useEffect(() => {
        if (isOpen && !isComplete) {
            let currentStep = 0;
            const interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 1;
                    if (next % 25 === 0 && currentStep < STEPS.length - 1) {
                        currentStep++;
                        setStep(currentStep);
                    }
                    if (next >= 100) {
                        clearInterval(interval);
                        setIsComplete(true);
                        return 100;
                    }
                    return next;
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [isOpen, isComplete]);

    if (!isOpen) return null;

    const reset = () => {
        setStep(0);
        setIsComplete(false);
        setProgress(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-[#333] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div className="p-8">
                    {!isComplete ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                                        <Rocket className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">
                                            {isEli5Mode ? "Taking Your App Live" : "Deploying to Production"}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            We're performing a 1-click launch to our secure global network.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {STEPS.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${step >= i ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                                        <div className={`p-2 rounded-lg flex items-center justify-center ${step > i ? 'bg-green-600/20 text-green-500' : (step === i ? 'bg-blue-600 text-white animate-pulse' : 'bg-[#27272a] text-gray-500')}`}>
                                            {step > i ? <CheckCircle2 size={18} /> : s.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-sm font-bold ${step === i ? 'text-white' : 'text-gray-400'}`}>
                                                    {isEli5Mode ? s.jargon : s.label}
                                                </span>
                                                {step === i && <Loader2 className="animate-spin text-blue-500" size={14} />}
                                            </div>
                                            <div className="h-1 w-full bg-[#27272a] rounded-full overflow-hidden">
                                                {step === i && (
                                                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${(progress % 25) * 4}%` }} />
                                                )}
                                                {step > i && <div className="h-full bg-green-600 w-full" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-24 h-24 bg-green-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <Rocket className="text-green-500" size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">It's Official.</h2>
                            <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                                Your project is now live on the internet! You've achieved the "Windows Moment" for development.
                            </p>

                            <div className="bg-[#111] border border-[#333] rounded-2xl p-4 mb-8 flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Globe className="text-blue-500 shrink-0" size={20} />
                                    <span className="text-gray-300 font-mono text-sm truncate">https://aether-app.live/project-xyz-123</span>
                                </div>
                                <button className="p-2 bg-[#27272a] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg transition-all group-hover:scale-110 active:scale-95">
                                    <Copy size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={onShare}
                                    className="flex items-center justify-center gap-2 bg-[#27272a] hover:bg-[#333] text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                                >
                                    <Share2 size={18} />
                                    Share URL
                                </button>
                                <button 
                                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                >
                                    Visit App
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-[#333] flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                    <Github size={12} />
                                    Synced with Project Locker
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                    <ShieldCheck size={12} className="text-green-500" />
                                    SSL Certificate Active
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#27272a]/30 p-6 flex justify-between items-center border-t border-[#333]">
                   {!isComplete ? (
                       <>
                           <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                               <Loader2 size={14} className="animate-spin" />
                               {isEli5Mode ? "Packaging for users..." : "Building distribution..."}
                           </div>
                           <button onClick={reset} className="text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                       </>
                   ) : (
                       <button 
                            onClick={reset}
                            className="w-full py-2 text-gray-400 hover:text-white font-bold text-sm hover:bg-white/5 rounded-xl transition-all"
                       >
                           Back to Editor
                       </button>
                   )}
                </div>
            </div>
        </div>
    );
};

export default PublishDialog;
