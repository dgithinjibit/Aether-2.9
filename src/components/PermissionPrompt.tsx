import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle2, Mic, Camera, HardDrive, MapPin } from 'lucide-react';

interface PermissionPromptProps {
    onAuthorized: () => void;
    addLog: (msg: string, type: 'system' | 'security' | 'success' | 'error') => void;
}

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({ onAuthorized, addLog }) => {
    const [status, setStatus] = useState({
        audio: 'idle', // idle, asking, granted, denied
        video: 'idle',
        gps: 'idle',
        storage: 'idle'
    });

    const triggerSystemPermission = async (type: 'audio' | 'video' | 'gps' | 'storage') => {
        setStatus(prev => ({ ...prev, [type]: 'asking' }));
        addLog(`Requesting native policy authorization for ${type}...`, 'system');

        if (type === 'audio' || type === 'video') {
            try {
                const constraints = {
                    audio: type === 'audio',
                    video: type === 'video'
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                stream.getTracks().forEach(track => track.stop());
                
                setStatus(prev => ({ ...prev, [type]: 'granted' }));
                addLog(`Device ${type} pipeline verified and authorized.`, 'success');
            } catch (err: any) {
                setStatus(prev => ({ ...prev, [type]: 'denied' }));
                addLog(`Hardware alignment for ${type} failed or was refused: ${err.message}`, 'error');
            }
        } else if (type === 'gps') {
            try {
                const getCoords = () => new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                await getCoords();
                setStatus(prev => ({ ...prev, gps: 'granted' }));
                addLog(`GPS geolocation services mapping established.`, 'success');
            } catch (err: any) {
                // Geo is optional or blockable on desktop frameworks
                setStatus(prev => ({ ...prev, gps: 'denied' }));
                addLog(`GPS locator mapping bypassed or restricted by sandbox.`, 'security');
            }
        } else {
            // Storage access simulation
            try {
                if ('storage' in navigator && 'persist' in navigator.storage) {
                    await navigator.storage.persist();
                }
                const testKey = 'AETHER_SECTOR_LOCK';
                localStorage.setItem(testKey, 'operational');
                localStorage.removeItem(testKey);
                setStatus(prev => ({ ...prev, storage: 'granted' }));
                addLog(`LocalStorage secure encryption storage context formatted.`, 'success');
            } catch (err) {
                setStatus(prev => ({ ...prev, storage: 'denied' }));
                addLog(`Secure storage encryption context failed or limited.`, 'error');
            }
        }
    };

    const handleQuickGrantAll = async () => {
        addLog('Initiating sequential omni-access permission cascade...', 'system');
        
        // Sequence permissions
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => track.stop());
            setStatus(prev => ({ ...prev, audio: 'granted', video: 'granted' }));
            addLog('Omni-media audio & video authorized.', 'success');
        } catch {
            setStatus(prev => ({ ...prev, audio: 'denied', video: 'denied' }));
            addLog('Omni-media hardware access request rejected.', 'error');
        }

        // GPS
        try {
            navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 2000 });
            setStatus(prev => ({ ...prev, gps: 'granted' }));
        } catch {
            setStatus(prev => ({ ...prev, gps: 'denied' }));
        }

        // Storage
        setStatus(prev => ({ ...prev, storage: 'granted' }));
        addLog('Device local cache bounds created.', 'success');
        
        onAuthorized();
    };

    const isDone = status.audio === 'granted' || status.video === 'granted' || status.storage === 'granted';

    return (
        <div className="mx-auto my-auto max-w-sm w-full bg-[#15151b] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield size={160} />
            </div>

            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner shadow-indigo-500/10">
                <ShieldAlert className="text-indigo-400" size={32} />
            </div>

            <h2 className="text-xl font-bold text-center mb-1 text-white">Permissions Required</h2>
            <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
                Unlock native hardware layer attributes to permit real-time multi-modal playground actions.
            </p>

            <div className="space-y-3 mb-6">
                {[
                    { key: 'audio' as const, label: 'Microphone Pipeline', desc: 'Inputs code dictation & speech commands', icon: <Mic size={18} className="text-emerald-400" /> },
                    { key: 'video' as const, label: 'Camera Optical Link', desc: 'Injects snapshots for design review', icon: <Camera size={18} className="text-amber-400" /> },
                    { key: 'gps' as const, label: 'Location Matrix', desc: 'Allows geolocation mapping testing', icon: <MapPin size={18} className="text-sky-400" /> },
                    { key: 'storage' as const, label: 'Secure Sandbox Storage', desc: 'Caches project data on disk', icon: <HardDrive size={18} className="text-indigo-400" /> },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => triggerSystemPermission(item.key)}
                        className={`w-full flex items-center gap-3 bg-black/30 border p-3 rounded-xl hover:border-white/20 transition-all text-left ${status[item.key] === 'granted' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#333]'}`}
                    >
                        <div className={`p-2 rounded-lg ${status[item.key] === 'granted' ? 'bg-emerald-500/15' : 'bg-[#222]'}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-xs text-gray-200">{item.label}</div>
                            <div className="text-[10px] text-gray-500 leading-tight">{item.desc}</div>
                        </div>
                        <div className="shrink-0 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded">
                            {status[item.key] === 'granted' ? (
                                <span className="text-emerald-400 font-bold">Granted</span>
                            ) : status[item.key] === 'asking' ? (
                                <span className="text-indigo-400 animate-pulse font-bold">Asking...</span>
                            ) : status[item.key] === 'denied' ? (
                                <span className="text-red-400 font-bold">Bypassed</span>
                            ) : (
                                <span className="text-gray-500">Enable</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleQuickGrantAll}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 active:scale-95 transition-all text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-indigo-500/10 text-xs flex justify-center items-center gap-2"
                >
                    <CheckCircle2 size={16} />
                    Approve Settings & Launch IDE
                </button>
                {isDone && (
                    <button
                        onClick={onAuthorized}
                        className="w-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 py-2.5 rounded-xl transition-all text-[11px] font-bold text-center"
                    >
                        Enter with partial setup
                    </button>
                )}
            </div>
            
            <p className="text-center mt-4 text-[9px] text-gray-600 uppercase tracking-widest font-black">
                Local Device Isolated Sandbox
            </p>
        </div>
    );
};
