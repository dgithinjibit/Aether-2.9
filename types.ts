
export type CodeType = 'html' | 'css' | 'js';
export type BlockType = 'html' | 'css' | 'js' | 'python' | 'sql' | 'json';

export interface EditorFiles {
  html: string;
  css: string;
  js: string;
}

export interface CodeBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  isMaximized: boolean;
  isVisible: boolean;
  height?: number;
}

export interface WorkspaceTab {
  id: string;
  label: string;
  blocks: CodeBlock[];
}

export interface CodeIssue {
  blockId: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface LogEntry {
  id: string; // Unique ID for React keys
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
  source?: string; // Legacy string source (optional)
  fileName?: string; // Resolved file name
  lineNumber?: number; // Resolved line number
  stack?: string; // Full stack trace
  count: number; // For grouping identical logs
}

// --- Deep Remediation Types ---

export interface RemediationChange {
    blockId: string;
    title: string;
    content: string;
    explanation: string;
}

export interface RemediationResult {
  thoughtStream: string; // The raw monologue
  plan: string[];        // Strategic steps
  toolLogs: string[];    // Simulated tool execution log
  impactedFiles: string[]; // List of file names
  changes: RemediationChange[]; // The code updates
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isError?: boolean;
  images?: string[];
  // New: Embedded Remediation State
  remediation?: RemediationResult; 
  isRemediationLoading?: boolean;
  remediationTarget?: string;
}

export interface Snapshot {
  id: string;
  timestamp: number;
  files: EditorFiles;
}

export enum ViewMode {
  CODE_LEFT = 'CODE_LEFT',
  CODE_TOP = 'CODE_TOP',
}

export interface ExternalLibrary {
  name: string;
  url: string;
  type: 'script' | 'style';
}

// --- Agent Core Types ---

export enum AgentState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',        // Generating the Blueprint
  REVIEW_PLAN = 'REVIEW_PLAN',  // Waiting for User Approval
  EXECUTING = 'EXECUTING',      // Running the Loop
  COMPLETED = 'COMPLETED',      // Finished all tasks
  FAILED = 'FAILED'
}

export interface AgentTask {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  // Advanced Orchestration State
  subStatus?: 'working' | 'verifying' | 'healing';
  attempts?: number; // How many times we've tried to heal this task
  critique?: string; // Feedback from the reflection step
}

export interface AgentPlan {
  overview: string;      // The PLAN.md content
  tasks: AgentTask[];    // The TASKS.json content
  tests: string[];       // The TESTS.spec content
}

export interface AgentLog {
  id: string;
  stage: 'plan' | 'code' | 'review' | 'heal';
  message: string;
  thoughtProcess?: string; // The "Inner Monologue"
  timestamp: number;
}

// New: File System Operations for Agent
export interface FileOperation {
  action: 'create' | 'update' | 'delete';
  path: string; // The filename / block title
  content?: string; // Content for create/update
}

export interface AgentExecutionResponse {
  thought_process: string;
  file_operations: FileOperation[];
  explanation: string;
}

// --- Data Studio Types ---

export interface DataColumn {
  name: string;
  type: 'String' | 'Integer' | 'Float' | 'Boolean' | 'Date';
  sample: string;
}

export interface DataSchema {
  fileName: string;
  columns: DataColumn[];
  rowCount: number;
  dataSample: any[]; // First few rows
}

export interface BackendPlan {
  markdown: string;
  sqlSchema: string;
  apiEndpoints: string;
  frontendHooks: string;
}

export interface SecurityIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  line: number;
  description: string;
  fixSuggestion: string;
  blockId: string;
}

export type SecurityStatus = 'safe' | 'warning' | 'critical' | 'scanning';
