import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, Rocket, CheckCircle2, Loader2, Copy, ArrowRight, Share2, Github } from 'lucide-react';

interface PublishDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isEli5Mode: boolean;
    onShare: () => void;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({ isOpen, onClose, isEli5Mode, onShare }) => {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);

    const STEPS = [
        { label: 'Analyzing Code Integrity', jargon: 'Validating Code Locker', icon: <ShieldCheck size={18} /> },
        { label: 'Optimizing Asset Bundle', jargon: 'Packaging for Internet Speed', icon: <Rocket size={18} /> },
        { label: 'Pushing to Edge Cloud', jargon: 'Deploying to Global Folders', icon: <Globe size={18} /> },
        { label: 'Finalizing SSL Certificates', jargon: 'Securing Your Live Address', icon: <CheckCircle2 size={18} /> }
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
            }, 35);
            return () => clearInterval(interval);
        }
    }, [isOpen, isComplete]);

    if (!isOpen) return null;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText('https://aether-app.live/sandbox-auth-9281');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        onShare();
    };

    const reset = () => {
        setStep(0);
        setIsComplete(false);
        setProgress(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
            <div className="bg-[#15151b] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    {!isComplete ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
                                    <Rocket size={22} className="animate-bounce" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-white tracking-tight">
                                        {isEli5Mode ? "Taking Your App Live" : "Vercel / Railway Direct Deploy"}
                                    </h2>
                                    <p className="text-gray-400 text-[10px] leading-normal">
                                        Assembling and provisioning SSL resources across secure globally routed edge nodes.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {STEPS.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-3.5 transition-all duration-300 ${step >= i ? 'opacity-100' : 'opacity-25'}`}>
                                        <div className={`p-2 rounded-xl flex items-center justify-center text-xs shrink-0 ${step > i ? 'bg-emerald-500/10 text-emerald-400' : (step === i ? 'bg-indigo-600 text-white animate-pulse' : 'bg-[#222] text-gray-500')}`}>
                                            {step > i ? <CheckCircle2 size={16} /> : s.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold truncate ${step === i ? 'text-white' : 'text-gray-400'}`}>
                                                    {isEli5Mode ? s.jargon : s.label}
                                                </span>
                                                {step === i && <Loader2 className="animate-spin text-indigo-400" size={12} />}
                                            </div>
                                            <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                                                {step === i && (
                                                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(progress % 25) * 4}%` }} />
                                                )}
                                                {step > i && <div className="h-full bg-emerald-500 w-full" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                                <Rocket className="text-emerald-400" size={32} />
                            </div>
                            <h2 className="text-lg font-black text-white mb-1">Production Successful!</h2>
                            <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                                Project deployed. Complete SSL registration resolved on world edge coordinates.
                            </p>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3 group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Globe className="text-indigo-400 shrink-0" size={16} />
                                    <span className="text-gray-300 font-mono text-xs truncate">https://aether-app.live/sandbox-auth-9281</span>
                                </div>
                                <button
                                    onClick={handleCopyUrl}
                                    className={`p-2 rounded-xl transition-all active:scale-95 shrink-0 ${copied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white'}`}
                                >
                                    {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button 
                                    onClick={handleCopyUrl}
                                    className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-gray-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 border border-white/5"
                                >
                                    <Share2 size={14} />
                                    Copy Link
                                </button>
                                <a 
                                    href="https://aether-app.live/sandbox-auth-9281"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold text-xs transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                                >
                                    Visit App
                                    <ArrowRight size={14} />
                                </a>
                            </div>
                            
                            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-5">
                                <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold text-gray-500 tracking-wider">
                                    <Github size={11} />
                                    Synced Project Locker
                                </div>
                                <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold text-gray-500 tracking-wider">
                                    <ShieldCheck size={11} className="text-emerald-400" />
                                    Encrypted Core SSL
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#1a1a24] p-4 flex justify-between items-center border-t border-white/5">
                   {!isComplete ? (
                       <>
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                               <Loader2 size={12} className="animate-spin" />
                               {isEli5Mode ? "Building box..." : "Assembling Bundle Assets"}
                           </div>
                           <button onClick={reset} className="text-gray-400 hover:text-white font-bold text-xs">Cancel</button>
                       </>
                   ) : (
                       <button 
                            onClick={reset}
                            className="w-full py-2 text-gray-400 hover:text-white font-bold text-xs hover:bg-white/5 rounded-xl transition-all"
                       >
                           Return to Code Editor
                       </button>
                   )}
                </div>
            </div>
        </div>
    );
};
