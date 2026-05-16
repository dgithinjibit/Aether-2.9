
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { EditorFiles, LogEntry, ChatMessage, ViewMode, ExternalLibrary, AgentState, AgentPlan, AgentLog, WorkspaceTab, CodeBlock as CodeBlockType, CodeIssue, BlockType, RemediationResult, FileOperation, AgentTask } from './types';
import { DEFAULT_BLOCKS_CODEBASE } from './constants';
import * as GeminiService from './services/geminiService';

import Preview from './components/Preview';
import Console from './components/Console';
import ChatInterface from './components/ChatInterface';
import Toolbar from './components/Toolbar';
import LibraryManager from './components/LibraryManager';
import AgentWorkspace from './components/AgentWorkspace';
import Workspace from './components/Workspace';
import DataStudio from './components/DataStudio';
import SecurityPanel from './components/SecurityPanel';
import IntentDialog from './components/IntentDialog';
import PublishDialog from './components/PublishDialog';
import { Construction } from 'lucide-react';

const App: React.FC = () => {
  // State: Modular Workspace
  const [activeTabId, setActiveTabId] = useState<'codebase' | 'logic' | 'data' | 'security'>('codebase');
  
  // Tab Blocks
  const [tabBlocks, setTabBlocks] = useState<Record<string, CodeBlockType[]>>({
    codebase: DEFAULT_BLOCKS_CODEBASE,
    logic: [], 
    data: [], 
    security: []
  });
  
  // State: AI Diagnostics
  const [issues, setIssues] = useState<Record<string, CodeIssue[]>>({});
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>('safe');
  const [isEli5Mode, setIsEli5Mode] = useState(false);

  // Mobile Responsiveness
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Derived files state for Preview/AI (Compiles blocks)
  const compiledFiles = useMemo((): EditorFiles => {
    const allBlocks = tabBlocks.codebase;
    return {
        html: allBlocks.filter(b => b.type === 'html').map(b => `<!-- [BLOCK: ${b.title}] -->\n${b.content}`).join('\n\n'),
        css: allBlocks.filter(b => b.type === 'css').map(b => `/* [BLOCK: ${b.title}] */\n${b.content}`).join('\n\n'),
        js: allBlocks.filter(b => b.type === 'js').map(b => `/* [BLOCK: ${b.title}] */\n${b.content}`).join('\n\n')
    };
  }, [tabBlocks.codebase]);

  const getAllBlocks = (): CodeBlockType[] => {
      return tabBlocks.codebase;
  };

  // State: Data Layer
  const [injectedData, setInjectedData] = useState<any[]>([]);

  // State: UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-collapse sidebar on mobile start
  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const [sidebarMode, setSidebarMode] = useState<'chat' | 'agent'>('chat');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isLibManagerOpen, setIsLibManagerOpen] = useState(false);
  const [isIntentDialogOpen, setIsIntentDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  
  // Layout Dimensions State
  const [splitPos, setSplitPos] = useState(50); // Percentage for main split
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [lastAction, setLastAction] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Auto-hide notification after 5s
  useEffect(() => {
     if (lastAction) {
         const t = setTimeout(() => setLastAction(null), 5000);
         return () => clearTimeout(t);
     }
  }, [lastAction]);

  // Refs
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // State: Runtime
  const [runTrigger, setRunTrigger] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeLibraries, setActiveLibraries] = useState<ExternalLibrary[]>([]);

  const handleLog = useCallback((newLog: Omit<LogEntry, 'id' | 'count'>) => {
      setLogs(prevLogs => {
          const lastLog = prevLogs[prevLogs.length - 1];
          if (lastLog && 
              lastLog.message === newLog.message && 
              lastLog.type === newLog.type &&
              lastLog.fileName === newLog.fileName &&
              lastLog.lineNumber === newLog.lineNumber
          ) {
              const updatedLogs = [...prevLogs];
              updatedLogs[updatedLogs.length - 1] = {
                  ...lastLog,
                  count: lastLog.count + 1,
                  timestamp: newLog.timestamp 
              };
              return updatedLogs;
          }
          return [...prevLogs, { ...newLog, id: Date.now().toString() + Math.random(), count: 1 }];
      });

      if (newLog.type === 'error') {
          setIsConsoleOpen(true);
      }
  }, []);

  // State: AI Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // State: Agent Core
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);

  // State: Visual Context
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingContext, setPendingContext] = useState<string>('');

  // --- AI Linter Logic ---
  useEffect(() => {
    const checkIssues = async () => {
        const allBlocks = tabBlocks.codebase;
        if (allBlocks.length === 0) return;
        
        setSecurityStatus('scanning');
        try {
            const detectedIssues = await GeminiService.checkCodeQuality(allBlocks);
            
            const issueMap: Record<string, CodeIssue[]> = {};
            let hasCriticalSecurity = false;
            let hasWarningSecurity = false;

            detectedIssues.forEach(issue => {
                if (!issueMap[issue.blockId]) issueMap[issue.blockId] = [];
                issueMap[issue.blockId].push(issue);

                // Detect security hazards marked as 'error'
                if (issue.severity === 'error' && (
                    issue.message.toLowerCase().includes('security') || 
                    issue.message.toLowerCase().includes('key') || 
                    issue.message.toLowerCase().includes('token') ||
                    issue.message.toLowerCase().includes('secret')
                )) {
                    hasCriticalSecurity = true;
                } else if (issue.severity === 'warning') {
                    hasWarningSecurity = true;
                }
            });
            setIssues(issueMap);
            setSecurityStatus(hasCriticalSecurity ? 'critical' : hasWarningSecurity ? 'warning' : 'safe');
        } catch (e) {
            setSecurityStatus('safe'); // Fallback to safe if linter fails, or maybe 'unknown'?
        }
    };

    const timer = setTimeout(checkIssues, 2500);
    return () => clearTimeout(timer);
  }, [tabBlocks]);

  // --- Handlers: Workspace ---
  const handleUpdateBlock = (tabId: string, blockId: string, content: string) => {
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].map(b => b.id === blockId ? { ...b, content } : b)
      }));
  };

  const handleUpdateBlockType = (tabId: string, blockId: string, type: BlockType) => {
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].map(b => b.id === blockId ? { ...b, type } : b)
      }));
  };

  const handleUpdateBlockTitle = (tabId: string, blockId: string, title: string) => {
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].map(b => b.id === blockId ? { ...b, title } : b)
      }));
  };

  const handleUpdateBlockHeight = (tabId: string, blockId: string, height: number) => {
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].map(b => b.id === blockId ? { ...b, height } : b)
      }));
  };

  const handleMaximizeBlock = (tabId: string, blockId: string) => {
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].map(b => b.id === blockId ? { ...b, isMaximized: !b.isMaximized } : b)
      }));
  };

  const handleAddBlock = (tabId: string) => {
      const newBlock: CodeBlockType = {
          id: `b${Date.now()}`,
          type: 'js',
          title: 'module.js',
          content: '// New Module',
          isMaximized: false,
          isVisible: true,
          height: 400
      };
      setTabBlocks(prev => ({
          ...prev,
          [tabId]: [...prev[tabId], newBlock]
      }));
  };

  const handleAddCapability = (cap: { title: string; content: string; filename: string; blockType: string }) => {
      const newBlock: CodeBlockType = {
          id: `cap-${Date.now()}`,
          type: cap.blockType as BlockType,
          title: cap.filename,
          content: cap.content,
          isMaximized: false,
          isVisible: true,
          height: 400
      };
      setTabBlocks(prev => ({
          ...prev,
          codebase: [...prev.codebase, newBlock]
      }));
      setLastAction({ message: `Integrated capability: ${cap.title}`, type: 'success' });
      setIsLibManagerOpen(false);
      setActiveTabId('codebase');
  };

  const handleIntentSubmit = async (intent: string) => {
      setIsIntentDialogOpen(false);
      setIsAiTyping(true);
      try {
          const res = await GeminiService.scaffoldModuleByIntent(intent);
          const newBlock: CodeBlockType = {
              id: `intent-${Date.now()}`,
              type: res.type as BlockType,
              title: res.title,
              content: res.content,
              isMaximized: false,
              isVisible: true,
              height: 400
          };
          setTabBlocks(prev => ({
              ...prev,
              codebase: [...prev.codebase, newBlock]
          }));
          setLastAction({ message: `Scaffolded new module: ${res.title}`, type: 'info' });
      } catch (e) {
          handleLog({
              message: "Failed to scaffold module from intent.",
              type: 'error',
              timestamp: Date.now(),
              fileName: 'AI Service'
          });
      } finally {
          setIsAiTyping(false);
      }
  };

  const handleRemoveBlock = (tabId: string, blockId: string) => {
       setTabBlocks(prev => ({
          ...prev,
          [tabId]: prev[tabId].filter(b => b.id !== blockId)
      }));
  };

  // --- NEW: Deep Remediation Handler (Refactored to Chat) ---
  const handleDeepRemediation = async (blockId: string) => {
      const allBlocks = getAllBlocks();
      const targetBlock = allBlocks.find(b => b.id === blockId);
      if (!targetBlock) return;

      const blockIssues = issues[blockId];
      if (!blockIssues || blockIssues.length === 0) return;

      setSidebarMode('chat');
      setIsSidebarOpen(true);

      const msgId = Date.now().toString();
      const targetTitle = targetBlock.title;
      
      setMessages(prev => [
          ...prev, 
          { 
              id: msgId, 
              role: 'model', 
              content: '',
              isRemediationLoading: true, 
              remediationTarget: targetTitle 
          }
      ]);

      try {
          const result = await GeminiService.performDeepRemediation(blockId, blockIssues, allBlocks);
          
          setMessages(prev => prev.map(m => 
              m.id === msgId 
              ? { 
                  ...m, 
                  isRemediationLoading: false, 
                  remediation: result, 
                  content: "I have completed the deep remediation scan. Review the plan below." 
                } 
              : m
          ));
      } catch (error) {
          console.error("Remediation failed", error);
          setMessages(prev => prev.map(m => 
              m.id === msgId 
              ? { 
                  ...m, 
                  isRemediationLoading: false, 
                  content: "Failed to perform deep remediation scan. Please try again." 
                } 
              : m
          ));
      }
  };

  const applyRemediation = (remediationResult: RemediationResult) => {
      if (!remediationResult) return;

      setTabBlocks(prev => {
          const newCodebase = [...prev.codebase];

          remediationResult.changes.forEach(change => {
             let idx = newCodebase.findIndex(b => b.id === change.blockId);
             if (idx === -1) {
                 idx = newCodebase.findIndex(b => b.title === change.title);
             }
             if (idx !== -1) {
                 newCodebase[idx] = { ...newCodebase[idx], content: change.content };
             }
          });

          return { ...prev, codebase: newCodebase };
      });

      setIssues(prev => {
          const next = { ...prev };
          remediationResult.changes.forEach(c => delete next[c.blockId]);
          return next;
      });

      setRunTrigger(p => p + 1);
      
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          content: `✅ Successfully applied holistic fix to ${remediationResult.impactedFiles.length} files.`
      }]);
  };

  const applyAiResponse = (response: any) => {
     setTabBlocks(prev => {
         const newCodebase = [...prev.codebase];
         const updateOrAppend = (type: BlockType, content: string) => {
             const idx = newCodebase.findIndex(b => b.type === type);
             if (idx >= 0) {
                 newCodebase[idx] = { ...newCodebase[idx], content: content };
             } else {
                 newCodebase.push({
                     id: `gen-${Date.now()}-${type}`,
                     type,
                     title: `generated.${type === 'js' ? 'js' : type}`,
                     content,
                     isMaximized: false,
                     isVisible: true
                 });
             }
         };

         if (response.html) updateOrAppend('html', response.html);
         if (response.css) updateOrAppend('css', response.css);
         if (response.js) updateOrAppend('js', response.js);

         return { ...prev, codebase: newCodebase };
     });
     setRunTrigger(p => p + 1);
  };

  const handleAiGenerate = async (prompt: string, images?: string[]) => {
    setIsAiTyping(true);
    const fullPrompt = pendingContext ? `${prompt}\n\n[Visual Context]: ${pendingContext}` : prompt;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: fullPrompt, images };
    setMessages(prev => [...prev, userMsg]);
    setPendingContext('');

    try {
        const files = compiledFiles;
        const response = await GeminiService.generateCode(fullPrompt, files, 'generate', images);
        applyAiResponse(response);

        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: response.explanation };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "Error generating code." }]);
    } finally {
        setIsAiTyping(false);
        setPendingImages([]);
    }
  };

  const handleFixCode = async () => {
    const errorLogs = logs.filter(l => l.type === 'error');
    if (errorLogs.length === 0) return;
    
    const uniqueErrors = Array.from(new Set(errorLogs.map(l => l.message))).slice(-3);
    const errorContext = uniqueErrors.join('\n');
    
    setIsAiTyping(true);
    try {
        const response = await GeminiService.analyzeError(errorContext, compiledFiles);
        applyAiResponse(response);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: response.explanation }]);
    } finally {
        setIsAiTyping(false);
    }
  };

  const handleChatMessage = async (msg: string, images?: string[]) => {
      setIsAiTyping(true);
      const fullMessage = pendingContext ? `${msg}\n\n[Visual Context]: ${pendingContext}` : msg;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: fullMessage, images }]);
      setPendingContext('');
      
      try {
          const apiHistory = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }, ...(m.images?.map(img => ({ inlineData: { data: img.replace(/^data:image\/\w+;base64,/, ""), mimeType: "image/png" } })) || [])]
          })).filter(m => m.role !== 'system');

          const stream = await GeminiService.chatWithContext(apiHistory, fullMessage, compiledFiles, images);
          let fullRes = '';
          const aiId = (Date.now()+1).toString();
          setMessages(p => [...p, { id: aiId, role: 'model', content: '' }]);
          
          for await (const chunk of stream) {
              if (chunk.text) {
                  fullRes += chunk.text;
                  setMessages(p => p.map(m => m.id === aiId ? { ...m, content: fullRes } : m));
              }
          }
      } catch (e) {
          setMessages(p => [...p, { id: Date.now().toString(), role: 'model', content: "Connection error." }]);
      } finally {
          setIsAiTyping(false);
          setPendingImages([]);
      }
  };

  const applyFileOperations = (ops: FileOperation[]) => {
    setTabBlocks(prev => {
        let newCodebase = [...prev.codebase];
        ops.forEach(op => {
            if (op.action === 'create' || op.action === 'update') {
                const existingIdx = newCodebase.findIndex(b => b.title === op.path);
                const detectType = (path: string): BlockType => {
                    if (path.endsWith('.html')) return 'html';
                    if (path.endsWith('.css')) return 'css';
                    if (path.endsWith('.json')) return 'json';
                    if (path.endsWith('.py')) return 'python';
                    if (path.endsWith('.sql')) return 'sql';
                    return 'js';
                };

                if (existingIdx >= 0) {
                    newCodebase[existingIdx] = { 
                        ...newCodebase[existingIdx], 
                        content: op.content || newCodebase[existingIdx].content 
                    };
                } else {
                    newCodebase.push({
                        id: `agent-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        type: detectType(op.path),
                        title: op.path,
                        content: op.content || '',
                        isMaximized: false,
                        isVisible: true,
                        height: 300
                    });
                }
            } else if (op.action === 'delete') {
                newCodebase = newCodebase.filter(b => b.title !== op.path);
            }
        });
        return { ...prev, codebase: newCodebase };
    });
    setRunTrigger(p => p + 1);
  };

  const executeAgentTaskLoop = async (task: AgentTask, allBlocks: CodeBlockType[]) => {
      setAgentLogs(prev => [...prev, {
          id: Date.now().toString(),
          stage: 'code',
          message: `Executing Task: ${task.label}`,
          timestamp: Date.now()
      }]);

      try {
          const result = await GeminiService.executeAgentTask(task, allBlocks, agentPlan?.overview || '');
          
          setAgentLogs(prev => [...prev, {
              id: Date.now().toString(),
              stage: 'code',
              message: `Task Execution Finished. Applying ${result.file_operations.length} file operations.`,
              thoughtProcess: result.thought_process,
              timestamp: Date.now()
          }]);

          applyFileOperations(result.file_operations);
          
          setAgentPlan(prev => ({
              ...prev!,
              tasks: prev!.tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t)
          }));
      } catch (error) {
           setAgentLogs(prev => [...prev, {
              id: Date.now().toString(),
              stage: 'code',
              message: `Task Failed: ${error}`,
              timestamp: Date.now()
          }]);
          
          setAgentPlan(prev => ({
              ...prev!,
              tasks: prev!.tasks.map(t => t.id === task.id ? { ...t, status: 'failed' } : t)
          }));
          setAgentState(AgentState.FAILED);
      }
  };

  useEffect(() => {
    if (agentState === AgentState.EXECUTING && agentPlan) {
        const nextTask = agentPlan.tasks.find(t => t.status === 'pending');
        if (nextTask) {
             setAgentPlan(prev => ({
                 ...prev!,
                 tasks: prev!.tasks.map(t => t.id === nextTask.id ? { ...t, status: 'running' } : t)
             }));
             executeAgentTaskLoop(nextTask, tabBlocks.codebase);
        } else {
            const hasFailures = agentPlan.tasks.some(t => t.status === 'failed');
            if (!hasFailures) {
                setAgentState(AgentState.COMPLETED);
                setAgentLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    stage: 'review',
                    message: `All tasks completed successfully.`,
                    timestamp: Date.now()
                }]);
            }
        }
    }
  }, [agentState, agentPlan]);

  const handleStartAgent = async (prompt: string) => {
    setSidebarMode('agent');
    setIsSidebarOpen(true);
    setAgentState(AgentState.PLANNING);
    setAgentPlan(null); 
    setAgentLogs([]);
    try {
        setAgentLogs(p => [...p, { id: Date.now().toString(), stage: 'plan', message: 'Analyzing Requirements & Generating Blueprint...', timestamp: Date.now() }]);
        const plan = await GeminiService.createAgentPlan(prompt, compiledFiles);
        setAgentPlan(plan);
        setAgentState(AgentState.REVIEW_PLAN);
    } catch (e) {
        setAgentState(AgentState.FAILED);
    }
  };

  // --- Handlers: Other ---
  const handleCaptureImage = (img: string, context?: string) => {
    setPendingImages([img]);
    if (context) setPendingContext(context);
    setIsSidebarOpen(true);
    setSidebarMode('chat');
  };

  const handleExport = () => {
    const files = compiledFiles;
    const zip = new JSZip();
    zip.file("index.html", `<!DOCTYPE html><html><head><style>${files.css}</style></head><body>${files.html}<script>${files.js}</script></body></html>`);
    zip.file("style.css", files.css);
    zip.file("script.js", files.js);
    zip.generateAsync({type:"blob"}).then(c => FileSaver.saveAs(c, "project.zip"));
  };

  // --- Resizing ---
  const handleMainResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = mainContainerRef.current;
    if (!container) return;
    const startX = e.clientX;
    const totalW = container.offsetWidth;
    const startSplit = splitPos;
    const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        setSplitPos(Math.min(Math.max(startSplit + (delta / totalW * 100), 20), 80));
    };
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const handleSidebarResize = (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = sidebarWidth;
      const onMouseMove = (ev: MouseEvent) => {
          setSidebarWidth(Math.max(250, Math.min(600, startW + (startX - ev.clientX))));
      };
      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-[#111] text-white font-sans overflow-hidden">
        <Toolbar 
            onRun={() => {
                if (securityStatus === 'critical') {
                    setActiveTabId('security');
                    return;
                }
                setRunTrigger(p => p + 1);
            }}
            onExport={handleExport}
            onPublish={() => setIsPublishDialogOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onLibraryManager={() => setIsLibManagerOpen(true)}
            isSidebarOpen={isSidebarOpen}
            onReset={() => {
                setTabBlocks({ codebase: DEFAULT_BLOCKS_CODEBASE, logic: [], data: [], security: [] });
                setActiveTabId('codebase');
            }}
            sidebarMode={sidebarMode}
            setSidebarMode={setSidebarMode}
            activeTabId={activeTabId}
            onTabChange={(id) => setActiveTabId(id)}
            isMobile={isMobile}
            mobileView={mobileView}
            setMobileView={setMobileView}
            securityStatus={securityStatus}
            isEli5Mode={isEli5Mode}
            setIsEli5Mode={setIsEli5Mode}
        />
        
        <div className="flex flex-1 overflow-hidden relative" ref={mainContainerRef}>
            
            {/* Split Pane: Workspace (Left) | Preview (Right) */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Workspace Area - Mobile: Show if in editor mode. Desktop: Show based on splitPos */}
                <div 
                    style={{ width: isMobile ? '100%' : `${splitPos}%`, display: (isMobile && mobileView !== 'editor') ? 'none' : 'flex' }} 
                    className="flex flex-col min-w-[300px] border-r border-[#333] relative h-full"
                >
                    {activeTabId === 'data' ? (
                        <DataStudio onSchemaReady={(data) => {
                            setInjectedData(data);
                            setRunTrigger(p => p + 1); 
                        }} />
                    ) : activeTabId === 'security' ? (
                        <SecurityPanel 
                            files={compiledFiles} 
                            status={securityStatus}
                            externalIssues={Object.values(issues).flat()}
                            isEli5Mode={isEli5Mode}
                        />
                    ) : activeTabId === 'logic' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#09090b]">
                            <div className="p-6 bg-[#18181b] rounded-2xl border border-[#333] shadow-2xl">
                                <Construction className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                                <h2 className="text-2xl font-bold text-white mb-2">Logic Layer Under Construction</h2>
                                <p className="text-gray-400 max-w-sm">
                                    The Logic workspace is being re-architected to support visual node-based programming.
                                    <br/><br/>
                                    All Javascript modules are now available in the <strong>Codebase</strong> tab.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Workspace 
                            activeTab={{ id: activeTabId, label: activeTabId, blocks: tabBlocks[activeTabId] }}
                            onUpdateBlock={(bid, c) => handleUpdateBlock(activeTabId, bid, c)}
                            onUpdateBlockType={(bid, t) => handleUpdateBlockType(activeTabId, bid, t)}
                            onUpdateBlockTitle={(bid, t) => handleUpdateBlockTitle(activeTabId, bid, t)}
                            onUpdateBlockHeight={(bid, h) => handleUpdateBlockHeight(activeTabId, bid, h)}
                            onMaximizeBlock={(bid) => handleMaximizeBlock(activeTabId, bid)}
                            onAddBlock={() => setIsIntentDialogOpen(true)}
                            onRemoveBlock={(bid) => handleRemoveBlock(activeTabId, bid)}
                            issues={issues}
                            onFixBlockIssues={handleDeepRemediation}
                        />
                    )}
                </div>

                {/* Resizer - Hide on Mobile */}
                {!isMobile && (
                    <div 
                        className="w-1.5 hover:w-2 bg-[#222] hover:bg-blue-500 cursor-col-resize z-20 transition-colors flex flex-col justify-center items-center shrink-0"
                        onMouseDown={handleMainResize}
                    >
                         <div className="h-8 w-[2px] bg-gray-600 rounded-full opacity-50" />
                    </div>
                )}

                {/* Preview Area - Mobile: Show if in preview mode. Desktop: Flex grow */}
                <div 
                    className="flex-1 flex flex-col min-w-[300px] bg-[#0a0a0a]"
                    style={{ display: (isMobile && mobileView !== 'preview') ? 'none' : 'flex' }}
                >
                    <div className="flex-1 relative">
                        <Preview 
                            files={compiledFiles}
                            libraries={activeLibraries}
                            onLog={handleLog}
                            autoRun={false}
                            runTrigger={runTrigger}
                            onCaptureImage={handleCaptureImage}
                            injectedData={injectedData}
                            securityStatus={securityStatus}
                            onFixSecurity={() => setActiveTabId('security')}
                        />
                    </div>
                    <Console 
                        logs={logs}
                        isOpen={isConsoleOpen}
                        onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
                        onClear={() => setLogs([])}
                    />
                </div>
            </div>

            {/* Sidebar - Desktop: Standard Flex. Mobile: Overlay */}
            <div 
                className={`
                    ${isMobile ? 'absolute inset-0 z-50 bg-[#18181b]/95 backdrop-blur-sm transition-transform duration-300' : 'relative z-30'}
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full hidden'}
                `} 
                style={!isMobile ? { width: sidebarWidth } : {}}
            >
                 <div className="h-full bg-[#18181b] flex w-full md:w-auto relative border-l border-[#333]">
                    {!isMobile && (
                        <div className="w-1.5 h-full cursor-col-resize bg-[#222] hover:bg-blue-500 absolute left-0 top-0 z-40" onMouseDown={handleSidebarResize} />
                    )}
                    
                    <div className="flex-1 h-full flex flex-col">
                        {/* Mobile Sidebar Close Button */}
                        {isMobile && (
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute top-2 right-2 p-2 bg-[#333] rounded-full text-gray-400 hover:text-white z-50"
                            >
                                <Construction size={16} className="rotate-45" /> {/* Simulating X */}
                            </button>
                        )}
                        
                        <div className="flex-1 overflow-hidden">
                            {sidebarMode === 'chat' ? (
                                <ChatInterface 
                                    messages={messages} 
                                    onSendMessage={handleChatMessage}
                                    isTyping={isAiTyping}
                                    onFixCode={handleFixCode}
                                    onGenerate={handleAiGenerate}
                                    pendingImages={pendingImages}
                                    onClearImages={() => { setPendingImages([]); setPendingContext(''); }}
                                    onStartAgent={handleStartAgent}
                                    onApplyRemediation={applyRemediation}
                                />
                            ) : (
                                <AgentWorkspace 
                                    state={agentState}
                                    plan={agentPlan}
                                    logs={agentLogs}
                                    onApprovePlan={() => setAgentState(AgentState.EXECUTING)}
                                    onCancel={() => { setAgentState(AgentState.IDLE); setAgentPlan(null); }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <LibraryManager 
            isOpen={isLibManagerOpen}
            onClose={() => setIsLibManagerOpen(false)}
            activeLibraries={activeLibraries}
            onAddLibrary={(l) => setActiveLibraries(p => [...p, l])}
            onRemoveLibrary={(l) => setActiveLibraries(p => p.filter(x => x.url !== l.url))}
            onAddCapability={handleAddCapability}
        />

        <IntentDialog 
            isOpen={isIntentDialogOpen}
            onClose={() => setIsIntentDialogOpen(false)}
            onSubmit={handleIntentSubmit}
        />

        <PublishDialog 
            isOpen={isPublishDialogOpen}
            onClose={() => setIsPublishDialogOpen(false)}
            isEli5Mode={isEli5Mode}
            onShare={() => {
                setLastAction({ message: "Share URL copied to Project Locker!", type: 'success' });
            }}
        />

        {/* Global Notification Toast */}
        {lastAction && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
                <div className={`mx-4 p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 ${lastAction.type === 'success' ? 'bg-green-600 border-green-500' : 'bg-blue-600 border-blue-500'}`}>
                    <div className="flex items-center gap-3">
                         <div className="bg-white/20 p-1.5 rounded-lg">
                            <Shield size={16} className="text-white" />
                         </div>
                         <p className="text-sm font-bold text-white">{lastAction.message}</p>
                    </div>
                    <button onClick={() => setLastAction(null)} className="text-white/60 hover:text-white">
                        <Construction size={16} className="rotate-45" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
