import React, { useState, useRef, useEffect } from 'react';
import { 
    Sparkles, 
    Send, 
    Mic, 
    MicOff, 
    Paperclip, 
    CloudSun, 
    KeyRound, 
    Compass, 
    Check, 
    Smartphone, 
    Play, 
    RefreshCw,
    Activity,
    Lock,
    Unlock,
    Navigation,
    Layers,
    ListTodo,
    ChevronLeft,
    CheckSquare,
    Thermometer,
    Wind,
    Droplets
} from 'lucide-react';
import { ChatMessage, LogItem } from '../types';

// ==========================================
// 1. ASSISTANT VIEW COMPONENT
// ==========================================
interface AssistantViewProps {
    chatHistory: ChatMessage[];
    isThinking: boolean;
    thoughtProgress: number;
    thoughtText: string;
    attachedFile: string | undefined;
    setAttachedFile: (file: string | undefined) => void;
    isListening: boolean;
    onSendPrompt: (prompt: string) => void;
    onVoiceToggle: () => void;
    prompt: string;
    setPrompt: (p: string) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
    chatHistory,
    isThinking,
    thoughtProgress,
    thoughtText,
    attachedFile,
    setAttachedFile,
    isListening,
    onSendPrompt,
    onVoiceToggle,
    prompt,
    setPrompt
}) => {
    const SUGGESTIONS = [
        { label: 'Cloud Weather Widget', prompt: 'Scaffold an interactive ambient weather matrix widget' },
        { label: 'Secure Crypt Vault', prompt: 'Develop a local biometric lockbox with AES key signatures' },
        { label: 'Live Location Radar', prompt: 'Deploy a spatial GPS tracking element with coordinates mapping' },
        { label: 'Premium Task Tracker', prompt: 'Generate an offline checklist with dynamic progress metrics' }
    ];

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file.name);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#0d0d12] border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/20 to-black/30 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-200 block">Aether AI Studio</span>
                        <span className="text-[9px] text-gray-500 block leading-none">Generative Assistant Socket</span>
                    </div>
                </div>
                {attachedFile && (
                    <div className="text-[10px] bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Paperclip size={10} />
                        <span className="truncate max-w-[100px]">{attachedFile}</span>
                        <button onClick={() => setAttachedFile(undefined)} className="hover:text-red-400 font-black ml-1">✕</button>
                    </div>
                )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-black/10">
                {chatHistory.map((item) => (
                    <div 
                        key={item.id} 
                        className={`flex flex-col max-w-[85%] ${item.sender === 'user' ? 'ml-auto items-end animate-in slide-in-from-right-4' : 'mr-auto items-start animate-in slide-in-from-left-4'}`}
                    >
                        <span className="text-[9px] uppercase tracking-wider font-bold text-gray-600 mb-1 select-none">
                            {item.sender === 'user' ? 'You' : 'Aether Intelligence'}
                        </span>
                        <div className={`p-4 rounded-3xl text-xs leading-relaxed transition-all shadow-md ${
                            item.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-[#15151e] text-gray-200 border border-white/5 rounded-tl-none'
                        }`}>
                            {item.attachedFile && (
                                <div className="mb-2 p-2 bg-black/20 rounded-xl flex items-center gap-2 border border-white/5 text-[10px] text-gray-400">
                                    <Paperclip size={12} className="text-indigo-400" />
                                    <span className="font-bold truncate">{item.attachedFile}</span>
                                </div>
                            )}
                            <p>{item.text}</p>
                        </div>
                    </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="flex flex-col items-start max-w-[85%] mr-auto animate-pulse">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500 mb-1 select-none">
                            Scaffolding...
                        </span>
                        <div className="p-4 rounded-3xl bg-indigo-950/20 border border-indigo-500/10 rounded-tl-none text-xs text-indigo-300 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="animate-spin text-indigo-400" size={12} />
                                <span className="font-bold text-[11px]">{thoughtText}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#1c1c24] rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${thoughtProgress}%` }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions */}
            {chatHistory.length === 1 && !isThinking && (
                <div className="px-5 py-3 border-t border-white/5 bg-black/20 shrink-0">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2 select-none">
                        Tap to Compose Capabilities
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSendPrompt(s.prompt)}
                                className="p-2.5 bg-black/40 hover:bg-[#161622] hover:border-indigo-500/20 border border-white/5 rounded-2xl text-left text-[10px] text-gray-400 hover:text-indigo-300 transition-all flex flex-col justify-between"
                            >
                                <span className="font-bold text-gray-300 block mb-0.5 truncate">{s.label}</span>
                                <span className="text-[9px] text-gray-600 truncate">{s.prompt}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Prompt Form */}
            <div className="p-4 bg-[#111116] border-t border-white/5 shrink-0">
                <form 
                    onSubmit={(e) => { e.preventDefault(); onSendPrompt(prompt); }}
                    className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-2xl focus-within:border-indigo-500/50 transition-all"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                    />
                    <button
                        type="button"
                        onClick={handleFileUploadClick}
                        className={`p-2 rounded-xl transition-all ${attachedFile ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'}`}
                        title="Upload Spec Outline"
                    >
                        <Paperclip size={16} />
                    </button>

                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isThinking}
                        placeholder="What should we build next? e.g. Add weather dashboard"
                        className="flex-1 bg-transparent text-xs text-white border-none py-2 placeholder-gray-600 focus:outline-none focus:ring-0"
                    />

                    <button
                        type="button"
                        onClick={onVoiceToggle}
                        className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-500 hover:text-white'}`}
                        title="Voice Dictation Pipeline"
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                        type="submit"
                        disabled={isThinking || (!prompt.trim() && !attachedFile)}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-white transition-all transform active:scale-95 shadow-md shadow-indigo-600/20"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};


// ==========================================
// 2. APP PREVIEW HUB COMPONENT (CLEAN IMMERSIVE DEVICE RUNTIME)
// ==========================================
interface AppPreviewHubProps {
    previewAppType: 'welcome' | 'weather' | 'crypto' | 'gps' | 'todo';
    setPreviewAppType: (type: 'welcome' | 'weather' | 'crypto' | 'gps' | 'todo') => void;
    weatherTemp: number;
    setWeatherTemp: React.Dispatch<React.SetStateAction<number>>;
    weatherCond: string;
    setWeatherCond: React.Dispatch<React.SetStateAction<string>>;
    todoInput: string;
    setTodoInput: (v: string) => void;
    todoList: { id: string; text: string; completed: boolean }[];
    setTodoList: React.Dispatch<React.SetStateAction<{ id: string; text: string; completed: boolean }[]>>;
    cryptoSecret: string;
    cryptoLocked: boolean;
    setCryptoLocked: React.Dispatch<React.SetStateAction<boolean>>;
    rawGpsCoords: { lat: number; lng: number };
    refreshingGps: boolean;
    onRefreshLocation: () => void;
    onAddTodo: (e: React.FormEvent) => void;
    onToggleTodo: (id: string) => void;
    onClearCompletedTodos: () => void;
}

export const AppPreviewHub: React.FC<AppPreviewHubProps> = ({
    previewAppType,
    setPreviewAppType,
    weatherTemp,
    setWeatherTemp,
    weatherCond,
    setWeatherCond,
    todoInput,
    setTodoInput,
    todoList,
    setTodoList,
    cryptoSecret,
    cryptoLocked,
    setCryptoLocked,
    rawGpsCoords,
    refreshingGps,
    onRefreshLocation,
    onAddTodo,
    onToggleTodo,
    onClearCompletedTodos
}) => {
    return (
        <div className="h-full w-full flex items-center justify-center p-1 md:p-4">
            {/* Elegant Mobile Viewport Frame (Centers layout nicely like an app runtime) */}
            <div className="relative w-full max-w-[390px] h-full max-h-[620px] bg-[#0c0c14] border-[8px] border-[#1e1e24] rounded-[48px] shadow-2xl flex flex-col overflow-hidden select-none">
                
                {/* Physical Top Speaker & Notch representation */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1c1c24] mr-2 shrink-0" />
                    <span className="text-[7px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">AETHER OS</span>
                </div>

                {/* Native App Core Container */}
                <div className="flex-1 flex flex-col bg-[#09090d] rounded-[36px] overflow-hidden p-4 pt-8 pb-4 relative border border-white/5 text-white text-xs">
                    
                    {/* App Internal Nav Bar */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-4">
                        <div className="flex items-center gap-1.5">
                            {previewAppType !== 'welcome' && (
                                <button 
                                    onClick={() => setPreviewAppType('welcome')} 
                                    className="p-1 hover:bg-white/5 rounded-lg text-indigo-400"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-tight font-sans text-gray-200">
                                    {previewAppType === 'welcome' && "Aether Sandbox Hub"}
                                    {previewAppType === 'weather' && "Atmosphere Hub"}
                                    {previewAppType === 'crypto' && "Key Vault Locker"}
                                    {previewAppType === 'gps' && "Spatial Coordinates"}
                                    {previewAppType === 'todo' && "Aether Planner"}
                                </span>
                                <span className="text-[7px] font-mono text-gray-500 tracking-wider">SECURE CLIENT CONTAINER</span>
                            </div>
                        </div>
                        <div className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded-full font-bold">
                            V1.0.0-PROD
                        </div>
                    </div>

                    {/* App Core Display Area */}
                    <div className="flex-1 flex flex-col min-h-0 select-text overflow-y-auto">
                        
                        {/* 1. WELCOME LAUNCHER DASHBOARD */}
                        {previewAppType === 'welcome' && (
                            <div className="flex-1 flex flex-col justify-between p-1">
                                <div className="text-center py-4">
                                    <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg mb-3">
                                        <Smartphone size={28} />
                                    </div>
                                    <h3 className="font-extrabold text-[13px] tracking-tight text-white">Aether Device Software</h3>
                                    <p className="text-[9px] text-gray-400 leading-normal max-w-[220px] mx-auto mt-1.5">
                                        You successfully configured the client sandbox. Launch any dynamic modular capability below.
                                    </p>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-500 font-mono block">Compiled Module Suites</span>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { type: 'weather' as const, label: 'Atmosphere Sensor', desc: 'Forecast coordinates', icon: <CloudSun size={15} className="text-sky-400" /> },
                                            { type: 'crypto' as const, label: 'Biometric Lockbox', desc: 'Secure encryption', icon: <KeyRound size={15} className="text-amber-400" /> },
                                            { type: 'gps' as const, label: 'GPS Geocoder', desc: 'Radar navigation', icon: <Compass size={15} className="text-emerald-400" /> },
                                            { type: 'todo' as const, label: 'Sprint Planner', desc: 'Checklist matrix', icon: <CheckSquare size={15} className="text-indigo-400" /> }
                                        ].map((item) => (
                                            <button 
                                                key={item.type}
                                                onClick={() => setPreviewAppType(item.type)}
                                                className="p-3 bg-[#111117] hover:bg-[#161622] border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all group flex flex-col gap-1.5 active:scale-95 duration-150"
                                            >
                                                <div className="p-1 bg-white/5 rounded-lg w-fit group-hover:bg-indigo-500/15 group-hover:text-white transition-colors">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-[10px] text-gray-200 block truncate group-hover:text-indigo-300 transition-colors">{item.label}</span>
                                                    <span className="text-[8px] text-gray-500 block truncate font-mono mt-0.5">{item.desc}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 p-2.5 bg-[#121217] rounded-xl border border-white/5 flex items-center gap-2">
                                    <Activity size={12} className="text-emerald-400 animate-pulse shrink-0" />
                                    <span className="text-[8px] text-gray-400 font-medium">Device local keychains mapped & verified completely.</span>
                                </div>
                            </div>
                        )}

                        {/* 2. WEATHER SUITE */}
                        {previewAppType === 'weather' && (
                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div className="space-y-4">
                                    {/* Main Cloud Card */}
                                    <div className="p-4 bg-gradient-to-b from-indigo-950/20 to-black/20 border border-indigo-500/20 rounded-2xl text-center shadow-lg">
                                        <CloudSun size={40} className="mx-auto text-sky-400 animate-bounce mb-1" />
                                        <span className="text-[34px] font-black text-white block mt-2 tracking-tighter leading-none">{weatherTemp}°C</span>
                                        <span className="text-[10px] text-[#a5f3fc] font-bold block mt-1 uppercase tracking-wider font-mono">{weatherCond}</span>
                                        
                                        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <Thermometer size={11} className="text-red-400" />
                                                <span className="text-[9px] text-gray-400">Feel: {weatherTemp + 1}°C</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Wind size={11} className="text-sky-300" />
                                                <span className="text-[9px] text-gray-400">Wind: 14 km/h</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Droplets size={11} className="text-indigo-400" />
                                                <span className="text-[9px] text-gray-400">Hum: 62%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forecast Grid */}
                                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-500 font-mono block">3-Day Ambience Timeline</span>
                                        <div className="space-y-1.5">
                                            {[
                                                { day: 'Tomorrow', temp: `${weatherTemp - 1}°C`, cond: 'Scattered Mist' },
                                                { day: 'Friday', temp: `${weatherTemp + 2}°C`, cond: 'Sunny High' },
                                                { day: 'Saturday', temp: `${weatherTemp}°C`, cond: 'Cloudy Ambient' }
                                            ].map((f, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[9px] py-1 border-b border-white/5 last:border-0">
                                                    <span className="font-bold text-gray-300">{f.day}</span>
                                                    <span className="text-gray-500 font-mono">{f.cond}</span>
                                                    <span className="font-bold text-[#a5f3fc] font-mono">{f.temp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setWeatherTemp(t => t + 1)}
                                            className="py-2 bg-black/40 border border-white/5 hover:border-white/20 text-[9px] font-bold text-gray-300 hover:text-white rounded-xl active:scale-95 transition-all"
                                        >
                                            Reflect Heat (+1)
                                        </button>
                                        <button 
                                            onClick={() => setWeatherTemp(t => t - 1)}
                                            className="py-2 bg-black/40 border border-white/5 hover:border-white/20 text-[9px] font-bold text-gray-300 hover:text-white rounded-xl active:scale-95 transition-all"
                                        >
                                            Reflect Cold (-1)
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => setPreviewAppType('welcome')}
                                        className="w-full mt-2 py-1 text-center text-[8px] uppercase tracking-widest font-extrabold text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        ← Return to launcher
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. BIOMETRIC KEY LOCKBOX */}
                        {previewAppType === 'crypto' && (
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-4">
                                    {/* Big Circle Biometric Badge */}
                                    <div className="p-4 bg-[#0d0d14] border border-[#23232cf] rounded-2xl text-center shadow-lg">
                                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 transition-colors ${cryptoLocked ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {cryptoLocked ? <Lock size={28} /> : <Unlock size={28} className="animate-bounce" />}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Storage Crypt Vault</span>
                                        <p className="text-[8px] text-gray-500 max-w-[180px] mx-auto mt-1 tracking-tight leading-normal">
                                            {cryptoLocked ? "Keychain is locked under AES-256 validation criteria." : "Keychain decrypted & authorized successfully."}
                                        </p>
                                        
                                        <div className="p-2.5 bg-black/80 rounded-xl mt-4 font-mono text-[9px] overflow-hidden text-center select-all border border-white/5 relative">
                                            {cryptoLocked ? (
                                                <span className="text-gray-600 select-none">•••• •••• •••• ••••</span>
                                            ) : (
                                                <span className="text-emerald-400 font-bold select-all">{cryptoSecret}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Security status logs */}
                                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-[8px] space-y-1.5">
                                        <span className="font-bold text-gray-500 uppercase tracking-widest block font-mono">Keychain Operations</span>
                                        <div className="space-y-1 font-mono text-gray-400">
                                            <div className="flex justify-between"><span>[SYSTEM] Key signature load</span><span className="text-emerald-400">OK</span></div>
                                            <div className="flex justify-between"><span>[ALGO] AES-GCM 256 Payload</span><span className="text-emerald-400">OK</span></div>
                                            <div className="flex justify-between"><span>[STATUS] Local sandbox ring</span><span className="text-indigo-400">SECURE</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => {
                                            setCryptoLocked(!cryptoLocked);
                                        }}
                                        className={`w-full py-2.5 text-[9px] font-extrabold uppercase tracking-wider rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 ${cryptoLocked ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'}`}
                                    >
                                        {cryptoLocked ? "Authenticate via Biometrics" : "Secure Lock Capsule"}
                                    </button>

                                    <button
                                        onClick={() => setPreviewAppType('welcome')}
                                        className="w-full py-1 text-center text-[8px] uppercase tracking-widest font-extrabold text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        ← Back to home hub
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 4. GPS MATRIX COMPASS */}
                        {previewAppType === 'gps' && (
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-3">
                                    <div className="p-3 bg-[#0d0d14] border border-white/5 rounded-2xl relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-wider">GEO Lock Coordinates</span>
                                            <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Live FIX
                                            </div>
                                        </div>
                                        
                                        <code className="text-xs font-mono text-emerald-300 block text-center bg-black/60 py-2 rounded-lg border border-white/5 shadow-inner">
                                            {rawGpsCoords.lat.toFixed(6)}, {rawGpsCoords.lng.toFixed(6)}
                                        </code>

                                        {/* Radial compass coordinates overlay */}
                                        <div className="w-full h-24 border border-white/5 bg-black/40 rounded-xl mt-3 relative overflow-hidden flex items-center justify-center">
                                            <Compass size={40} className={`text-indigo-500/40 absolute ${refreshingGps ? 'animate-spin' : ''}`} />
                                            {/* Pulsing focal point */}
                                            <span className="rounded-full w-4 h-4 bg-indigo-500/20 animate-ping absolute" />
                                            <span className="rounded-full w-2 h-2 bg-indigo-400 absolute shadow-[0_0_10px_rgb(99,102,241)]" />
                                            <span className="text-[7px] text-gray-600 absolute bottom-1 right-2 uppercase tracking-widest font-mono">Matrix active</span>
                                        </div>
                                    </div>

                                    {/* Satellite Telecon Data */}
                                    <div className="p-2.5 bg-[#121217] rounded-xl border border-white/5 text-[8px] font-mono text-gray-500 space-y-1">
                                        <div className="flex justify-between"><span>Grid Location</span><span>Nairobi Spatial Segment</span></div>
                                        <div className="flex justify-between"><span>Satellites Lock Count</span><span>11 Tracked (Aether Net)</span></div>
                                        <div className="flex justify-between"><span>Deviation Precision</span><span>&lt; 0.08 meters</span></div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={onRefreshLocation}
                                        disabled={refreshingGps}
                                        className="py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[9px] font-extrabold uppercase tracking-wider rounded-xl active:scale-95 transition-all w-full flex justify-center items-center gap-1.5"
                                    >
                                        <RefreshCw size={11} className={refreshingGps ? 'animate-spin' : ''} />
                                        <span>Realign GPS Antenna</span>
                                    </button>

                                    <button
                                        onClick={() => setPreviewAppType('welcome')}
                                        className="w-full py-1 text-center text-[8px] uppercase tracking-widest font-extrabold text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        ← Back to launcher
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 5. CHECKLIST SPRINT PLANNER */}
                        {previewAppType === 'todo' && (
                            <div className="flex-1 flex flex-col justify-between py-1 min-h-0">
                                <div className="flex flex-col min-h-0 flex-1">
                                    <form onSubmit={onAddTodo} className="flex gap-1 shrink-0 mb-3">
                                        <input
                                            type="text"
                                            value={todoInput}
                                            onChange={(e) => setTodoInput(e.target.value)}
                                            placeholder="Write customized goals..."
                                            className="flex-1 bg-[#121217] border border-[#2a2a30] rounded-xl px-2.5 py-1.5 text-[9px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl px-3 text-[9px] uppercase tracking-wider transition-all"
                                        >
                                            Add
                                        </button>
                                    </form>

                                    {/* Task Checklist Lists */}
                                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar min-h-0">
                                        {todoList.map((t) => (
                                            <div 
                                                key={t.id} 
                                                onClick={() => onToggleTodo(t.id)}
                                                className={`flex items-center gap-2 p-2.5 bg-[#111117] border rounded-xl cursor-pointer hover:border-white/10 active:scale-99 transition-all ${t.completed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5'}`}
                                            >
                                                <div className={`p-0.5 rounded border flex items-center justify-center shrink-0 ${t.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'border-gray-700 bg-black/40 text-transparent'}`}>
                                                    <Check size={8} />
                                                </div>
                                                <span className={`text-[9px] truncate select-none ${t.completed ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}`}>
                                                    {t.text}
                                                </span>
                                            </div>
                                        ))}
                                        {todoList.length === 0 && (
                                            <div className="text-center py-6 text-gray-600 italic text-[9px]">
                                                All sandbox targets have been completed dynamically!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5 shrink-0">
                                    <button
                                        onClick={onClearCompletedTodos}
                                        className="text-[9px] font-extrabold uppercase tracking-wide text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Flush Complete
                                    </button>
                                    <button
                                        onClick={() => setPreviewAppType('welcome')}
                                        className="text-[9px] font-extrabold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
                                    >
                                        ← Launcher
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Physical Virtual Device Home Key Bottom Bar */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-center gap-10 shrink-0">
                        <button onClick={() => setPreviewAppType('welcome')} className="text-gray-600 hover:text-indigo-400 transition-colors" title="Launch Overview">
                            <Layers size={13} />
                        </button>
                        <div onClick={() => setPreviewAppType('welcome')} className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center hover:border-indigo-400/50 hover:bg-indigo-500/10 cursor-pointer transition-all">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        </div>
                        <button onClick={() => setPreviewAppType('welcome')} className="text-gray-600 hover:text-indigo-400 transition-colors text-[9px] font-mono leading-none" title="Back Hub">
                            ◀
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
