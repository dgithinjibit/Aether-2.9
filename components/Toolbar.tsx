
import React from 'react';
import { Play, Download, Settings, Sidebar, Layout, Database, Shield, Cpu, Code2, Eye, ShieldAlert, ShieldCheck, Loader2, Baby, Rocket } from 'lucide-react';
import { SecurityStatus } from '../types';

interface ToolbarProps {
  onRun: () => void;
  onExport: () => void;
  onPublish: () => void;
  onToggleSidebar: () => void;
  onLibraryManager: () => void;
  isSidebarOpen: boolean;
  onReset: () => void;
  sidebarMode: 'chat' | 'agent';
  setSidebarMode: (mode: 'chat' | 'agent') => void;
  
  // Tab Props
  activeTabId: string;
  onTabChange: (id: any) => void;

  // Mobile Props
  isMobile: boolean;
  mobileView: 'editor' | 'preview';
  setMobileView: (view: 'editor' | 'preview') => void;

  // Security & ELI5
  securityStatus: SecurityStatus;
  isEli5Mode: boolean;
  setIsEli5Mode: (val: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onRun, 
    onExport, 
    onPublish,
    onToggleSidebar, 
    onLibraryManager, 
    isSidebarOpen,
    onReset,
    sidebarMode,
    setSidebarMode,
    activeTabId,
    onTabChange,
    isMobile,
    mobileView,
    setMobileView,
    securityStatus,
    isEli5Mode,
    setIsEli5Mode
}) => {
  const getSecurityIcon = () => {
    switch (securityStatus) {
        case 'critical': return <ShieldAlert className="text-red-500" size={14} />;
        case 'warning': return <ShieldAlert className="text-yellow-500" size={14} />;
        case 'scanning': return <Loader2 className="animate-spin text-blue-400" size={14} />;
        default: return <ShieldCheck className="text-green-500" size={14} />;
    }
  };

  return (
    <div className="h-14 bg-[#18181b] border-b border-[#333] flex items-center justify-between px-3 md:px-4 select-none shrink-0 z-40">
      
      {/* Left: Branding & Tabs */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-gray-100 tracking-tight text-lg hidden md:inline">Aether<span className="text-blue-500">IDE</span></span>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        {(!isMobile || mobileView === 'editor') && (
            <div className="flex bg-[#27272a] rounded p-1 border border-[#333] overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
                <button 
                    onClick={() => onTabChange('codebase')}
                    className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${activeTabId === 'codebase' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    title="Codebase"
                >
                    <Layout size={14} />
                    <span className="hidden md:inline">Codebase</span>
                </button>
                <button 
                    onClick={() => onTabChange('logic')}
                    className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${activeTabId === 'logic' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    title="Logic"
                >
                    <Cpu size={14} />
                    <span className="hidden md:inline">Logic</span>
                </button>
                <button 
                    onClick={() => onTabChange('data')}
                    className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${activeTabId === 'data' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    title="Data"
                >
                    <Database size={14} />
                    <span className="hidden md:inline">Data</span>
                </button>
                <button 
                    onClick={() => onTabChange('security')}
                    className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${activeTabId === 'security' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    title={`Security Status: ${securityStatus}`}
                >
                    {activeTabId === 'security' ? <Shield size={14} /> : getSecurityIcon()}
                    <span className="hidden md:inline">Security</span>
                    {securityStatus === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-2 right-2 animate-pulse" />}
                </button>
            </div>
        )}
      </div>

      {/* Center: Mobile View Toggle */}
      <div className="flex-1 flex justify-center px-4">
        <button 
           onClick={() => setIsEli5Mode(!isEli5Mode)}
           className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isEli5Mode ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' : 'bg-[#27272a] text-gray-400 border border-transparent hover:border-[#444]'}`}
           title="Explain Like I'm 5 (Simplify Jargon)"
        >
            <Baby size={14} />
            <span className="hidden sm:inline">{isEli5Mode ? "ELI5 Active" : "ELI5 Mode"}</span>
        </button>
      </div>

      {isMobile && (
          <div className="flex items-center bg-[#27272a] rounded-lg p-0.5 border border-[#333] mx-2">
               <button 
                  onClick={() => setMobileView('editor')}
                  className={`p-1.5 rounded-md transition-all ${mobileView === 'editor' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}
               >
                   <Code2 size={16} />
               </button>
               <button 
                  onClick={() => setMobileView('preview')}
                  className={`p-1.5 rounded-md transition-all ${mobileView === 'preview' ? 'bg-green-600 text-white shadow' : 'text-gray-400'}`}
               >
                   <Eye size={16} />
               </button>
          </div>
      )}

      {/* Right: Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        
        <button 
            onClick={onRun}
            disabled={securityStatus === 'scanning'}
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md font-medium text-sm transition-all active:scale-95 disabled:opacity-50 
                ${securityStatus === 'critical' 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]'}`}
            title={securityStatus === 'critical' ? "Review Security Hazards first" : "Run Code"}
        >
            {securityStatus === 'scanning' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            <span className="hidden md:inline">{securityStatus === 'critical' ? 'Review Hazards' : 'Run'}</span>
        </button>

        <button 
            onClick={onPublish}
            disabled={securityStatus === 'critical' || securityStatus === 'scanning'}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-1.5 rounded-md font-bold text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-95 disabled:opacity-50 disabled:grayscale"
            title="Publish to Web"
        >
            <Rocket size={16} />
            <span className="hidden md:inline">Publish</span>
        </button>

        {!isMobile && <div className="h-6 w-[1px] bg-[#333] mx-1"></div>}
        
        <button 
            onClick={onLibraryManager}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-md transition-colors flex items-center gap-2"
            title="Manage Libraries"
        >
            <Settings size={18} />
        </button>

         <button 
            onClick={onExport}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-md transition-colors hidden md:block"
            title="Download ZIP"
        >
            <Download size={18} />
        </button>

        <button 
            onClick={onToggleSidebar}
            className={`p-2 rounded-md transition-colors ${isSidebarOpen ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-[#27272a]'}`}
            title="Toggle Sidebar"
        >
            <Sidebar size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
