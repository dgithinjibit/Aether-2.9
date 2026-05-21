export type BlockType = 'js' | 'json' | 'css' | 'markdown';

export interface CodeBlockType {
    id: string;
    type: BlockType;
    title: string;
    content: string;
    isMaximized?: boolean;
    isVisible?: boolean;
    height?: number;
}

export interface SecurityIssue {
    id: string;
    title: string;
    severity: 'high' | 'medium' | 'info';
    description: string;
    remediation: string;
}

export interface LogItem {
    message: string;
    type: 'system' | 'security' | 'success' | 'error' | 'input' | 'output';
    timestamp: number;
    fileName?: string;
}

export interface LibraryPackage {
    name: string;
    url: string;
    vulnerabilities: number;
    size: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: number;
    attachedFile?: string;
    isStreaming?: boolean;
    modifiedBlockId?: string;
}
