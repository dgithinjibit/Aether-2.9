import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { CodeType } from '../types';

interface CodeEditorProps {
  language: CodeType;
  value: string;
  onChange: (value: string | undefined) => void;
  title: string;
  color: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange, title, color }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Configure editor settings if needed
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', monospace",
      padding: { top: 16 },
    });
  };

  const getLanguageId = (type: CodeType) => {
    switch (type) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      default: return 'javascript';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] border-r border-[#333]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333] select-none">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm font-semibold text-gray-300 uppercase">{title}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={getLanguageId(language)}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;