import React, { useState } from 'react';
import { CodeBlockType, BlockType } from '../types';
import { Eye, Edit3, Trash2, Plus, CornerDownRight, Check, Play, FileCode, CheckSquare, Maximize2, Minimize2, Sparkles, FileSpreadsheet, Sparkle } from 'lucide-react';

interface EditorViewProps {
    blocks: CodeBlockType[];
    activeBlockId: string;
    setActiveBlockId: (id: string) => void;
    onUpdateBlockContent: (id: string, content: string) => void;
    onUpdateBlockTitle: (id: string, title: string) => void;
    onAddBlock: (title: string, type: BlockType, content: string) => void;
    onRemoveBlock: (id: string) => void;
    onRunCode: (code: string, filename: string) => void;
    onOpenIntentDialog: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
    blocks,
    activeBlockId,
    setActiveBlockId,
    onUpdateBlockContent,
    onUpdateBlockTitle,
    onAddBlock,
    onRemoveBlock,
    onRunCode,
    onOpenIntentDialog
}) => {
    const [isRenameMode, setIsRenameMode] = useState(false);
    const [renameVal, setRenameVal] = useState('');
    const [newFileTitle, setNewFileTitle] = useState('');
    const [newFileType, setNewFileType] = useState<BlockType>('js');
    const [showNewFileForm, setShowNewFileForm] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];

    const handleStartRename = () => {
        if (!activeBlock) return;
        setRenameVal(activeBlock.title);
        setIsRenameMode(true);
    };

    const handleSaveRename = () => {
        if (!activeBlock || !renameVal.trim()) return;
        onUpdateBlockTitle(activeBlock.id, renameVal.trim());
        setIsRenameMode(false);
    };

    const handleCreateFile = () => {
        if (!newFileTitle.trim()) return;
        let suffix = `.${newFileType}`;
        let title = newFileTitle.trim();
        if (!title.endsWith(suffix)) {
            title += suffix;
        }
        let template = '// Write code here\n';
        if (newFileType === 'json') template = '{\n  "name": "module",\n  "version": "1.0.0"\n}';
        if (newFileType === 'css') template = '/* Styles */\nbody {\n  background: #000;\n}';
        if (newFileType === 'markdown') template = '# Module Information\nDetail information...';

        onAddBlock(title, newFileType, template);
        setNewFileTitle('');
        setShowNewFileForm(false);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* File explorer ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none scroll-smooth">
                {blocks.map((block) => (
                    <button
                        key={block.id}
                        onClick={() => {
                            setActiveBlockId(block.id);
                            setIsRenameMode(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                            activeBlockId === block.id
                                ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                                : 'bg-[#18181b] border-[#333] text-gray-400 hover:text-white'
                        }`}
                    >
                        <FileCode size={14} className={activeBlockId === block.id ? 'text-indigo-400' : 'text-gray-500'} />
                        <span>{block.title}</span>
                    </button>
                ))}

                <button
                    onClick={() => setShowNewFileForm(!showNewFileForm)}
                    className="flex items-center justify-center p-2 bg-[#18181b] border border-[#333] text-gray-400 hover:text-white rounded-xl transition-all hover:bg-[#252526] shrink-0"
                    title="New Module File"
                >
                    <Plus size={14} />
                </button>

                <button
                    onClick={onOpenIntentDialog}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl transition-all shrink-0"
                    title="Scaffold via AI Prompt"
                >
                    <Sparkles size={12} className="text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Scaffold</span>
                </button>
            </div>

            {/* Quick File Form */}
            {showNewFileForm && (
                <div className="bg-[#18181b] border border-[#3w] p-4 rounded-2xl flex flex-col gap-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Create Sandbox File</span>
                        <button onClick={() => setShowNewFileForm(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="my_module_name"
                            value={newFileTitle}
                            onChange={(e) => setNewFileTitle(e.target.value)}
                            className="bg-black/40 border border-[#333] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 flex-1"
                        />
                        <select
                            value={newFileType}
                            onChange={(e) => setNewFileType(e.target.value as BlockType)}
                            className="bg-black/40 border border-[#333] rounded-xl px-2 py-2 text-xs text-indigo-300 focus:outline-none font-bold"
                        >
                            <option value="js">JS</option>
                            <option value="json">JSON</option>
                            <option value="css">CSS</option>
                            <option value="markdown">MD</option>
                        </select>
                        <button
                            onClick={handleCreateFile}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            {activeBlock ? (
                <div className={`flex flex-col bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all flex-1 ${isMaximized ? 'absolute inset-0 z-50 p-6 bg-[#111]' : ''}`}>
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-white/5">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isRenameMode ? (
                                <div className="flex items-center gap-2 max-w-xs">
                                    <input
                                        type="text"
                                        value={renameVal}
                                        onChange={(e) => setRenameVal(e.target.value)}
                                        className="bg-black/50 border border-indigo-500/30 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                                    />
                                    <button onClick={handleSaveRename} className="p-1 bg-emerald-600/20 text-emerald-400 rounded">
                                        <Check size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-xs font-bold text-gray-200 truncate">{activeBlock.title}</span>
                                    <button onClick={handleStartRename} className="text-gray-500 hover:text-gray-300 p-0.5">
                                        <Edit3 size={11} />
                                    </button>
                                </div>
                            )}
                            <span className="text-[9px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                                {activeBlock.type}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {activeBlock.type === 'js' && (
                                <button
                                    onClick={() => onRunCode(activeBlock.content, activeBlock.title)}
                                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    title="Execute Script"
                                >
                                    <Play size={12} />
                                    <span>Run</span>
                                </button>
                            )}

                            <button
                                onClick={() => onRemoveBlock(activeBlock.id)}
                                disabled={blocks.length <= 1}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-40 rounded-xl transition-all border border-red-500/20"
                                title="Delete Module"
                            >
                                <Trash2 size={13} />
                            </button>

                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="p-1.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-xl transition-all border border-white/5"
                            >
                                {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                            </button>
                        </div>
                    </div>

                    {/* Text Field */}
                    <div className="flex-1 min-h-[220px] relative font-mono text-xs flex">
                        <div className="bg-[#15151b] border-r border-[#222] select-none text-right px-3 py-4 text-gray-600 font-medium select-none min-w-[40px]">
                            {Array.from({ length: Math.max(1, activeBlock.content.split('\n').length) }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        <textarea
                            value={activeBlock.content}
                            onChange={(e) => onUpdateBlockContent(activeBlock.id, e.target.value)}
                            className="flex-1 bg-[#101014] text-gray-100 p-4 font-mono text-xs leading-relaxed resize-none border-none outline-none focus:ring-0 custom-scrollbar whitespace-pre"
                            style={{ tabSize: 4 }}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 bg-[#16161a] border border-[#222] rounded-3xl p-6 flex flex-col items-center">
                    <FileCode className="text-gray-500 mb-3" size={32} />
                    <p className="text-sm font-bold text-gray-400">No active blocks available</p>
                    <button
                        onClick={() => onAddBlock('sandbox.js', 'js', '// Welcome\n')}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold"
                    >
                        Create Block
                    </button>
                </div>
            )}
        </div>
    );
};
