import React, { useState, useEffect } from 'react';
import { 
    Smartphone, 
    CheckCircle2, 
    ShieldAlert, 
    FileCode, 
    Terminal as TerminalIcon, 
    Shield, 
    Database, 
    Cpu, 
    Sparkles, 
    Rocket, 
    HelpCircle, 
    Settings, 
    Menu, 
    Baby, 
    Eye,
    Globe
} from 'lucide-react';
import { CodeBlockType, SecurityIssue, LogItem, LibraryPackage, BlockType, ChatMessage } from './types';
import { PermissionPrompt } from './components/PermissionPrompt';
import { EditorView } from './components/EditorView';
import { TerminalView } from './components/TerminalView';
import { SecurityView } from './components/SecurityView';
import { StudioView } from './components/StudioView';
import { FlutterExporter } from './components/FlutterExporter';
import { PublishDialog } from './components/PublishDialog';
import { IntentDialog } from './components/IntentDialog';
import { AssistantView, AppPreviewHub } from './components/AiCanvasView';

const INITIAL_BLOCKS: CodeBlockType[] = [
    {
        id: 'b1',
        type: 'js',
        title: 'index.js',
        content: `// Aether Node Native Environment\nconsole.log("🚀 Initialization starting...");\n\nlet a = 12;\nlet b = 30;\nconsole.log("Math operation result:", a * b);\n\nconsole.log("Prompting device audio check...");\n`
    },
    {
        id: 'b2',
        type: 'json',
        title: 'package.json',
        content: `{\n  "name": "aether-module",\n  "version": "1.0.0",\n  "description": "Android Native sandbox wrapper configurations",\n  "dependencies": {\n    "typescript": "^5.0.0"\n  }\n}`
    },
    {
        id: 'b3',
        type: 'css',
        title: 'theme.css',
        content: `/* Mobile Accent theme layout */\nbody {\n  background: #111116;\n  color: #f1f1f1;\n  letter-spacing: -0.01em;\n}`
    },
    {
        id: 'b4',
        type: 'markdown',
        title: 'info.md',
        content: `# Aether Developer Guide\nTo run your local scripts, click **Run** on index.js, then visit the **Terminal** tab to evaluate feedback logs immediately.`
    }
];

const INITIAL_PACKAGES: LibraryPackage[] = [
    { name: 'react', url: 'https://cdn.jsdelivr.net/npm/react@19.0.0/index.js', vulnerabilities: 0, size: '22 KB' },
    { name: 'lucide-react', url: 'https://cdn.jsdelivr.net/npm/lucide-react@0.479.0/dist/esm/lucide.js', vulnerabilities: 0, size: '84 KB' },
    { name: 'recharts', url: 'https://cdn.jsdelivr.net/npm/recharts@2.10.0/dist/recharts.js', vulnerabilities: 0, size: '140 KB' }
];

export default function App() {
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [isEli5Mode, setIsEli5Mode] = useState(false);

    // IDE State Workspace
    const [blocks, setBlocks] = useState<CodeBlockType[]>(INITIAL_BLOCKS);
    const [activeBlockId, setActiveBlockId] = useState<string>('b1');
    const [packages, setPackages] = useState<LibraryPackage[]>(INITIAL_PACKAGES);

    // Feed / Console logs
    const [logs, setLogs] = useState<LogItem[]>([
        { message: 'Initializing Aether IDE Mobile Native Environment...', type: 'system', timestamp: Date.now() },
        { message: 'Checking Android system permissions map status...', type: 'system', timestamp: Date.now() }
    ]);

    // Modals
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isIntentOpen, setIsIntentOpen] = useState(false);

    // Mobile tabs: 'canvas' | 'app_view' | 'editor' | 'terminal' | 'security' | 'studio' | 'flutter_apk'
    const [activeTab, setActiveTab] = useState<'canvas' | 'app_view' | 'editor' | 'terminal' | 'security' | 'studio' | 'flutter_apk'>('canvas');

    // ==========================================
    // SHARED AI ASSISTANT & CLIENT SCREEN STATES
    // ==========================================
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

    // Dynamic Live Preview Application State (Inside Center Canvas)
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

    const addLog = (msg: string, type: 'system' | 'security' | 'success' | 'error' | 'input' | 'output' = 'system', fileName?: string) => {
        setLogs(prev => [...prev, { message: msg, type, timestamp: Date.now(), fileName }]);
    };

    const handleUpdateBlockContent = (id: string, content: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    };

    const handleUpdateBlockTitle = (id: string, title: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, title } : b));
        addLog(`Modified module file address target to: ${title}`, 'system');
    };

    const handleAddBlock = (title: string, type: BlockType, content: string) => {
        const newB: CodeBlockType = {
            id: `b-${Date.now()}`,
            type,
            title,
            content
        };
        setBlocks(prev => [...prev, newB]);
        setActiveBlockId(newB.id);
        addLog(`Created new configuration block file: ${title}`, 'success');
    };

    const handleRemoveBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        addLog(`Destroyed custom codebase target link`, 'security');
    };

    const handleAddPackage = (name: string, url: string) => {
        const newPkg: LibraryPackage = {
            name,
            url,
            vulnerabilities: 0,
            size: '12 KB'
        };
        setPackages(prev => [...prev, newPkg]);
        addLog(`Injected external package CDN distribution: ${name}`, 'success');
    };

    const handleRemovePackage = (url: string) => {
        setPackages(prev => prev.filter(p => p.url !== url));
        addLog(`Ejected external package distribution source`, 'security');
    };

    // Simulated evaluation core
    const handleRunCode = (code: string, filename: string) => {
        addLog(`Executing local compilation workflow for ${filename}...`, 'system');
        const bufferLogs: string[] = [];
        const captureLog = (...args: any[]) => {
            bufferLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        try {
            // Evaluates in local context binding log capture functions safely
            const executor = new Function('console', `
                try {
                     ${code}
                } catch(err) {
                     console.error(err.message);
                }
            `);

            const mockConsole = {
                log: captureLog,
                error: (msg: string) => bufferLogs.push(`[Error]: ${msg}`),
                info: captureLog,
                warn: captureLog
            };

            executor(mockConsole);

            if (bufferLogs.length === 0) {
                addLog('Script execution completed successfully with exit code 0.', 'success', filename);
            } else {
                bufferLogs.forEach(line => {
                    if (line.startsWith('[Error]:')) {
                        addLog(line.replace('[Error]:', '').trim(), 'error', filename);
                    } else {
                        addLog(line, 'output', filename);
                    }
                });
                addLog('Compilation run successful.', 'success', filename);
            }
        } catch (e: any) {
            addLog(`Syntax error failed to launch module compiles: ${e.message}`, 'error', filename);
        }

        // Move to terminal tab elegantly to check feedback
        setActiveTab('terminal');
    };

    const handleExecuteTerminalCommand = (cmd: string) => {
        addLog(cmd, 'input');
        const buffer: string[] = [];
        const captureLog = (...args: any[]) => {
            buffer.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        try {
            // Direct expression evaluation context
            const evaluator = new Function('console', `
                try {
                    const result = (${cmd});
                    if (result !== undefined) {
                        console.log(result);
                    }
                } catch(e) {
                    try {
                        ${cmd}
                    } catch(e2) {
                        console.error(e2.message);
                    }
                }
            `);

            const mockConsole = {
                log: captureLog,
                error: (msg: string) => buffer.push(`[Error]: ${msg}`),
                info: captureLog,
                warn: captureLog
            };

            evaluator(mockConsole);

            if (buffer.length === 0) {
                // Command processed but returned nothing
            } else {
                buffer.forEach(b => {
                    if (b.startsWith('[Error]:')) {
                        addLog(b.replace('[Error]:', '').trim(), 'error', 'Shell');
                    } else {
                        addLog(b, 'output', 'Shell');
                    }
                });
            }
        } catch (e: any) {
            addLog(`Evaluation error: ${e.message}`, 'error', 'Shell');
        }
    };

    const handleInjectCapability = (cap: { title: string; filename: string; content: string; blockType: string }) => {
        handleAddBlock(cap.filename, cap.blockType as BlockType, cap.content);
        addLog(`Capability module established into directory logs.`, 'success');
        setActiveTab('editor'); // View code block directly
    };

    // ==========================================
    // ACTION TRIGGERS (LIFTED LOGIC)
    // ==========================================
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

    const handleSendPrompt = (txtPrompt: string) => {
        if (!txtPrompt.trim() && !attachedFile) return;

        const currentPrompt = txtPrompt || `Analyze loaded file: ${attachedFile}`;

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

        setIsThinking(true);
        setThoughtProgress(10);
        setThoughtText('Validating security guardrails...');

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

            let aiText = '';
            let appTarget: typeof previewAppType = 'welcome';
            let title = 'custom_module.js';
            let code = '// Rendered by Aether engine\n';

            const userTextLower = currentPrompt.toLowerCase();

            if (userTextLower.includes('weather')) {
                appTarget = 'weather';
                aiText = "Superb choice! I have compiled the Cloud Weather Widget. The physical hardware stream registers normal ambient humidity, and has live styling in spatial dark modes. Open the My App tab to interact with your live software immediately!";
                title = 'weather_service.js';
                code = `// Cloud Weather Widget Script\nconsole.log("[Aether AI]: Synchronized weather indicators.");\nasync function refreshAmbientSensor() {\n  const humidity = 62;\n  const temp = Math.floor(Math.random() * 5) + 21;\n  console.log("Telemetry ambient update: " + temp + "°C, humidity: " + humidity + "%");\n}\nrefreshAmbientSensor();`;
            } else if (userTextLower.includes('crypto') || userTextLower.includes('vault') || userTextLower.includes('lock')) {
                appTarget = 'crypto';
                aiText = "Shield lockbox loaded! I signed the module using AES-256-GCM configurations and bound local browser storage access values so that encryption remains persistently aligned against your local APK keychain. Go to My App to test it!";
                title = 'crypto_shield.js';
                code = `// Cryptographic Lockbox module\nconsole.log("[Aether AI]: Loading biometric lock signatures.");\nfunction decryptSecurePayload() {\n  const rawSig = "AES_KEY_" + Math.random().toString(36).substring(4).toUpperCase();\n  console.log("Decryption signature valid. Seed generated: " + rawSig);\n}\ndecryptSecurePayload();`;
            } else if (userTextLower.includes('location') || userTextLower.includes('gps') || userTextLower.includes('radar')) {
                appTarget = 'gps';
                aiText = "GPS mapping sequence initiated. I mapped the device coordinate matrix inside our isolated responsive viewport! Checkout your live GPS tracker on your My App tab now.";
                title = 'spatial_radar.js';
                code = `// Spatial Coordinate Tracker\nconsole.log("[Aether AI]: Initializing continuous GPS pipeline...");\nnavigator.geolocation.getCurrentPosition(\n  (pos) => console.log("Real-time telemetry lat: " + pos.coords.latitude),\n  (err) => console.log("Standard geo mapping bypassed securely.")\n);`;
            } else if (userTextLower.includes('todo') || userTextLower.includes('task') || userTextLower.includes('checklist')) {
                appTarget = 'todo';
                aiText = "Done! I generated the Premium Task Manager widget on your cockpit. It contains customized state variables to allow users to toggle checkbox states, and counts complete indexes via high-volume local structures. Test it in My App!";
                title = 'task_adaptor.js';
                code = `// Task Planner Core\nconsole.log("[Aether AI]: Checklist state compiled successfully.");\nlet checklist = ["Android permissions verified", "Hot-reload enabled"];\nconsole.log("Count of compiled plan targets: " + checklist.length);`;
            } else {
                aiText = "Understood. I parsed your direct request instructions and adjusted key parameters. The compiled app has been optimized for size constraints and edge speed. Click run under code tab or type shell values directly to evaluate the updated module pipeline!";
                title = 'custom_node.js';
                code = `// Customized module layout\nconsole.log("[Aether AI]: Instantiated custom sandbox script successfully.");\nlet tasks = ["Check device hardware", "Compile client assets"];\ntasks.forEach(t => console.log("Queued task: " + t));`;
            }

            setChatHistory(prev => [...prev, {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                text: aiText,
                timestamp: Date.now()
            }]);

            setPreviewAppType(appTarget);
            handleAddBlock(title, 'js', code);
            
            // AUTOMATICALLY focus onto "My App" view for a premium interactive feel!
            setActiveTab('app_view');
            addLog(`Codebase hot-updated successfully with ${title}!`, "success");

        }, 2200);
    };

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

    const handleAiScaffoldSubmit = (intent: string) => {
        setIsIntentOpen(false);
        addLog(`Scaffolding module for intent request: "${intent}"`, 'system');
        
        setTimeout(() => {
            let filename = 'custom_module.js';
            let content = `// Scaffolded by Aether AI\nconsole.log("Analyzing user instructions...");\n`;
            
            if (intent.toLowerCase().includes('weather')) {
                filename = 'weather_service.js';
                content = `// Aether Weather API integration Node\nasync function fetchTemperatures() {\n  console.log("[Network]: Dialing weather API edge servers...");\n  const temp = Math.floor(Math.random() * 15) + 20;\n  console.log("Captured Local Ambient: " + temp + "°C");\n}\nfetchTemperatures();`;
            } else if (intent.toLowerCase().includes('api') || intent.toLowerCase().includes('fetch')) {
                filename = 'api_adapter.js';
                content = `// Simulated Rest client\nfunction synchronizeExternalLocker() {\n  console.log("[Secure Link]: Opening database proxy sync...");\n  const payload = { active: true, timestamp: Date.now() };\n  console.log("Distributed payload queued into logs:", payload);\n}\nsynchronizeExternalLocker();`;
            } else if (intent.toLowerCase().includes('crypto') || intent.toLowerCase().includes('auth')) {
                filename = 'crypto_shield.js';
                content = `// Cryptographic Key validator\nfunction enforceShieldValidators() {\n  const keySeed = "AETHER_KEY_" + Math.random().toString(36).substring(7);\n  console.log("[Authentication Key]: Active validation seed key generated.");\n  console.log("Validation: PASS (100% Secure)");\n}\nenforceShieldValidators();`;
            } else {
                filename = 'custom_sandbox.js';
                content = `// Customized interactive code template\nconsole.log("[AI Engine]: Parsing multimodal instruction context.");\nconst taskCount = 101;\nconsole.log("Calculated pipeline metrics: " + taskCount + " tasks securely initialized.");`;
            }

            handleAddBlock(filename, 'js', content);
            setActiveTab('app_view'); // Go to App View instantly
            addLog(`Successfully composed and compiled ${filename}. Ready to execute.`, 'success');
        }, 1000);
    };

    return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0d] via-[#101015] to-[#161722] flex flex-col font-sans text-white h-full w-full overflow-hidden select-none">
            
            {/* Header Area */}
            <div className="h-16 pt-safe flex items-center justify-between px-5 bg-black/40 backdrop-blur-xl border-b border-white/5 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mt-1 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.2)] select-none">
                        <Smartphone size={20} />
                    </div>
                    <div className="flex flex-col mt-1 select-none">
                        <h1 className="font-bold text-base leading-none tracking-tight text-gray-100 flex items-center gap-1.5">
                            Aether Mobile
                            <span className="text-[8px] bg-indigo-500/15 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 select-none">IDE</span>
                        </h1>
                        <span className="text-[9px] text-gray-500 font-medium tracking-wide leading-none mt-1">Multi-Modal Sandbox</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    {/* ELI5 Toggle */}
                    <div className="relative group">
                        <button
                            onClick={() => setIsEli5Mode(!isEli5Mode)}
                            className={`p-1.5 rounded-xl border transition-all active:scale-95 ${isEli5Mode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-[#18181b] border-[#333] text-gray-500 hover:text-white'}`}
                        >
                            <Baby size={16} />
                        </button>
                        {/* Custom visual popover tooltip */}
                        <div className="absolute right-0 top-9 w-64 p-3 bg-zinc-900/95 border border-amber-500/20 rounded-xl shadow-2xl pointer-events-none opacity-0 scale-95 origin-top-right invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 z-50 text-left">
                            <div className="font-bold text-[10px] text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Baby size={10} className="text-amber-400" /> Simplification Engine (ELI5)
                            </div>
                            <p className="text-[9px] text-gray-300 leading-relaxed font-sans">
                                Translates technical cryptographic audits, system error sequences, and network jargon into simple, conversational explanations suitable for anyone.
                            </p>
                        </div>
                    </div>

                    {/* Publish Rocket */}
                    <button
                        onClick={() => setIsPublishOpen(true)}
                        disabled={!permissionsGranted}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.25)] text-xs shrink-0"
                    >
                        <Rocket size={13} className="animate-bounce" />
                        <span className="hidden xs:inline">Publish</span>
                    </button>
                    
                    {/* Status Dot */}
                    {permissionsGranted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Locked
                        </div>
                    )}
                </div>
            </div>

            {/* Core Body Container */}
            <div className="flex-1 w-full overflow-hidden relative flex flex-col p-4">
                
                {/* Background ambient lighting */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-indigo-500/[0.04] blur-[120px] pointer-events-none rounded-full" />
                
                {!permissionsGranted ? (
                    <div className="flex-1 flex items-center justify-center relative z-20">
                        <PermissionPrompt
                            onAuthorized={() => {
                                  setPermissionsGranted(true);
                                  addLog('Core sandboxing and hardware permissions unlocked successfully.', 'success');
                            }}
                            addLog={(msg, type) => addLog(msg, type)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden relative z-20 h-full">
                        
                        {/* Tab Content Display Area */}
                        <div className="flex-1 overflow-hidden min-h-0 bg-transparent mb-4">
                            {activeTab === 'canvas' && (
                                <AssistantView
                                    chatHistory={chatHistory}
                                    isThinking={isThinking}
                                    thoughtProgress={thoughtProgress}
                                    thoughtText={thoughtText}
                                    attachedFile={attachedFile}
                                    setAttachedFile={setAttachedFile}
                                    isListening={isListening}
                                    onSendPrompt={handleSendPrompt}
                                    onVoiceToggle={handleVoiceToggle}
                                    prompt={prompt}
                                    setPrompt={setPrompt}
                                />
                            )}
                            {activeTab === 'app_view' && (
                                <AppPreviewHub
                                    previewAppType={previewAppType}
                                    setPreviewAppType={setPreviewAppType}
                                    weatherTemp={weatherTemp}
                                    setWeatherTemp={setWeatherTemp}
                                    weatherCond={weatherCond}
                                    setWeatherCond={setWeatherCond}
                                    todoInput={todoInput}
                                    setTodoInput={setTodoInput}
                                    todoList={todoList}
                                    setTodoList={setTodoList}
                                    cryptoSecret={cryptoSecret}
                                    cryptoLocked={cryptoLocked}
                                    setCryptoLocked={setCryptoLocked}
                                    rawGpsCoords={rawGpsCoords}
                                    refreshingGps={refreshingGps}
                                    onRefreshLocation={handleRefreshLocation}
                                    onAddTodo={handleAddTodo}
                                    onToggleTodo={handleToggleTodo}
                                    onClearCompletedTodos={handleClearCompletedTodos}
                                />
                            )}
                            {activeTab === 'editor' && (
                                <EditorView
                                    blocks={blocks}
                                    activeBlockId={activeBlockId}
                                    setActiveBlockId={setActiveBlockId}
                                    onUpdateBlockContent={handleUpdateBlockContent}
                                    onUpdateBlockTitle={handleUpdateBlockTitle}
                                    onAddBlock={handleAddBlock}
                                    onRemoveBlock={handleRemoveBlock}
                                    onRunCode={handleRunCode}
                                    onOpenIntentDialog={() => setIsIntentOpen(true)}
                                />
                            )}
                            {activeTab === 'terminal' && (
                                <TerminalView
                                    logs={logs}
                                    onClearLogs={() => {
                                        setLogs([]);
                                        addLog('Terminal buffer cleared.', 'system');
                                    }}
                                    onExecuteCommand={handleExecuteTerminalCommand}
                                />
                            )}
                            {activeTab === 'security' && (
                                <SecurityView 
                                    isEli5Mode={isEli5Mode} 
                                    setEli5Mode={setIsEli5Mode} 
                                />
                            )}
                            {activeTab === 'studio' && (
                                <StudioView
                                    packages={packages}
                                    onAddPackage={handleAddPackage}
                                    onRemovePackage={handleRemovePackage}
                                    onInjectCapability={handleInjectCapability}
                                />
                            )}
                        </div>

                        {/* Navigation Dock (Mobile Sticky Footer Layout) */}
                        <div className="bg-[#111116] border border-white/5 rounded-2xl p-2.5 flex items-center justify-between shrink-0 mb-safe gap-1 shadow-2xl relative z-30 overflow-x-auto min-w-0">
                            {[
                                { key: 'canvas' as const, label: 'Assistant', icon: <Sparkles size={16} /> },
                                { key: 'app_view' as const, label: 'My App', icon: <Smartphone size={16} /> },
                                { key: 'editor' as const, label: 'Raw Code', icon: <FileCode size={16} /> },
                                { key: 'terminal' as const, label: 'Terminal', icon: <TerminalIcon size={16} /> },
                                { key: 'security' as const, label: 'Audit', icon: <Shield size={16} /> },
                                { key: 'studio' as const, label: 'Lib Pack', icon: <Database size={16} /> }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 min-w-[65px] flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all font-sans relative ${
                                        activeTab === tab.key
                                            ? 'bg-indigo-600/10 text-indigo-400 font-extrabold shadow-inner'
                                            : 'text-gray-500 hover:text-gray-300 font-medium'
                                    }`}
                                >
                                    <div className={`transition-transform duration-200 ${activeTab === tab.key ? 'scale-110' : 'scale-100'}`}>
                                        {tab.icon}
                                    </div>
                                    <span className="text-[8px] uppercase tracking-wider font-semibold whitespace-nowrap">{tab.label}</span>
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0.5 w-4 h-0.5 bg-indigo-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Global Overlay Components */}
            <PublishDialog
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
                isEli5Mode={isEli5Mode}
                onShare={() => addLog('Production access URL successfully shared to secure clip buffer!', 'success')}
            />

            <IntentDialog
                isOpen={isIntentOpen}
                onClose={() => setIsIntentOpen(false)}
                onSubmit={handleAiScaffoldSubmit}
            />
        </div>
    );
}
