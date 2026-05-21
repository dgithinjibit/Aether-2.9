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
import { CodeBlockType, SecurityIssue, LogItem, LibraryPackage, BlockType } from './types';
import { PermissionPrompt } from './components/PermissionPrompt';
import { EditorView } from './components/EditorView';
import { TerminalView } from './components/TerminalView';
import { SecurityView } from './components/SecurityView';
import { StudioView } from './components/StudioView';
import { FlutterExporter } from './components/FlutterExporter';
import { PublishDialog } from './components/PublishDialog';
import { IntentDialog } from './components/IntentDialog';
import { AiCanvasView } from './components/AiCanvasView';

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

    // Mobile tabs: 'canvas' | 'editor' | 'security' | 'studio' | 'flutter_apk'
    const [activeTab, setActiveTab] = useState<'canvas' | 'editor' | 'security' | 'studio' | 'flutter_apk'>('canvas');

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

        // Auto move view to Terminal so they can view live output!
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
                    // Try running as plain block if assignment expression
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
        setActiveTab('editor'); // view code block directly
    };

    const handleAiScaffoldSubmit = (intent: string) => {
        setIsIntentOpen(false);
        addLog(`Scaffolding module for intent request: "${intent}"`, 'system');
        
        // Simulates beautiful dynamic scaffolds based on prompt keys
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
            setActiveTab('editor');
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
                    <button
                        onClick={() => setIsEli5Mode(!isEli5Mode)}
                        className={`p-1.5 rounded-xl border transition-all active:scale-95 ${isEli5Mode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-[#18181b] border-[#333] text-gray-500 hover:text-white'}`}
                        title="Toggle Easy Translation Mode"
                    >
                        <Baby size={16} />
                    </button>

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
                                <AiCanvasView
                                    blocks={blocks}
                                    logs={logs}
                                    onAddBlock={handleAddBlock}
                                    onUpdateBlockContent={handleUpdateBlockContent}
                                    onRunCode={handleRunCode}
                                    addLog={(msg, type) => addLog(msg, type)}
                                    isEli5Mode={isEli5Mode}
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
                            {activeTab === 'flutter_apk' && (
                                <FlutterExporter />
                            )}
                        </div>

                        {/* Navigation Dock (Mobile Sticky Footer Layout) */}
                        <div className="bg-[#111116] border border-white/5 rounded-2xl p-2.5 flex items-center justify-between shrink-0 mb-safe gap-1 shadow-2xl relative z-30">
                            {[
                                { key: 'canvas' as const, label: 'AI Canvas', icon: <Sparkles size={18} /> },
                                { key: 'editor' as const, label: 'Raw Code', icon: <FileCode size={18} /> },
                                { key: 'security' as const, label: 'Audit', icon: <Shield size={18} /> },
                                { key: 'studio' as const, label: 'Lib Pack', icon: <Database size={18} /> }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all font-sans relative ${
                                        activeTab === tab.key
                                            ? 'bg-indigo-600/10 text-indigo-400 font-extrabold shadow-inner'
                                            : 'text-gray-500 hover:text-gray-300 font-medium'
                                    }`}
                                >
                                    <div className={`transition-transform duration-200 ${activeTab === tab.key ? 'scale-110' : 'scale-100'}`}>
                                        {tab.icon}
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider">{tab.label}</span>
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-1 w-5 h-0.5 bg-indigo-500 rounded-full" />
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
