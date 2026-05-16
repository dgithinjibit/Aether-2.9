import React, { useState } from 'react';
import { X, Plus, Trash2, Search, Zap, Library, Sparkles, Database, Layout } from 'lucide-react';
import { ExternalLibrary, BlockType } from '../types';
import { POPULAR_LIBRARIES, CAPABILITIES } from '../constants';

interface LibraryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  activeLibraries: ExternalLibrary[];
  onAddLibrary: (lib: ExternalLibrary) => void;
  onRemoveLibrary: (lib: ExternalLibrary) => void;
  onAddCapability: (cap: { title: string; content: string; filename: string; blockType: string }) => void;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({ 
    isOpen, 
    onClose, 
    activeLibraries, 
    onAddLibrary, 
    onRemoveLibrary,
    onAddCapability
}) => {
  const [activeTab, setActiveTab] = useState<'capabilities' | 'libraries'>('capabilities');
  const [customUrl, setCustomUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleAddCustom = () => {
    if (!customUrl) return;
    const type = customUrl.endsWith('.css') ? 'style' : 'script';
    const name = customUrl.split('/').pop() || 'Custom Library';
    onAddLibrary({ name, url: customUrl, type });
    setCustomUrl('');
  };

  const filteredPopular = POPULAR_LIBRARIES.filter(lib => 
    lib.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-[#333]">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600/20 p-2 rounded-lg">
                <Library className="text-blue-500" size={20} />
             </div>
             <h2 className="text-xl font-bold text-white">Project Assets</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#252526] p-2 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#111] p-1.5 gap-1.5 m-5 rounded-xl border border-[#333]">
            <button 
                onClick={() => setActiveTab('capabilities')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'capabilities' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-gray-200 hover:bg-[#222]'}`}
            >
                <Sparkles size={16} />
                Capabilities
            </button>
            <button 
                onClick={() => setActiveTab('libraries')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'libraries' ? 'bg-[#27272a] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#222]'}`}
            >
                <Library size={16} />
                Libraries
            </button>
        </div>

        <div className="px-5 pb-8 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'capabilities' ? (
              <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                      {CAPABILITIES.map((cap, idx) => (
                           <div key={idx} className="bg-[#252526] border border-[#333] rounded-xl p-4 hover:border-blue-500/30 transition-all group">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-lg ${cap.type === 'data' ? 'bg-amber-500/10 text-amber-500' : cap.type === 'feature' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {cap.type === 'data' ? <Database size={18} /> : <Layout size={18} />}
                                       </div>
                                       <div>
                                            <h3 className="text-white font-bold">{cap.title}</h3>
                                            <p className="text-xs text-gray-400">{cap.description}</p>
                                       </div>
                                   </div>
                                   <button 
                                        onClick={() => onAddCapability(cap)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                                   >
                                        <Plus size={18} />
                                   </button>
                               </div>
                           </div>
                      ))}
                  </div>
                  <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-4 flex gap-4 items-center mt-6">
                       <Zap className="text-blue-500 shrink-0" size={24} />
                       <p className="text-sm text-blue-200/60 leading-tight">
                           <strong>Hint:</strong> Capabilities add secure, pre-written code modules to your project that you can customize.
                       </p>
                  </div>
              </div>
          ) : (
              <div className="space-y-6">
                {/* Active Libraries */}
                {activeLibraries.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Packages</h3>
                        <div className="space-y-2">
                            {activeLibraries.map((lib, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-[#111] p-3 rounded-xl border border-[#333]">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">{lib.name}</span>
                                        <span className="text-[10px] font-mono text-gray-500 truncate max-w-[300px]">{lib.url}</span>
                                    </div>
                                    <button onClick={() => onRemoveLibrary(lib)} className="text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Add New Packages</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..." 
                                className="w-48 bg-[#111] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition-all focus:w-64"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {filteredPopular.map((lib, idx) => {
                            const isActive = activeLibraries.some(l => l.url === lib.url);
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => !isActive && onAddLibrary(lib)}
                                    disabled={isActive}
                                    className={`text-left p-3 rounded-xl border text-sm flex items-center justify-between group transition-all ${isActive ? 'bg-green-900/10 border-green-900/30 text-green-400 opacity-60' : 'bg-[#252526] border-[#333] hover:border-blue-500/50 hover:bg-[#2d2d30] text-gray-300'}`}
                                >
                                    <span className="font-medium">{lib.name}</span>
                                    {isActive ? <CheckCircle size={14} /> : <Plus size={16} className="text-blue-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Add Custom */}
                <div className="space-y-3 pt-4 border-t border-[#333]">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Script URL</h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            placeholder="https://cdn.example.com/lib.js" 
                            className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                        <button onClick={handleAddCustom} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20">Add</button>
                    </div>
                </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LibraryManager;