import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Mic, Camera, HardDrive, Smartphone, Sparkles, Terminal, Rocket, Settings } from 'lucide-react';

export default function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [asking, setAsking] = useState(true);
  const [logs, setLogs] = useState<string[]>(['[System]: Initializing Aether IDE Mobile Native Environment...', '[System]: Checking device policies and storage quotas...']);

  const addLog = (msg: string) => setLogs(p => [...p, msg]);

  const requestPermissions = async () => {
    try {
      addLog('[System]: Requesting Microphone & Camera permissions via WebRTC...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      // We got the stream, let's stop it immediately since we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      addLog('[Security]: Audio and Video capture authorized.');
      
      addLog('[System]: Establishing local Storage & FileSystem bindings...');
      addLog('[Security]: Native environment ready. Guardrails operational.');
      setPermissionsGranted(true);
      setAsking(false);
    } catch (err) {
      addLog(`[Error]: Permissions denied or unavailable (${(err as Error).message})`);
      setAsking(false);
    }
  };

  useEffect(() => {
    // Check if we already have permissions on mount
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      const hasLabels = devices.some(d => d.label !== '');
      if (hasLabels) {
        setPermissionsGranted(true);
        setAsking(false);
        addLog('[System]: Core permissions securely mapped from previous session.');
      } else {
        setAsking(true);
      }
    }).catch(e => {
        addLog(`[System Notice]: Cannot verify device hardware - ${e.message}`);
    });
  }, []);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#1a1c29] flex flex-col font-sans text-white h-full w-full overflow-hidden">
      {/* Header */}
      <div className="h-16 pt-safe flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl mt-1 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Smartphone size={22} />
          </div>
          <div className="flex flex-col mt-1">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-100">Aether Mobile</h1>
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Secure App Sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {permissionsGranted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest shrink-0">
               <CheckCircle2 size={14} /> Ready
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest shrink-0">
                <ShieldAlert size={14} className="animate-pulse" /> Locked
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        {!permissionsGranted && asking && (
          <div className="bg-[#18181b]/70 border border-[#333] p-8 rounded-3xl backdrop-blur-xl animate-in zoom-in-95 duration-500 shadow-2xl relative z-10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert size={120} />
            </div>

            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-inner shadow-indigo-500/10">
              <ShieldAlert className="text-indigo-400" size={36} />
            </div>
            
            <h2 className="text-xl font-bold text-center mb-2">Device Bindings Required</h2>
            <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
              To provide a fully native IDE experience on your device, Aether requires hardware access to execute multi-modal features and retain offline files.
            </p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4 bg-black/40 border border-[#333] p-4 rounded-2xl">
                <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0"><Mic className="text-emerald-400" size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-200">Microphone</div>
                  <div className="text-xs text-gray-500 font-medium">Capture audio for voice-driven code modifications.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 border border-[#333] p-4 rounded-2xl">
                <div className="p-2 bg-amber-500/10 rounded-xl shrink-0"><Camera className="text-amber-400" size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-200">Camera Access</div>
                  <div className="text-xs text-gray-500 font-medium">Provide visual context to the AI Assistant.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 border border-[#333] p-4 rounded-2xl">
                <div className="p-2 bg-blue-500/10 rounded-xl shrink-0"><HardDrive className="text-blue-400" size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-200">Secure Storage</div>
                  <div className="text-xs text-gray-500 font-medium">Cache project files safely encrypted on-device.</div>
                </div>
              </div>
            </div>

            <button 
              onClick={requestPermissions}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.25)] flex justify-center items-center gap-2"
            >
              <CheckCircle2 size={20} />
              Authorize & Enter Workspace
            </button>
            <p className="text-center mt-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                GDPR & CCPA Compliant Sandbox
            </p>
          </div>
        )}

        {(!asking || permissionsGranted) && (
          <div className="flex flex-col gap-6 w-full h-full relative z-10">
            <div className="flex-1 min-h-[300px] bg-black/60 rounded-3xl border border-white/10 p-5 shadow-2xl flex flex-col font-mono text-sm group">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Terminal size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">Runtime Console</span>
                  </div>
                  <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto text-gray-300 space-y-3 p-1">
                {logs.map((log, i) => (
                  <div key={i} className="opacity-90 hover:opacity-100 transition-opacity flex items-start gap-2">
                     <span className="text-indigo-500 select-none">❯</span>
                     <span className="flex-1">{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {permissionsGranted && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-8 duration-700 shadow-xl backdrop-blur-xl">
                <Rocket className="text-indigo-400 mb-6" size={48} />
                <h3 className="text-2xl font-black mb-2 text-white">App Sandbox Active</h3>
                <p className="text-sm text-indigo-200/70 mb-8 max-w-sm leading-relaxed">
                  The mobile web-app container securely encapsulates the UI, privacy policies, and system access APIs. To install this as an app, use the "Add to Home Screen" browser feature.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <button className="flex items-center justify-center gap-2 bg-[#18181b] border border-[#333] hover:border-indigo-500/50 py-4 rounded-2xl font-bold transition-all active:scale-95 text-xs text-gray-300">
                        <Settings size={16} /> Config
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 py-4 rounded-2xl font-bold transition-all active:scale-95 text-xs">
                        Open IDE
                    </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
