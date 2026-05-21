import React, { useState, useRef, useEffect } from 'react';
import { 
    Sparkles, 
    Send, 
    Mic, 
    MicOff, 
    Paperclip, 
    FileCode, 
    Play, 
    Terminal, 
    ShieldAlert, 
    Cpu, 
    RefreshCw, 
    HelpCircle, 
    Maximize2, 
    Check, 
    Plus, 
    Trash2, 
    Smartphone, 
    ShieldCheck, 
    Clock, 
    Share2, 
    Database, 
    Search, 
    ArrowRight, 
    ListTodo, 
    CloudSun, 
    Compass, 
    KeyRound, 
    AlertCircle, 
    Code, 
    CheckSquare, 
    Users, 
    Laptop
} from 'lucide-react';
import { CodeBlockType, ChatMessage, LogItem } from '../types';

interface AiCanvasViewProps {
    blocks: CodeBlockType[];
    logs: LogItem[];
    onAddBlock: (title: string, type: 'js' | 'json' | 'css' | 'markdown', content: string) => void;
    onUpdateBlockContent: (id: string, content: string) => void;
    onRunCode: (code: string, filename: string) => void;
    addLog: (msg: string, type: 'system' | 'security' | 'success' | 'error' | 'input' | 'output') => void;
    isEli5Mode: boolean;
}

export const AiCanvasView: React.FC<AiCanvasViewProps> = ({
    blocks,
    logs,
    onAddBlock,
    onUpdateBlockContent,
    onRunCode,
    addLog,
    isEli5Mode
}) => {
    // Basic prompts
    const SUGGESTIONS = [
        { label: 'Cloud Weather Widget', prompt: 'Scaffold an interactive ambient weather matrix widget' },
        { label: 'Secure Crypt Vault', prompt: 'Develop a local biometric lockbox with AES key signatures' },
        { label: 'Live Location Radar', prompt: 'Deploy a spatial GPS tracking element with coordinates mapping' },
        { label: 'Premium Task Tracker', prompt: 'Generate an offline checklist with dynamic progress metrics' }
    ];

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            id: 'm1',
            sender: 'assistant',
            text: 'Hello, welcome to your Aether AI Mobile Studio! Fully wrapped and ready in your client sandbox. Ask me to scaffold widgets, bind direct hardware sensors (like Mic or Camera), or sign Android bundles.',
            timestamp: Date.now() - 60000
        }
    ]);

    const [prompt, setPrompt] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [thoughtProgress, setThoughtProgress] = useState(0);
    const [thoughtText, setThoughtText] = useState('');
    const [attachedFile, setAttachedFile] = useState<string | undefined>(undefined);
    const [isListening, setIsListening] = useState(false);

    // Dynamic Live Preview Application State
    const [previewAppType, setPreviewAppType] = useState<'welcome' | 'weather' | 'crypto' | 'gps' | 'todo'>('welcome');
    
    // Live mini-apps internal states
    const [weatherTemp, setWeatherTemp] = useState(24);
    const [weatherCond, setWeatherCond] = useState('Clear Sunny');
    const [todoInput, setTodoInput] = useState('');
    const [todoList, setTodoList] = useState<{ id: string; text: string; completed: boolean }[]>([
        { id: '1', text: 'Initialize Android permissions sandbox', completed: true },
        { id: '2', text: 'Inject high performance Webview module', completed: true },
        { id: '3', text: 'Implement spatial coordinate GPS feeds', completed: false }
    ]);
    const [cryptoSecret, setCryptoSecret] = useState('AETHER_KEY_8182');
    const [cryptoLocked, setCryptoLocked] = useState(true);
    const [rawGpsCoords, setRawGpsCoords] = useState({ lat: -1.2921, lng: 36.8219 });
    const [refreshingGps, setRefreshingGps] = useState(false);

    // Desktop/Tablet split pane tab toggles
    // 'preview' | 'code' | 'logs'
    const [orchestratorTab, setOrchestratorTab] = useState<'preview' | 'code' | 'logs'>('preview');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    // Speech Recognition initialization
    const handleVoiceToggle = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addLog("Speech recognition API is missing in this browser environment.", "error");
            return;
        }

        if (isListening) {
            setIsListening(false);
            addLog("Speech recognition paused.", "system");
        } else {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'en-US';

            rec.onstart = () => {
                setIsListening(true);
                addLog("Voice hardware pipeline listener stream active... Speak now.", "system");
            };

            rec.onresult = (evt: any) => {
                const speechResult = evt.results[0][0].transcript;
                setPrompt(speechResult);
                addLog(`Captured voice input: "${speechResult}"`, "success");
            };

            rec.onerror = (evt: any) => {
                setIsListening(false);
                addLog(`Voice feed pipeline failure: ${evt.error}`, "error");
            };

            rec.onend = () => {
                setIsListening(false);
            };

            rec.start();
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file.name);
            addLog(`Mock uploaded file attachment loaded: ${file.name} (${Math.round(file.size / 1024)} KB)`, "success");
        }
    };

    // Submits the prompt to AI sandbox engine
    const handleSendPrompt = (txtPrompt: string) => {
        if (!txtPrompt.trim() && !attachedFile) return;

        const currentPrompt = txtPrompt || `Analyze loaded file: ${attachedFile}`;

        // Append User question
        const userMsg: ChatMessage = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: currentPrompt,
            timestamp: Date.now(),
            attachedFile: attachedFile
        };

        setChatHistory(prev => [...prev, userMsg]);
        setPrompt('');
        setAttachedFile(undefined);

        // Turn on AI Thinking
        setIsThinking(true);
        setThoughtProgress(10);
        setThoughtText('Validating security guardrails...');

        // Sequenced compiling simulator
        setTimeout(() => {
            setThoughtProgress(35);
            setThoughtText('Compiling Tailwind assets & dependencies...');
            addLog("Preparing Sandbox Hot-Reload context...", "system");
        }, 600);

        setTimeout(() => {
            setThoughtProgress(65);
            setThoughtText('Resolving module imports & binding hardware layers...');
            addLog("Generating unbreachable environment sandbox modules...", "security");
        }, 1200);

        setTimeout(() => {
            setThoughtProgress(90);
            setThoughtText('Regenerating interactive UI preview window...');
        }, 1800);

        setTimeout(() => {
            setIsThinking(false);
            setThoughtProgress(100);

            // Determine output state
            let aiText = '';
            let appTarget: typeof previewAppType = 'welcome';
            let title = 'custom_module.js';
            let code = '// Rendered by Aether engine\n';

            const userTextLower = currentPrompt.toLowerCase();

            if (userTextLower.includes('weather')) {
                appTarget = 'weather';
                aiText = "Superb choice! I have compiled the Cloud Weather Widget. The physical hardware stream registers normal ambient humidity, and has live styling in spatial dark modes. Check out index.js inside the Code tab, and see the interactive preview screen instantly update!";
                title = 'weather_service.js';
                code = `// Cloud Weather Widget Script\nconsole.log("[Aether AI]: Synchronized weather indicators.");\nasync function refreshAmbientSensor() {\n  const humidity = 62;\n  const temp = Math.floor(Math.random() * 5) + 21;\n  console.log("Telemetry ambient update: " + temp + "°C, humidity: " + humidity + "%");\n}\nrefreshAmbientSensor();`;
            } else if (userTextLower.includes('crypto') || userTextLower.includes('vault') || userTextLower.includes('lock')) {
                appTarget = 'crypto';
                aiText = "Shield lockbox loaded! I signed the module using AES-256-GCM configurations and bound local browser storage access values so that encryption remains persistently aligned against your local APK keychain.";
                title = 'crypto_shield.js';
                code = `// Cryptographic Lockbox module\nconsole.log("[Aether AI]: Loading biometric lock signatures.");\nfunction decryptSecurePayload() {\n  const rawSig = "AES_KEY_" + Math.random().toString(36).substring(4).toUpperCase();\n  console.log("Decryption signature valid. Seed generated: " + rawSig);\n}\ndecryptSecurePayload();`;
            } else if (userTextLower.includes('location') || userTextLower.includes('gps') || userTextLower.includes('radar')) {
                appTarget = 'gps';
                aiText = "GPS mapping sequence initiated. I mapped the device coordinate matrix inside our isolated responsive viewport! Geolocation requests have been assigned to browser cache arrays so testing doesn't need to ping cloud services.";
                title = 'spatial_radar.js';
                code = `// Spatial Coordinate Tracker\nconsole.log("[Aether AI]: Initializing continuous GPS pipeline...");\nnavigator.geolocation.getCurrentPosition(\n  (pos) => console.log("Real-time telemetry lat: " + pos.coords.latitude),\n  (err) => console.log("Standard geo mapping bypassed securely.")\n);`;
            } else if (userTextLower.includes('todo') || userTextLower.includes('task') || userTextLower.includes('checklist')) {
                appTarget = 'todo';
                aiText = "Done! I generated the Premium Task Manager widget on your cockpit. It contains customized state variables to allow users to toggle checkbox states, and counts complete indexes via high-volume local structures.";
                title = 'task_adaptor.js';
                code = `// Task Planner Core\nconsole.log("[Aether AI]: Checklist state compiled successfully.");\nlet checklist = ["Android permissions verified", "Hot-reload enabled"];\nconsole.log("Count of compiled plan targets: " + checklist.length);`;
            } else {
                aiText = "Understood. I parsed your direct request instructions and adjusted key parameters. The compiled app has been optimized for size constraints and edge speed. Click run under code tab or type shell values directly to evaluate the updated module pipeline!";
                title = 'custom_node.js';
                code = `// Customized module layout\nconsole.log("[Aether AI]: Instantiated custom sandbox script successfully.");\nlet tasks = ["Check device hardware", "Compile client assets"];\ntasks.forEach(t => console.log("Queued task: " + t));`;
            }

            // Append response message
            setChatHistory(prev => [...prev, {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                text: aiText,
                timestamp: Date.now()
            }]);

            // Auto show the simulated app or widget
            setPreviewAppType(appTarget);
            onAddBlock(title, 'js', code);
            setOrchestratorTab('preview');
            addLog(`Codebase hot-updated successfully with ${title}!`, "success");

        }, 2200);
    };

    // Simulated task actions
    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!todoInput.trim()) return;
        setTodoList(prev => [...prev, {
            id: String(Date.now()),
            text: todoInput.trim(),
            completed: false
        }]);
        setTodoInput('');
    };

    const handleToggleTodo = (id: string) => {
        setTodoList(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleClearCompletedTodos = () => {
        setTodoList(prev => prev.filter(t => !t.completed));
    };

    // Simulated Location Refresh
    const handleRefreshLocation = () => {
        setRefreshingGps(true);
        addLog("Retrieving updated GPS spatial matrix coordinates...", "system");
        setTimeout(() => {
            setRawGpsCoords({
                lat: -1.2921 + (Math.random() - 0.5) * 0.01,
                lng: 36.8219 + (Math.random() - 0.5) * 0.01
            });
            setRefreshingGps(false);
            addLog("Geocentric radar locked. Spatial coordinates realigned.", "success");
        }, 1000);
    };

    return (
        <div className="absolute inset-0 flex flex-col lg:flex-row gap-6 h-full w-full overflow-hidden select-none">
            
            {/* Left Pane (Persistent Canvas & Prompt Sidebar) */}
            <div className="flex-1 lg:max-w-md w-full bg-[#0d0d12] border border-white/5 rounded-3xl flex flex-col overflow-hidden relative shadow-2xl">
                {/* Panel Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/20 to-black/30 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Aether Prompt Studio</span>
                    </div>
                    {attachedFile && (
                        <div className="text-[10px] bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Paperclip size={10} />
                            <span className="truncate max-w-[100px]">{attachedFile}</span>
                            <button onClick={() => setAttachedFile(undefined)} className="hover:text-red-400 font-black ml-1">✕</button>
                        </div>
                    )}
                </div>

                {/* Chat Timeline history */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-black/10">
                    {chatHistory.map((item) => (
                        <div 
                            key={item.id} 
                            className={`flex flex-col max-w-[85%] ${item.sender === 'user' ? 'ml-auto items-end animate-in slide-in-from-right-4' : 'mr-auto items-start animate-in slide-in-from-left-4'}`}
                        >
                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-600 mb-1 select-none">
                                {item.sender === 'user' ? 'You' : 'Aether Engine'}
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

                    {/* Simulating Thinking Feed */}
                    {isThinking && (
                        <div className="flex flex-col items-start max-w-[85%] mr-auto animate-pulse">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500 mb-1 select-none">
                                Sandboxing...
                            </span>
                            <div className="p-4 rounded-3xl bg-indigo-950/20 border border-indigo-500/10 rounded-tl-none text-xs text-indigo-300 w-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="animate-spin text-indigo-400" size={12} />
                                    <span className="font-bold">{thoughtText}</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#1c1c24] rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${thoughtProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Suggested prompt shortcuts */}
                {chatHistory.length === 1 && !isThinking && (
                    <div className="px-5 py-3 border-t border-white/5 bg-black/20 shrink-0">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2 select-none">
                            Suggested Workspace Actions
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendPrompt(s.prompt)}
                                    className="p-2.5 bg-black/40 hover:bg-[#161622] hover:border-indigo-500/20 border border-white/5 rounded-2xl text-left text-[10px] text-gray-400 hover:text-indigo-300 transition-all flex flex-col justify-between"
                                >
                                    <span className="font-bold text-gray-300 block mb-0.5 truncate">{s.label}</span>
                                    <span className="text-[9px] text-gray-600 truncate">{s.prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Workspace Panel */}
                <div className="p-4 bg-[#111116] border-t border-white/5 shrink-0">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendPrompt(prompt); }}
                        className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-2xl focus-within:border-indigo-500/50 transition-all"
                    >
                        {/* Target file upload input */}
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
                            title="Mock Upload Spec File"
                        >
                            <Paperclip size={16} />
                        </button>

                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isThinking}
                            placeholder="Direct client prompt... e.g. Add weather panel"
                            className="flex-1 bg-transparent text-xs text-white border-none py-2 placeholder-gray-600 focus:outline-none focus:ring-0"
                        />

                        {/* Speech Mic Trigger */}
                        <button
                            type="button"
                            onClick={handleVoiceToggle}
                            className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-500 hover:text-white'}`}
                            title="Aether Audio Dictation"
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>

                        {/* Send button */}
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

            {/* Right Pane (The Orchestrator) */}
            <div className="flex-1 bg-[#0d0d12] border border-white/5 rounded-3xl flex flex-col overflow-hidden relative shadow-2xl min-h-[400px]">
                
                {/* Orchestrator Header tab selectors */}
                <div className="px-5 py-3 bg-[#13131a] border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 select-none">
                        {[
                            { key: 'preview' as const, label: 'Live App Preview', icon: <Smartphone size={14} /> },
                            { key: 'code' as const, label: 'Code Explorer', icon: <Code size={14} /> },
                            { key: 'logs' as const, label: 'System Terminal', icon: <Terminal size={14} /> }
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setOrchestratorTab(t.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    orchestratorTab === t.key
                                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {t.icon}
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-2 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-planet" />
                        Compilation: OK
                    </div>
                </div>

                {/* Active Tab Panel Outlet */}
                <div className="flex-1 p-5 overflow-hidden relative min-h-0">
                    
                    {/* PREVIEW CONTAINER VIEW */}
                    {orchestratorTab === 'preview' && (
                        <div className="h-full w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 p-1">
                            
                            {/* Breathtaking phone viewport mockup */}
                            <div className="relative w-full max-w-[315px] h-full max-h-[415px] bg-[#09090c] border-[7px] border-[#222] rounded-[42px] shadow-2xl p-3 flex flex-col overflow-hidden select-none">
                                
                                {/* Device camera lens notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#111] pr-2 shrink-0" />
                                    <span className="text-[7px] text-[#444] font-bold uppercase tracking-widest font-mono">AETHER SDK</span>
                                </div>

                                {/* Dynamic working application inside phone screen */}
                                <div className="flex-1 flex flex-col bg-[#111115] rounded-[32px] overflow-hidden p-3 pt-5 pb-3.5 relative border border-white/5 text-white text-xs">
                                    
                                    {/* App Navigation bar */}
                                    <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <Sparkles size={11} className="text-indigo-400 animate-spin" />
                                            <span className="text-[10px] font-sans tracking-tight">
                                                {previewAppType === 'welcome' && "Sandbox Hub"}
                                                {previewAppType === 'weather' && "Atmosphere Hub"}
                                                {previewAppType === 'crypto' && "Key Vault"}
                                                {previewAppType === 'gps' && "Location Matrix"}
                                                {previewAppType === 'todo' && "Aether Planner"}
                                            </span>
                                        </div>
                                        <div className="text-[8px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.2 border border-white/5 rounded">
                                            v1.0.0
                                        </div>
                                    </div>

                                    {/* App body */}
                                    <div className="flex-1 flex flex-col min-h-0 select-text overflow-y-auto">
                                        
                                        {/* WELCOME APP (DEFAULT) */}
                                        {previewAppType === 'welcome' && (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-2 gap-3">
                                                <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                                                    <Smartphone size={24} />
                                                </div>
                                                <h4 className="font-bold text-xs text-white">Interactive Sandbox Sandbox</h4>
                                                <p className="text-[9px] text-gray-400 leading-normal max-w-[180px]">
                                                    Type your prompt or click any shortcut left to compile reactive widgets live on this device.
                                                </p>
                                                <div className="flex flex-col gap-1 w-full max-w-[170px] mt-2">
                                                    <button 
                                                        onClick={() => setPreviewAppType('weather')}
                                                        className="py-1.5 bg-[#18181f] text-gray-300 rounded-lg hover:text-white text-[9px] font-bold border border-white/5"
                                                    >
                                                        Visit Cloud Weather
                                                    </button>
                                                    <button 
                                                        onClick={() => setPreviewAppType('todo')}
                                                        className="py-1.5 bg-[#18181f] text-gray-300 rounded-lg hover:text-white text-[9px] font-bold border border-white/5"
                                                    >
                                                        Launch Premium Tasker
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* WEATHER COMPILATION */}
                                        {previewAppType === 'weather' && (
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="p-3 bg-gradient-to-b from-indigo-950/40 to-black/20 border border-indigo-500/25 rounded-2xl text-center">
                                                    <CloudSun size={32} className="mx-auto text-sky-400 animate-bounce mb-1" />
                                                    <span className="text-[26px] font-extrabold text-white block mt-1 tracking-tighter leading-none">{weatherTemp}°C</span>
                                                    <span className="text-[10px] text-[#a5f3fc] font-bold block mt-1 uppercase tracking-wider">{weatherCond}</span>
                                                    <span className="text-[9px] font-mono text-gray-500 block mt-2">Nairobi Spatial Matrix</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <button 
                                                        onClick={() => { setWeatherTemp(t => t + 1); addLog("Simulated ambient sensor heating...", "system") }}
                                                        className="py-1.5 bg-black/40 border border-white/5 text-[9px] font-bold text-gray-300 hover:text-white rounded-lg active:scale-95"
                                                    >
                                                        Reflect Heat (+1)
                                                    </button>
                                                    <button 
                                                        onClick={() => { setWeatherTemp(t => t - 1); addLog("Simulated ambient sensor cooling...", "system") }}
                                                        className="py-1.5 bg-black/40 border border-white/5 text-[9px] font-bold text-gray-300 hover:text-white rounded-lg active:scale-95"
                                                    >
                                                        Reflect Cold (-1)
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    onClick={() => setPreviewAppType('welcome')}
                                                    className="w-full py-1.5 text-center text-[9px] uppercase tracking-wider font-bold text-gray-600 mt-2 hover:text-gray-400"
                                                >
                                                    ← Back Home
                                                </button>
                                            </div>
                                        )}

                                        {/* CRYPTO KEYCHAIN */}
                                        {previewAppType === 'crypto' && (
                                            <div className="flex-1 flex flex-col justify-between py-1 animate-in fade-in duration-300">
                                                <div className="p-4 bg-black/40 border border-[#333] rounded-2xl text-center">
                                                    <KeyRound size={28} className={`mx-auto mb-2 ${cryptoLocked ? 'text-amber-500' : 'text-emerald-400 animate-pulse'}`} />
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Device Keys Security</span>
                                                    
                                                    <div className="p-2.5 bg-black/80 rounded-xl mt-3 font-mono text-[10px] overflow-hidden text-center select-all border border-white/5">
                                                        {cryptoLocked ? "••••••••••••••••" : cryptoSecret}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCryptoLocked(!cryptoLocked);
                                                            addLog(cryptoLocked ? "Access requested: Keychain validated." : "Secured biometric locks.", cryptoLocked ? "success" : "security");
                                                        }}
                                                        className={`py-2 text-[10px] font-bold rounded-xl active:scale-95 transition-all text-center ${cryptoLocked ? 'bg-indigo-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}
                                                    >
                                                        {cryptoLocked ? "Approve Biometrics" : "Secure Locker"}
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => setPreviewAppType('welcome')}
                                                    className="w-full py-1 text-center text-[9px] uppercase tracking-wider font-bold text-gray-600 hover:text-gray-400"
                                                >
                                                    ← Back Home
                                                </button>
                                            </div>
                                        )}

                                        {/* GPS COORDINATES MAP */}
                                        {previewAppType === 'gps' && (
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="p-3 bg-black/40 border border-indigo-500/10 rounded-2xl relative overflow-hidden">
                                                    <Compass size={32} className={`mx-auto mb-2 text-indigo-400 ${refreshingGps ? 'animate-spin' : 'animate-planet'}`} />
                                                    
                                                    <div className="space-y-1 mt-1 text-center">
                                                        <span className="text-[9px] font-bold text-gray-500 block">Current GEO Fix:</span>
                                                        <code className="text-[10px] font-mono text-emerald-300 block">{rawGpsCoords.lat.toFixed(5)}, {rawGpsCoords.lng.toFixed(5)}</code>
                                                    </div>

                                                    {/* Radial coordinates map overlay */}
                                                    <div className="w-full h-16 border border-white/5 bg-black/50 rounded-xl mt-3 relative overflow-hidden flex items-center justify-center">
                                                        <div className="absolute inset-0 bg-radial-gradient" />
                                                        <span className="rounded-full w-2.5 h-2.5 bg-indigo-500 animate-ping absolute" />
                                                        <span className="rounded-full w-1.5 h-1.5 bg-indigo-400 absolute" />
                                                        <span className="text-[8px] text-gray-600 absolute bottom-1 right-2">Radar Grid Lock</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleRefreshLocation}
                                                    disabled={refreshingGps}
                                                    className="py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[10px] font-bold rounded-xl active:scale-95 transition-all w-full flex justify-center items-center gap-1.5"
                                                >
                                                    <RefreshCw size={11} className={refreshingGps ? 'animate-spin' : ''} />
                                                    <span>Refetch Radar Matrix</span>
                                                </button>

                                                <button
                                                    onClick={() => setPreviewAppType('welcome')}
                                                    className="w-full py-1 text-center text-[9px] uppercase tracking-wider font-bold text-gray-600 hover:text-gray-400"
                                                >
                                                    ← Back Home
                                                </button>
                                            </div>
                                        )}

                                        {/* TODO TASK CHECKLIST */}
                                        {previewAppType === 'todo' && (
                                            <div className="flex-1 flex flex-col justify-between py-1 min-h-0">
                                                <form onSubmit={handleAddTodo} className="flex gap-1">
                                                    <input
                                                        type="text"
                                                        value={todoInput}
                                                        onChange={(e) => setTodoInput(e.target.value)}
                                                        placeholder="New sandbox goal..."
                                                        className="flex-1 bg-black/50 border border-[#333] rounded-lg px-2.5 py-1 text-[9px] text-white placeholder-gray-600 focus:outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-lg px-2 text-[9px]"
                                                    >
                                                        Add
                                                    </button>
                                                </form>

                                                {/* Checklist loop */}
                                                <div className="flex-1 overflow-y-auto space-y-1.5 my-3 pr-1 custom-scrollbar">
                                                    {todoList.map((t) => (
                                                        <div 
                                                            key={t.id} 
                                                            onClick={() => handleToggleTodo(t.id)}
                                                            className={`flex items-center gap-1.5 p-2 bg-[#18181f] border rounded-lg cursor-pointer ${t.completed ? 'border-emerald-500/10 bg-emerald-500/5' : 'border-white/5'}`}
                                                        >
                                                            <div className={`p-0.5 rounded border flex items-center justify-center shrink-0 ${t.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'border-gray-600 bg-black/35 text-transparent'}`}>
                                                                <Check size={8} />
                                                            </div>
                                                            <span className={`text-[9px] truncate max-w-[180px] select-none ${t.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                                                {t.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {todoList.length === 0 && (
                                                        <div className="text-center py-4 text-gray-600 italic text-[9px]">
                                                            All compiled targets are clear!
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between gap-2 mt-auto">
                                                    <button
                                                        onClick={handleClearCompletedTodos}
                                                        className="text-[9px] font-bold text-red-400 hover:text-red-300"
                                                    >
                                                        Flush Done
                                                    </button>
                                                    <button
                                                        onClick={() => setPreviewAppType('welcome')}
                                                        className="text-[9px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        ← Back Home
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Virtual Android back/home bar */}
                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-center gap-8 shrink-0">
                                        <button onClick={() => setPreviewAppType('welcome')} className="text-gray-600 hover:text-gray-400">
                                            <Compass size={11} />
                                        </button>
                                        <div onClick={() => setPreviewAppType('welcome')} className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center hover:border-gray-400 cursor-pointer">
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 hover:bg-gray-400" />
                                        </div>
                                        <button onClick={() => setPreviewAppType('welcome')} className="text-gray-600 hover:text-gray-400 text-[10px] font-mono leading-none">
                                            ◀
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}

                    {/* CODE COMPILING VIEWER */}
                    {orchestratorTab === 'code' && (
                        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-200">
                            
                            {/* File tab titles */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                                {blocks.map((block) => (
                                    <div
                                        key={block.id}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/5 text-[10px] font-bold font-mono text-indigo-300 rounded-lg shrink-0 shrink-0"
                                    >
                                        <FileCode size={11} className="text-indigo-400" />
                                        <span>{block.title}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Diff Code Display Box */}
                            <div className="flex-1 bg-[#09090c] border border-white/5 rounded-2xl overflow-hidden flex flex-col font-mono text-[10px] select-text">
                                <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-gray-400">
                                    <span>Active Compilation Diff Frame</span>
                                    <span className="text-[8px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded font-bold font-sans">
                                        Synced
                                    </span>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto leading-relaxed custom-scrollbar whitespace-pre">
                                    {/* Custom colored mock diff highlighters to convey active AI operations */}
                                    <div className="text-gray-600">// Sandbox Target Update Index Diff</div>
                                    <div className="text-red-400 bg-red-950/15 p-0.5 rounded-sm line-through">- const oldTargetUrl = "http://localhost:3000";</div>
                                    <div className="text-emerald-400 bg-emerald-950/15 p-0.5 rounded-sm font-bold">+ const cloudTargetUrl = "https://aether-app.live/sandbox-auth-9281";</div>
                                    
                                    {blocks.map((b) => (
                                        <div key={b.id} className="mt-4 border-t border-white/5 pt-3">
                                            <div className="text-xs font-bold text-gray-500 font-sans mb-1 select-none">File: {b.title}</div>
                                            <textarea
                                                value={b.content}
                                                onChange={(e) => onUpdateBlockContent(b.id, e.target.value)}
                                                className="w-full bg-transparent border-none outline-none focus:ring-0 font-mono text-[10px] h-[110px] resize-none leading-relaxed text-gray-300"
                                            />
                                            {b.title.endsWith('.js') && (
                                                <button
                                                    onClick={() => onRunCode(b.content, b.title)}
                                                    className="mt-2 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 hover:text-white px-3 py-1 rounded-lg text-[9px] font-sans font-bold transition-all text-white max-w-[120px]"
                                                >
                                                    <Play size={10} />
                                                    <span>Execute Local</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* TERMINAL / MOCK SHELL OUTPUT */}
                    {orchestratorTab === 'logs' && (
                        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-200">
                            
                            <div className="flex-1 bg-[#09090c] border border-white/5 rounded-2xl p-4 font-mono text-[10px] overflow-y-auto space-y-2 custom-scrollbar">
                                {logs.map((l, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-indigo-500/70 select-none">❯</span>
                                        <div className="flex-1">
                                            <span className={`font-bold ${l.type === 'success' ? 'text-emerald-400' : (l.type === 'error' ? 'text-red-500 font-bold' : (l.type === 'security' ? 'text-amber-500' : 'text-gray-300'))}`}>
                                                {l.message}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const trg = e.currentTarget.fld as HTMLInputElement;
                                    if (trg.value.trim()) {
                                        addLog(trg.value, "input");
                                        addLog(`Executed: ${trg.value.trim()}`, "success");
                                        trg.value = '';
                                    }
                                }}
                                className="flex gap-2 border border-white/5 p-2 bg-black/40 rounded-xl"
                            >
                                <span className="text-indigo-400 font-mono text-xs select-none">❯</span>
                                <input
                                    name="fld"
                                    type="text"
                                    placeholder="Type interactive shell evaluation commands..."
                                    className="flex-1 bg-transparent border-none text-[10px] text-gray-200 focus:outline-none focus:ring-0"
                                />
                                <button type="submit" className="text-[9px] bg-[#1a1a24] border border-white/5 hover:bg-[#252536] text-gray-300 font-bold rounded-lg px-3">
                                    Send
                                </button>
                            </form>

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};
