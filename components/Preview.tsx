
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EditorFiles, ExternalLibrary, LogEntry, SecurityStatus } from '../types';
import { Smartphone, Monitor, Tablet, RefreshCw, Eye, ShieldAlert, Lock } from 'lucide-react';
import VisualInspector from './VisualInspector';

interface PreviewProps {
  files: EditorFiles;
  libraries: ExternalLibrary[];
  onLog: (log: Omit<LogEntry, 'id' | 'count'>) => void;
  autoRun: boolean;
  runTrigger: number;
  onCaptureImage: (img: string, context?: string) => void;
  injectedData: any[];
  securityStatus: SecurityStatus;
  onFixSecurity: () => void;
}

const Preview: React.FC<PreviewProps> = ({ 
    files, 
    libraries, 
    onLog, 
    autoRun, 
    runTrigger, 
    onCaptureImage, 
    injectedData,
    securityStatus,
    onFixSecurity
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  
  const isBlocked = securityStatus === 'critical';
  
  // Memoize the mapping logic to locate which block a line number belongs to
  const resolveSourceLocation = (scriptLine: number) => {
      // files.js contains: "/* [BLOCK: filename] */\n content..."
      const lines = files.js.split('\n');
      let currentFile = 'unknown script';
      let blockStartLine = 0;

      // Scan up to the error line to find the last block header
      for (let i = 0; i < Math.min(scriptLine, lines.length); i++) {
          const match = lines[i].match(/\/\* \[BLOCK: (.+)\] \*\//);
          if (match) {
              currentFile = match[1];
              blockStartLine = i;
          }
      }

      // Local line is relative to the block start. 
      // Subtract 1 for the header line itself? Yes.
      // E.g. Header at 0. Code at 1. Error at 1.
      // scriptLine (1) - blockStartLine (0) = 1.
      return { 
          fileName: currentFile, 
          lineNumber: Math.max(1, scriptLine - blockStartLine) 
      };
  };

  const generateSrcDoc = () => {
    // 1. Basic Validation
    if (!files.html.trim() && !files.js.trim()) {
        return {
            src: '<!DOCTYPE html><html><body style="background:#fff;display:flex;justify-content:center;align-items:center;height:100vh;color:#888;font-family:sans-serif;">No code to run</body></html>',
            offset: 0
        };
    }

    const libTags = libraries.map(lib => {
        if (lib.type === 'script') return `<script src="${lib.url}" crossorigin="anonymous"></script>`;
        return `<link rel="stylesheet" href="${lib.url}" crossorigin="anonymous" />`;
    }).join('\n');

    const dataScript = injectedData.length > 0 ? `<script>window.DB_DATA = ${JSON.stringify(injectedData)};</script>` : '';

    // INTELLIGENT RUNTIME: Detect modules
    // If we see export/import, we MUST use type="module".
    // CRITICAL: We MUST NOT wrap modules in try/catch, as imports/exports must be top-level.
    const isModule = /\b(import|export)\b/.test(files.js);
    const scriptType = isModule ? 'type="module"' : '';

    // Calculate line offset for error reporting
    // We construct the head part separately to count its lines accurately.
    const htmlPreScript = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${libTags}
    <style>
      ${files.css}
    </style>
    ${dataScript}
    <script>
      (function() {
        const oldLog = console.log;
        const oldError = console.error;
        const oldWarn = console.warn;
        const oldInfo = console.info;

        function formatArgs(args) {
            return args.map(arg => {
                if (arg instanceof Error) return arg.message + (arg.stack ? '\\n' + arg.stack : '');
                if (typeof arg === 'object') {
                    try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                }
                return String(arg);
            }).join(' ');
        }

        function send(type, message, stack, line, col) {
           try {
              if (message.includes('ResizeObserver') || 
                  message.includes('Script error.') || 
                  message.includes('chrome-extension://')) return;

              window.parent.postMessage({ 
                  type: 'console', 
                  level: type, 
                  message: message, 
                  stack: stack,
                  line: line,
                  col: col,
                  timestamp: Date.now() 
              }, '*');
           } catch(e) {}
        }

        console.log = function(...args) { oldLog.apply(console, args); send('log', formatArgs(args)); };
        console.error = function(...args) { 
            oldError.apply(console, args); 
            // Try to extract stack from arguments if possible
            const err = args.find(a => a instanceof Error);
            send('error', formatArgs(args), err ? err.stack : null); 
        };
        console.warn = function(...args) { oldWarn.apply(console, args); send('warn', formatArgs(args)); };
        console.info = function(...args) { oldInfo.apply(console, args); send('info', formatArgs(args)); };
        
        window.onerror = function(msg, url, line, col, error) {
           // We pass the raw line number. The parent (Preview.tsx) knows the offset to subtract.
           send('error', msg, error ? error.stack : null, line, col);
           return false;
        };
        
        window.onunhandledrejection = function(event) {
           send('error', 'Unhandled Promise Rejection: ' + event.reason);
        };
      })();
    </script>
  </head>
  <body style="background-color: white;">
    ${files.html}
    <!-- User Script Start -->
    <script ${scriptType}>`;

    const htmlPostScript = `    </script>
  </body>
</html>`;

    const preambleLines = htmlPreScript.split('\n').length;

    return {
        src: `${htmlPreScript}\n${files.js}\n${htmlPostScript}`,
        offset: preambleLines
    };
  };

  // Keep track of the current offset to decode messages
  const [currentOffset, setCurrentOffset] = useState(0);

  // EFFECT 1: Handle Iframe Content Injection
  // We ONLY regenerate the srcdoc when the FILES change or run trigger hits.
  // We explicitly EXCLUDE 'onLog' from this dependency array to prevent the infinite loop.
  useEffect(() => {
    if (autoRun || runTrigger > 0) {
      const { src, offset } = generateSrcDoc();
      setCurrentOffset(offset);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = src;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, libraries, runTrigger, autoRun, injectedData]); // <-- NO onLog here!

  // EFFECT 2: Handle Message Listening
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        const { level, message, stack, line, timestamp } = event.data;
        
        let fileName = undefined;
        let lineNumber = undefined;

        // If we have a line number from window.onerror
        if (typeof line === 'number') {
            const scriptLine = line - currentOffset;
            const loc = resolveSourceLocation(scriptLine);
            fileName = loc.fileName;
            lineNumber = loc.lineNumber;
        } 
        // Fallback: Try to parse stack trace for line numbers if standard error
        else if (stack) {
            // Regex to find "about:srcdoc:LINE:COL"
            const match = stack.match(/about:srcdoc:(\d+):(\d+)/);
            if (match) {
                const rawLine = parseInt(match[1], 10);
                const scriptLine = rawLine - currentOffset;
                const loc = resolveSourceLocation(scriptLine);
                fileName = loc.fileName;
                lineNumber = loc.lineNumber;
            }
        }

        // Final Filter
        if (typeof message === 'string') {
            if (message.includes('ResizeObserver')) return;
            if (message.includes('[HMR]')) return; 
        }

        onLog({
            type: level,
            message: message,
            timestamp: timestamp,
            stack: stack,
            fileName: fileName,
            lineNumber: lineNumber
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLog, currentOffset, files.js]); 

  const getWidth = () => {
    switch(viewportSize) {
        case 'mobile': return '375px';
        case 'tablet': return '768px';
        default: return '100%';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-300">Preview</span>
            <div className="h-4 w-[1px] bg-gray-600 mx-2"></div>
            <button 
                onClick={() => setViewportSize('mobile')}
                className={`p-1.5 rounded hover:bg-[#333] transition-colors ${viewportSize === 'mobile' ? 'bg-[#333] text-blue-400' : 'text-gray-400'}`}
                title="Mobile View"
            >
                <Smartphone size={16} />
            </button>
            <button 
                onClick={() => setViewportSize('tablet')}
                className={`p-1.5 rounded hover:bg-[#333] transition-colors ${viewportSize === 'tablet' ? 'bg-[#333] text-blue-400' : 'text-gray-400'}`}
                title="Tablet View"
            >
                <Tablet size={16} />
            </button>
             <button 
                onClick={() => setViewportSize('desktop')}
                className={`p-1.5 rounded hover:bg-[#333] transition-colors ${viewportSize === 'desktop' ? 'bg-[#333] text-blue-400' : 'text-gray-400'}`}
                title="Desktop View"
            >
                <Monitor size={16} />
            </button>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={() => setIsInspectorActive(!isInspectorActive)}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-colors ${isInspectorActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-[#333] text-gray-300 hover:text-white'}`}
                title="Visual Inspector & Annotation"
            >
                <Eye size={14} />
                <span>Visual Inspector</span>
            </button>

            <button 
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
                onClick={() => {
                    if (iframeRef.current) {
                        const { src } = generateSrcDoc();
                        iframeRef.current.srcdoc = src;
                    }
                }}
                title="Reload Preview"
            >
                <RefreshCw size={16} />
            </button>
        </div>
      </div>
      
      <div className="flex-1 bg-[#0a0a0a] relative flex justify-center overflow-hidden">
        <div className="relative h-full transition-all duration-300 ease-in-out bg-white" style={{ width: getWidth(), borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
            <iframe
                ref={iframeRef}
                title="Live Preview"
                className={`w-full h-full border-none bg-white ${isBlocked ? 'blur-sm grayscale pointer-events-none' : ''}`}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            />
            
            {isBlocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50">
                    <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                        <Lock className="text-red-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Preview Safety Lock Engaged</h3>
                    <p className="text-gray-300 max-w-sm mb-8">
                        We detected a potential security hazard (a "Seat Belt" violation) in your code. To keep your app safe, the preview has been paused.
                    </p>
                    <button 
                        onClick={onFixSecurity}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-red-900/40 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <ShieldAlert size={20} />
                        Review & Fix Security Hazard
                    </button>
                    <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">
                         Safety Guardrails Active
                    </p>
                </div>
            )}
            {/* Visual Inspector Overlay */}
            <VisualInspector 
                isActive={isInspectorActive} 
                onClose={() => setIsInspectorActive(false)} 
                iframeRef={iframeRef}
                onCapture={onCaptureImage}
            />
        </div>
      </div>
    </div>
  );
};

export default Preview;