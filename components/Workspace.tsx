import React, { useState } from 'react';
import { WorkspaceTab, CodeBlock as CodeBlockType, CodeIssue, BlockType } from '../types';
import CodeBlock from './CodeBlock';
import { Plus } from 'lucide-react';

interface WorkspaceProps {
  activeTab: WorkspaceTab;
  onUpdateBlock: (blockId: string, content: string) => void;
  onMaximizeBlock: (blockId: string) => void;
  onAddBlock: () => void;
  onRemoveBlock: (blockId: string) => void;
  onUpdateBlockType: (blockId: string, type: BlockType) => void;
  onUpdateBlockTitle: (blockId: string, title: string) => void;
  onUpdateBlockHeight: (blockId: string, height: number) => void;
  issues: Record<string, CodeIssue[]>;
  onFixBlockIssues: (blockId: string) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
    activeTab, 
    onUpdateBlock, 
    onMaximizeBlock, 
    onAddBlock, 
    onRemoveBlock, 
    onUpdateBlockType, 
    onUpdateBlockTitle,
    onUpdateBlockHeight,
    issues,
    onFixBlockIssues
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  return (
    <div className="h-full bg-[#111] overflow-y-auto p-2 relative">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full content-start">
        {activeTab.blocks.map((block) => {
            return (
                <div 
                    key={block.id} 
                    className={`${block.isMaximized ? 'fixed inset-0 z-50 p-4 bg-[#111]/90 backdrop-blur-sm flex flex-col' : ''}`}
                >
                    <CodeBlock 
                        block={block} 
                        onChange={(val) => onUpdateBlock(block.id, val || '')}
                        onMaximize={() => onMaximizeBlock(block.id)}
                        onRemove={() => onRemoveBlock(block.id)}
                        onTypeChange={(type) => onUpdateBlockType(block.id, type)}
                        onTitleChange={(title) => onUpdateBlockTitle(block.id, title)}
                        onHeightChange={(h) => onUpdateBlockHeight(block.id, h)}
                        issues={issues[block.id]}
                        isActive={activeBlockId === block.id}
                        onFocus={() => setActiveBlockId(block.id)}
                        onFixIssues={() => onFixBlockIssues(block.id)}
                    />
                </div>
            );
        })}
        
        {/* Add Block Placeholder - Unlimited */}
        <button 
            onClick={onAddBlock}
            className="min-h-[150px] border-2 border-dashed border-[#333] rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-colors bg-[#18181b] hover:bg-[#1e1e1e]"
            style={{ height: '200px' }}
        >
            <Plus size={32} />
            <span className="mt-2 font-medium">Add Codeblock</span>
        </button>
      </div>
    </div>
  );
};

export default Workspace;