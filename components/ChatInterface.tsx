

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Sparkles, Loader2, Wrench, X, Image as ImageIcon, BrainCircuit, Activity, List, Terminal, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { ChatMessage, RemediationResult } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, images?: string[]) => void;
  isTyping: boolean;
  onFixCode: () => void;
  onGenerate: (prompt: string, images?: string[]) => void;
  pendingImages: string[];
  onClearImages: () => void;
  onStartAgent: (prompt: string) => void;
  onApplyRemediation: (result: RemediationResult) => void;
}

// Sub-component for the Remediation UI inside chat
const RemediationCard: React.FC<{ 
    result: RemediationResult | undefined; 
    isLoading?: boolean; 
    target?: string;
    onApply: (r: RemediationResult) => void; 
}> = ({ result, isLoading, target, onApply }) => {
    const [activeTab, setActiveTab] = useState<'thought' | 'plan' | 'tools'>('thought');
    const [loadingStep, setLoadingStep] = useState(0);

    // Simulated loading steps for better UX "feeling"
    useEffect(() => {
        if (!isLoading) return;
        const steps = [
            "Parsing Abstract Syntax Tree...",
            "Tracing dependency graph...",
            "Detecting anti-patterns...",
            "Simulating potential fixes...",
            "Validating module scope...",
            "Synthesizing holistic patch..."
        ];
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % steps.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="bg-[#18181b] border border-purple-500/30 rounded-lg p-4 mt-2 mb-2 w-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-900/20 rounded-md border border-purple-500/50">
                        <BrainCircuit size={20} className="text-purple-400 animate-spin-slow" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Deep Remediation Engine</div>
                        <div className="text-xs text-purple-400 font-mono">Target: {target || 'Unknown'}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-progress"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">
                            {["Parsing Abstract Syntax Tree...", "Tracing dependency graph...", "Detecting anti-patterns...", "Simulating potential fixes...", "Validating module scope...", "Synthesizing holistic patch..."][loadingStep]}
                        </span>
                        <Loader2 size={12} className="text-purple-500 animate-spin" />
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 opacity-50">
                    <div className="h-8 bg-gray-800 rounded"></div>
                    <div className="h-8 bg-gray-800 rounded"></div>
                    <div className="h-8 bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="bg-[#121214] border border-purple-500/30 rounded-xl overflow-hidden mt-2 mb-2 shadow-xl ring-1 ring-white/5 w-full">
            {/* Header */}
            <div className="bg-[#1a1a1c] p-3 border-b border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-green-400" />
                    <span className="text-sm font-bold text-white">Analysis Complete</span>
                </div>
                <div className="text-[10px] bg-[#333] px-2 py-1 rounded text-gray-300 font-mono">
                    {result.impactedFiles.length} File(s) Impacted
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#333]">
                <button 
                    onClick={() => setActiveTab('thought')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${activeTab === 'thought' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Activity size={12} /> Thought
                </button>
                <button 
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${activeTab === 'plan' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <List size={12} /> Plan
                </button>
                <button 
                    onClick={() => setActiveTab('tools')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${activeTab === 'tools' ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Terminal size={12} /> Tools
                </button>
            </div>

            {/* Content Body */}
            <div className="bg-[#0a0a0a] h-[250px] overflow-y-auto p-3 custom-scrollbar">
                {activeTab === 'thought' && (
                    <div className="space-y-2">
                        <div className="text-xs text-purple-200/80 font-mono leading-relaxed whitespace-pre-wrap border-l-2 border-purple-500/30 pl-3">
                            {result.thoughtStream}
                        </div>
                    </div>
                )}
                {activeTab === 'plan' && (
                    <div className="space-y-2">
                         {result.plan.map((step, i) => (
                            <div key={i} className="flex gap-2 text-xs">
                                <span className="text-blue-500 font-bold">{i+1}.</span>
                                <span className="text-gray-300">{step}</span>
                            </div>
                         ))}
                    </div>
                )}
                {activeTab === 'tools' && (
                    <div className="font-mono text-[10px] space-y-1">
                        {result.toolLogs.map((log, i) => (
                            <div key={i} className="flex gap-2 text-gray-400 border-b border-white/5 pb-1">
                                <span className="text-green-500 font-bold">{'>'}</span>
                                {log}
                            </div>
                        ))}
                         <div className="text-green-400 font-bold mt-2">{'>'} READY_TO_APPLY</div>
                    </div>
                )}
            </div>

            {/* Impact Warning */}
            <div className="px-3 py-2 bg-[#1a0f0f] border-t border-red-500/20 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-400">
                    Applying this fix will physically rewrite <span className="text-white font-bold">{result.impactedFiles.join(', ')}</span>.
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-[#1a1a1c] border-t border-[#333] flex justify-end">
                <button 
                    onClick={() => onApply(result)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                >
                    <Wrench size={14} />
                    Execute Remediation Plan
                </button>
            </div>
        </div>
    );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    messages, 
    onSendMessage, 
    isTyping, 
    onFixCode, 
    onGenerate,
    pendingImages,
    onClearImages,
    onStartAgent,
    onApplyRemediation
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }
    
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, pendingImages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && pendingImages.length === 0) return;
    
    // Check if it's a generation request
    const lower = input.toLowerCase();
    const isGen = lower.startsWith('create') || lower.startsWith('generate') || lower.startsWith('make') || lower.startsWith('build');

    if (isGen && pendingImages.length === 0) {
         onGenerate(input, undefined);
    } else if (isGen && pendingImages.length > 0) {
        // Generation with context
        onGenerate(input, pendingImages);
    } else {
         onSendMessage(input, pendingImages);
    }
    setInput('');
    onClearImages();
  };

  const handleAgentStart = () => {
      if(!input.trim()) return;
      onStartAgent(input);
      setInput('');
  }

  return (
    <div className="flex flex-col h-full bg-[#18181b] border-l border-[#333]">
      {/* Header */}
      <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#1f1f22]">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Bot className="text-purple-500" size={20} />
          <span>Aether AI</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onFixCode}
                className="flex items-center gap-1 px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs rounded border border-red-900/50 transition-colors"
                title="Detect errors and fix code"
            >
                <Wrench size={12} />
                <span>Auto-Fix</span>
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
                <Sparkles className="mx-auto mb-3 opacity-20" size={48} />
                <p className="text-sm">Ask me to generate code, debug issues, or use the Agent Core for complex projects.</p>
                <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
                    <button onClick={() => onGenerate("Create a responsive navbar with a logo", undefined)} className="bg-[#27272a] hover:bg-[#323235] p-2 rounded transition-colors text-left">"Create a responsive navbar..."</button>
                    <button onClick={() => onGenerate("Make a bouncing ball animation", undefined)} className="bg-[#27272a] hover:bg-[#323235] p-2 rounded transition-colors text-left">"Make a bouncing ball..."</button>
                </div>
            </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-700/30 mt-1">
                    <Bot size={16} className="text-purple-400" />
                </div>
            )}
            
            <div className={`flex flex-col gap-1 ${msg.role === 'model' ? 'w-[90%]' : 'max-w-[85%]'}`}>
                {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1 justify-end">
                        {msg.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Attachment" className="w-32 h-auto rounded border border-gray-600" />
                        ))}
                    </div>
                )}
                
                {/* Text Content */}
                {msg.content && (
                     <div
                        className={`rounded-lg p-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#27272a] text-gray-200 border border-[#3f3f46]'
                        }`}
                        >
                        {msg.content.split('\n').map((line, i) => (
                            <p key={i} className="min-h-[1em]">{line}</p>
                        ))}
                    </div>
                )}

                {/* Cognitive Accordion (Remediation) */}
                {(msg.remediation || msg.isRemediationLoading) && (
                    <RemediationCard 
                        result={msg.remediation} 
                        isLoading={msg.isRemediationLoading} 
                        target={msg.remediationTarget}
                        onApply={onApplyRemediation}
                    />
                )}
            </div>

            {msg.role === 'user' && (
                 <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0 border border-blue-700/30 mt-1">
                    <User size={16} className="text-blue-400" />
                </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-700/30">
                <Bot size={16} className="text-purple-400" />
            </div>
            <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-3">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#333] bg-[#1f1f22]">
        
        {/* Pending Images */}
        {pendingImages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {pendingImages.map((img, idx) => (
                    <div key={idx} className="relative shrink-0 group">
                        <img src={img} alt="Preview" className="h-16 rounded border border-blue-500/50" />
                        <button 
                            onClick={onClearImages} 
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="flex gap-2">
             <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-colors ${
                    isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-[#27272a] text-gray-400 hover:text-white'
                }`}
                title="Voice Input"
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          <div className="flex-1 relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pendingImages.length > 0 ? "Describe what to do with the screenshot..." : "Type instruction..."}
                className="w-full bg-[#121214] text-white rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#333]"
                disabled={isTyping}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        handleSubmit(e);
                    }
                }}
            />
            {input.length > 5 && (
                 <button 
                    type="button"
                    onClick={handleAgentStart}
                    className="absolute right-1 top-1 bottom-1 px-2 text-xs bg-purple-900/50 hover:bg-purple-800 text-purple-200 rounded flex items-center gap-1 transition-colors border border-purple-700/50"
                    title="Plan & Execute with Agent Core"
                >
                    <BrainCircuit size={12} />
                    Plan
                </button>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={(!input.trim() && pendingImages.length === 0) || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
