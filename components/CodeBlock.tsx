
import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Maximize2, Minimize2, Code2, FileJson, Database, FileCode, Trash, FileType, AlertCircle, Wand2, GripHorizontal, Sparkles, Keyboard } from 'lucide-react';
import { BlockType, CodeBlock as CodeBlockType, CodeIssue } from '../types';

interface CodeBlockProps {
  block: CodeBlockType;
  onChange: (value: string | undefined) => void;
  onMaximize: () => void;
  onRemove: () => void;
  onTypeChange: (type: BlockType) => void;
  onTitleChange: (title: string) => void;
  issues?: CodeIssue[];
  isActive?: boolean;
  onFocus?: () => void;
  onHeightChange?: (height: number) => void;
  onFixIssues?: () => void;
}

// Quick Keys for Mobile Coding
const QUICK_KEYS = ['{', '}', '(', ')', '[', ']', '<', '>', '=', '=>', ';', '"', "'", '`', '!', '$'];

const CodeBlock: React.FC<CodeBlockProps> = ({ 
    block, 
    onChange, 
    onMaximize, 
    onRemove, 
    onTypeChange, 
    onTitleChange, 
    issues = [], 
    isActive = false, 
    onFocus,
    onHeightChange,
    onFixIssues
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [detectedType, setDetectedType] = useState<BlockType>(block.type);
  const [isMobile, setIsMobile] = useState(false);
  
  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(block.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync temp title if prop changes
  useEffect(() => {
    setTempTitle(block.title);
  }, [block.title]);

  useEffect(() => {
      if (isEditingTitle && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
      }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
      setIsEditingTitle(false);
      if (tempTitle.trim()) {
          onTitleChange(tempTitle);
      } else {
          setTempTitle(block.title);
      }
  };

  const handleAutoName = (e: React.MouseEvent) => {
      e.stopPropagation();
      let name = 'untitled';
      // Use detected type for better accuracy
      const typeToName = detectedType || block.type;
      const timestamp = new Date().getSeconds();
      
      switch(typeToName) {
          case 'html': name = `component-${timestamp}.html`; break;
          case 'css': name = `style-${timestamp}.css`; break;
          case 'js': name = `script-${timestamp}.js`; break;
          case 'json': name = `data-${timestamp}.json`; break;
          case 'python': name = `main.py`; break;
          case 'sql': name = `query.sql`; break;
      }
      
      // If it's the main files, try to stick to standard names
      if (block.content.includes('<!DOCTYPE html>')) name = 'index.html';
      else if (block.content.includes('body {')) name = 'style.css';
      else if (block.content.includes('document.getElementById')) name = 'script.js';

      onTitleChange(name);
      setTempTitle(name);
  };

  const insertText = (text: string) => {
      const editor = editorRef.current;
      if (editor) {
          const selection = editor.getSelection();
          const id = { major: 1, minor: 1 };
          const op = { range: selection, text: text, forceMoveMarkers: true };
          editor.executeEdits("my-source", [op]);
          editor.focus();
      }
  };

  // Advanced Language Detection Logic
  useEffect(() => {
    const detectLanguage = (content: string): BlockType | null => {
      const code = content.trim();
      if (!code) return null;

      // 1. HTML Signals
      const hasDocType = /^\s*<!DOCTYPE\s+html/i.test(code);
      const htmlTagsCount = (code.match(/<\/?(html|head|body|div|span|p|h[1-6]|ul|li|table|tr|td|form|input|button|a|img|script|style|header|footer|nav|section|article|main|aside)\b/gi) || []).length;
      const startsWithTag = /^\s*<[a-z]+/.test(code);
      
      // 2. CSS Signals
      const cssBlockCount = (code.match(/[^{}]+{[^{}]*:[^{}]*;[^{}]*}/g) || []).length;
      const cssKeywords = (code.match(/@media|@import|@keyframes|:root|!important/g) || []).length;

      // 3. JS Signals
      const jsKeywords = (code.match(/\b(const|let|var|function|return|import|export|default|class|extends|if|else|switch|case|break|for|while|try|catch|async|await|new|this|typeof|instanceof)\b/g) || []).length;
      const jsSymbols = (code.match(/=>|\$\{|===|!==|\+\+|--|\)\s*\{/g) || []).length;
      const jsDom = (code.match(/document\.|window\.|console\.|localStorage\.|fetch\(/g) || []).length;

      // Scoring
      let htmlScore = (htmlTagsCount * 2) + (hasDocType ? 50 : 0) + (startsWithTag ? 10 : 0);
      let cssScore = (cssBlockCount * 5) + (cssKeywords * 5);
      let jsScore = jsKeywords + (jsSymbols * 2) + (jsDom * 3);

      // JSON Check
      if (code.startsWith('{') && code.endsWith('}')) {
          try {
              JSON.parse(code);
              return 'json';
          } catch (e) { /* Not valid JSON */ }
      }

      // Decision with Confidence Thresholds
      if (htmlScore > 5 && htmlScore > cssScore && htmlScore > jsScore) return 'html';
      if (cssScore > 0 && cssScore > jsScore && cssScore > htmlScore) return 'css';
      if (jsScore > 0 && jsScore > htmlScore && jsScore > cssScore) return 'js';
      
      // Fallbacks
      if (/^\s*<[a-z]+/.test(code)) return 'html';
      if (/^\s*(\.|#)[a-z0-9_-]+\s*\{/i.test(code)) return 'css';
      if (/^\s*(import|export|const|let|var|function|console\.)/.test(code)) return 'js';

      return null;
    };

    // Debounce detection
    const timer = setTimeout(() => {
        const detected = detectLanguage(block.content);
        if (detected && detected !== block.type) {
            onTypeChange(detected);
            setDetectedType(detected);
        } else if (detected) {
            setDetectedType(detected);
        }
    }, 800);

    return () => clearTimeout(timer);
  }, [block.content, block.type, onTypeChange, block.title]);

  // Apply Markers (Diagnostics)
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
        const monaco = monacoRef.current;
        const editor = editorRef.current;
        const model = editor.getModel();

        if (model) {
            const markers = issues.map(issue => ({
                startLineNumber: issue.line,
                startColumn: 1,
                endLineNumber: issue.line,
                endColumn: 1000,
                message: issue.message,
                severity: issue.severity === 'error' ? monaco.MarkerSeverity.Error : 
                          issue.severity === 'warning' ? monaco.MarkerSeverity.Warning : 
                          monaco.MarkerSeverity.Info
            }));
            monaco.editor.setModelMarkers(model, 'owner', markers);
        }
    }
  }, [issues]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidFocusEditorText(() => {
        onFocus?.();
    });
  };
  
  const getIcon = (type: BlockType) => {
    switch(type) {
        case 'html': return <Code2 size={16} />;
        case 'css': return <FileType size={16} />;
        case 'js': return <FileCode size={16} />;
        case 'python': return <Code2 size={16} />;
        case 'sql': return <Database size={16} />;
        case 'json': return <FileJson size={16} />;
        default: return <Code2 size={16} />;
    }
  };

  const languageMap: Record<BlockType, string> = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      python: 'python',
      sql: 'sql',
      json: 'json'
  };

  // Resize Handler
  const handleResizeStart = (e: React.MouseEvent) => {
    if (block.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    
    const startY = e.clientY;
    const startH = block.height || 200; // Default height

    const handleMouseMove = (ev: MouseEvent) => {
        // Minimum 200px
        const newH = Math.max(200, startH + (ev.clientY - startY));
        onHeightChange?.(newH);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'ns-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Styling based on state
  const borderClass = isActive 
    ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] z-10' 
    : issues.some(i => i.severity === 'error') ? 'border-red-500/50' : 'border-[#333] hover:border-[#444]';
    
  // Explicitly control height
  // If maximized: fixed position handles height.
  // If not maximized: explicit inline height.
  const containerStyle = block.isMaximized 
    ? { zIndex: 50 } 
    : { height: `${block.height || 200}px` };

  return (
    <div 
        className={`flex flex-col rounded-lg border bg-[#1e1e1e] overflow-hidden ${block.isMaximized ? 'fixed inset-4 shadow-2xl' : 'relative'} ${borderClass}`}
        style={containerStyle}
        onClick={onFocus}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b select-none transition-colors ${isActive ? 'bg-[#202022] border-blue-500/20' : 'bg-[#1e1e1e] border-[#333]'}`}>
        
        {/* Left Section: Identity */}
        <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className={`p-1 rounded ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400'}`}>
                {getIcon(block.type)}
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
                 {/* Editable Title */}
                {isEditingTitle ? (
                    <input 
                        ref={inputRef}
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                        className="bg-[#111] text-sm font-medium text-white border border-blue-500 rounded px-2 py-0.5 outline-none min-w-[80px] w-full"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span 
                        className="text-sm font-semibold text-gray-200 cursor-text hover:text-white truncate max-w-[120px] md:max-w-[180px]"
                        onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                        title="Click to rename"
                    >
                        {block.title}
                    </span>
                )}
            </div>

            {/* Badges Group */}
            <div className="flex items-center gap-2 hidden xs:flex">
                {/* Language Badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider shadow-sm ${
                    block.type === 'html' ? 'bg-[#e34c26]' :
                    block.type === 'css' ? 'bg-[#264de4]' :
                    block.type === 'js' ? 'bg-[#f0db4f] text-black' :
                    block.type === 'json' ? 'bg-gray-600' : 
                    block.type === 'sql' ? 'bg-purple-600' : 'bg-green-600'
                }`}>
                    {block.type}
                </span>

                {/* Issues Badge (Interactive) */}
                {issues.length > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onFixIssues?.(); }}
                        className="group flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold shadow-sm animate-pulse hover:animate-none hover:bg-red-500 hover:scale-105 transition-all cursor-pointer"
                        title="Click to Auto-Fix issues with Aether AI"
                    >
                        <AlertCircle size={10} strokeWidth={3} />
                        <span className="hidden sm:inline">{issues.length} Issues</span>
                        <span className="sm:hidden">{issues.length}</span>
                        <Sparkles size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}
            </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1">
             {/* Auto Name Button */}
            <button 
                onClick={handleAutoName}
                className="p-1.5 hover:bg-[#333] rounded-md text-gray-500 hover:text-blue-400 transition-colors hidden sm:block"
                title="Auto-detect filename"
            >
                <Wand2 size={14} />
            </button>
            
            <div className="w-[1px] h-4 bg-[#333] mx-1 hidden sm:block"></div>

            <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="p-1.5 hover:bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors" title={block.isMaximized ? "Minimize" : "Maximize"}>
                {block.isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 hover:bg-[#333] rounded-md text-gray-400 hover:text-red-400 transition-colors" title="Remove Block">
                <Trash size={14} />
            </button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 min-h-[150px] relative group flex flex-col">
         <div className="flex-1 relative">
            <Editor
                height="100%"
                language={languageMap[block.type]}
                value={block.content}
                onChange={onChange}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: !isMobile }, // Disable minimap on mobile
                    scrollBeyondLastLine: false,
                    fontSize: isMobile ? 12 : 13, // Smaller font on mobile
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    padding: { top: 12 },
                    lineNumbers: isMobile ? 'off' : 'on', // Hide line numbers on mobile for space
                    folding: !isMobile,
                    wordWrap: isMobile ? 'on' : 'off', // Enable word wrap on mobile
                    renderLineHighlight: 'all',
                    smoothScrolling: true,
                    bracketPairColorization: { enabled: true },
                    glyphMargin: !isMobile, // Hide glyph margin on mobile
                    automaticLayout: true,
                }}
            />
         </div>
         
         {/* Mobile Quick Keys Toolbar */}
         {isMobile && isActive && (
             <div className="h-10 bg-[#252526] border-t border-[#333] flex items-center gap-2 overflow-x-auto px-2 no-scrollbar">
                 <Keyboard size={14} className="text-gray-500 shrink-0" />
                 {QUICK_KEYS.map(key => (
                     <button 
                        key={key}
                        onClick={(e) => { e.stopPropagation(); insertText(key); }}
                        className="min-w-[30px] h-7 bg-[#333] rounded text-gray-200 text-sm font-mono flex items-center justify-center active:bg-blue-600 active:text-white touch-manipulation"
                     >
                         {key}
                     </button>
                 ))}
             </div>
         )}

         {/* Language Indicator Strip */}
         <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-colors ${
             block.type === 'html' ? 'bg-orange-500' : 
             block.type === 'css' ? 'bg-blue-500' : 
             block.type === 'js' ? 'bg-yellow-500' : 
             block.type === 'sql' ? 'bg-purple-500' : 'bg-gray-500'
         }`}></div>
      </div>

       {/* Resizer Handle */}
       {!block.isMaximized && !isMobile && (
           <div 
               className="absolute bottom-0 left-0 right-0 h-2 bg-transparent hover:bg-blue-500/20 cursor-ns-resize z-20 transition-colors flex items-center justify-center group/resizer"
               onMouseDown={handleResizeStart}
               title="Drag to resize"
           >
                <div className="w-8 h-1 rounded-full bg-gray-700/50 group-hover/resizer:bg-blue-500 opacity-0 group-hover/resizer:opacity-100 transition-all"></div>
           </div>
       )}
    </div>
  );
};

export default CodeBlock;
