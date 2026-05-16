
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { EditorFiles, AgentPlan, AgentTask, DataSchema, BackendPlan, SecurityIssue, CodeBlock, CodeIssue, RemediationResult, AgentExecutionResponse } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Model configuration
const MODEL_CODE = 'gemini-3-flash-preview'; // For complex reasoning/coding gemini-3-pro-preview
const MODEL_CHAT = 'gemini-3-flash-preview'; // For faster chat
const MODEL_REMEDIATION = 'gemini-3-pro-preview'; // Upgraded to PRO for deep reasoning and reliable fixing

const SYSTEM_INSTRUCTION = `
You are Aether, an expert senior web developer and AI coding assistant embedded in a high-fidelity live IDE. 
You have access to HTML, CSS, and JavaScript files which are composed of UNLIMITED "Code Blocks" defined by the user in a single "Codebase" tab.

### SCOPE & SECURITY (CRITICAL "SEAT BELTS"):
1.  **Project Boundaries**: You must ONLY analyze, debug, and generate code for the files presented in the user's project (HTML, CSS, JS). 
2.  **Ignore Environment Noise**: The runtime is a browser-based iframe. If you see errors about "ResizeObserver", "chrome-extension://", or line numbers that exceed the total length of the file, these are ENVIRONMENT ARTIFACTS. IGNORE THEM. Do NOT attempt to fix them.
3.  **Strict File Authority**: If the user asks about a file that is not in the provided context, state that it does not exist.
4.  **Vibe Coding Guardrails (CRITICAL)**: You are the user's "seat belt". You must actively prevent insecure code.
    - NEVER generate code that hardcodes API keys, secrets, or tokens in client-side code.
    - NEVER generate code that connects to an unauthenticated/wide-open database or file storage.
    - If the user asks for insecure patterns, REFUSE to implement them and explain the correct, secure pattern (e.g., using a backend proxy or secure auth rules).

### RUNTIME ENVIRONMENT & EXECUTION MODEL:
1.  **Concatenation**: The user defines multiple blocks (e.g., \`utils.js\`, \`app.js\`), but the runtime CONCATENATES them into single execution contexts (one HTML body, one Style tag, one Script tag).
2.  **Module System**: 
    *   The runtime automatically detects if \`import\` or \`export\` is used. If detected, the ENTIRE script runs as \`type="module"\`.
    *   **Scoping Trap**: In modules, top-level variables are NOT global. You must explicitly attach to \`window\` (e.g. \`window.myFunc = myFunc\`) if you need to call them from HTML attributes like \`onclick\`.
3.  **Visual Context**: You may receive screenshots. Use them to diagnose layout shifts, overflow issues, or styling bugs.

### CAPABILITIES:
1.  **Analyze**: Understand the relationship between the three file types and their constituent blocks.
2.  **Generate**: Write clean, modern, semantic, and efficient code.
3.  **Debug**: Identify syntax errors, logic bugs, and visual issues within the PROJECT BOUNDARIES.
4.  **Explain**: Break down complex code into simple terms.

### RULES:
- When asked to generate code, provide the FULL content of the file(s) that need changing if the request implies a rewrite, OR clear snippets.
- **Labeling**: When providing code blocks, label them clearly with the language (html, css, javascript).
- **Robustness**: Always ensure elements exist before adding event listeners. Use defensive programming.
`;

interface CodeGenerationResponse {
  html?: string;
  css?: string;
  js?: string;
  explanation: string;
  thought_process?: string;
}

interface VerificationResponse {
    isValid: boolean;
    critique: string;
    thought_process?: string;
}

// --- Helper: Retry Mechanism ---
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    const msg = (error.toString() + (error.message || '')).toLowerCase();
    // Retry on network errors, timeouts (rpc error), or rate limits
    const isRetryable = msg.includes('503') || 
                        msg.includes('429') || 
                        msg.includes('rpc failed') || 
                        msg.includes('xhr error') || 
                        msg.includes('fetch failed') ||
                        msg.includes('aborted');
    
    if (isRetryable) {
        console.warn(`[GeminiService] Retrying operation... Attempts left: ${retries}. Reason: ${msg}`);
        await new Promise(r => setTimeout(r, delay));
        return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateCode = async (
  prompt: string,
  currentFiles: EditorFiles,
  task: 'generate' | 'fix' | 'refactor' = 'generate',
  images: string[] = []
): Promise<CodeGenerationResponse> => {
  return retry(async () => {
    const ai = getClient();
    
    const context = `
CURRENT HTML:
\`\`\`html
${currentFiles.html}
\`\`\`

CURRENT CSS:
\`\`\`css
${currentFiles.css}
\`\`\`

CURRENT JS:
\`\`\`javascript
${currentFiles.js}
\`\`\`

TASK: ${task.toUpperCase()}
USER PROMPT: ${prompt}

Return your response in JSON format with the following schema:
{
  "html": "The full updated HTML code (optional if no change)",
  "css": "The full updated CSS code (optional if no change)",
  "js": "The full updated JS code (optional if no change)",
  "explanation": "A brief explanation of what you did. If fixing a module scoping issue, explicitly mention it."
}
`;

    const parts: any[] = [{ text: context }];
    
    for (const base64 of images) {
        const data = base64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
            inlineData: {
                data: data,
                mimeType: "image/png"
            }
        });
    }

    const response = await ai.models.generateContent({
      model: MODEL_CODE,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            js: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CodeGenerationResponse;
  });
};

export const analyzeError = async (
  errorLog: string,
  currentFiles: EditorFiles
): Promise<CodeGenerationResponse> => {
  return generateCode(
    `I am encountering the following runtime error(s) in the console:\n\n${errorLog}\n\nPlease analyze the code and the error stack trace to provide a fix. \n\nIMPORTANT: Ignore any errors related to 'ResizeObserver' or files not present in the code context. If the error mentions a line number larger than the file size, it is an offset error - try to map it to the provided code logic.`,
    currentFiles,
    'fix'
  );
};

export const fixCodeBlock = async (
    block: CodeBlock,
    issues: CodeIssue[],
    contextFiles: EditorFiles
): Promise<{ content: string; explanation: string }> => {
    return retry(async () => {
        const ai = getClient();
        const issuesText = issues.map(i => `- Line ${i.line}: ${i.message} (${i.severity})`).join('\n');
        
        const prompt = `
        You are an expert code fixer and linter assistant.
        
        TARGET FILE: ${block.title} (Type: ${block.type})
        
        ISSUES DETECTED BY LINTER:
        ${issuesText}
        
        TARGET CONTENT TO FIX:
        \`\`\`${block.type}
        ${block.content}
        \`\`\`
        
        PROJECT CONTEXT (Read-only reference for variable scope/dependencies):
        HTML: ${contextFiles.html.substring(0, 2000)}...
        CSS: ${contextFiles.css.substring(0, 2000)}...
        JS: ${contextFiles.js.substring(0, 2000)}...

        INSTRUCTIONS:
        1. Analyze the specific issues listed above.
        2. Fix the "TARGET CONTENT" to resolve these issues.
        3. Ensure the fixed code is compatible with the "PROJECT CONTEXT".
        4. Return the FULL updated content for the target block.
        
        Return JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 2048 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING, description: "The full corrected code for the block" },
                        explanation: { type: Type.STRING, description: "Brief explanation of the fixes applied" }
                    },
                    required: ["content", "explanation"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Failed to fix block");
        return JSON.parse(text);
    });
};

// --- NEW: Deep Remediation (Holistic Fix) ---
export const performDeepRemediation = async (
    targetBlockId: string,
    issues: CodeIssue[],
    allBlocks: CodeBlock[]
): Promise<RemediationResult> => {
    return retry(async () => {
        const ai = getClient();
        
        // Construct detailed context of all blocks
        const contextPayload = allBlocks.map(b => ({
            id: b.id,
            title: b.title,
            type: b.type,
            content: b.content
        }));

        const targetBlock = allBlocks.find(b => b.id === targetBlockId);
        const issueDescription = issues.map(i => `Line ${i.line}: ${i.message}`).join('\n');

        const prompt = `
        You are Aether's "Deep Remediation Engine". You are a Senior Software Architect performing an Omniscient Code Scan.
        
        OBJECTIVE:
        A critical issue has been detected in "${targetBlock?.title}" (ID: ${targetBlockId}). 
        
        DETECTED ISSUE:
        ${issueDescription}
        
        GLOBAL DEPENDENCY GRAPH (FULL PROJECT CONTEXT):
        ${JSON.stringify(contextPayload)}
        
        ### ANTI-PATCH PROTOCOL (STRICT RULES):
        1.  **NO Band-Aids**: Do NOT use \`!important\`, do NOT swallow errors with empty try/catch, do NOT use hardcoded magic numbers.
        2.  **Root Cause Analysis**: Trace the error backwards through the dependency graph. 
        3.  **Omniscient Scan**: You must update ALL files that are part of the solution. If fixing a JS bug requires adding a CSS class, do BOTH.

        ### COGNITIVE TRANSPARENCY (OUTPUT REQUIREMENTS):
        You must expose your internal reasoning in the "Neural Logs".
        1.  **Thought Stream**: This must be an EXTREMELY DETAILED, VERBOSE, and CHRONOLOGICAL log of your engineering process. 
            - Do not provide a summary. 
            - Write out every hypothesis, every check you perform, every file you trace. 
            - Explain the "Why" behind every code change.
            - If you check a variable, write "Checking variable X...". 
            - If you reject a solution, write "Rejecting solution Y because...".
            - The user wants to see the raw, unfiltered engineering thought process.
        2.  **Tool Logs**: Simulate the execution of internal tools (e.g., "[DepScan] Analyzing imports...", "[Linter] checking rules...").
        3.  **Plan**: A structured scratchpad of steps you will take.
        4.  **PHYSICAL IMPLEMENTATION**: The code you return in \`changes\` will be written directly to the file system. It must be the FULL file content, bug-free, and syntax-perfect. Do not include placeholders.
        5.  **ID MAPPING**: You MUST use the EXACT \`id\` provided in the "GLOBAL DEPENDENCY GRAPH" for the \`blockId\` field. If you get the ID wrong, the fix will fail.
        
        OUTPUT FORMAT (JSON):
        {
          "thoughtStream": "string (Raw, verbose, step-by-step monologue)",
          "plan": ["step 1", "step 2"],
          "toolLogs": ["log 1", "log 2"],
          "impactedFiles": ["filename1", "filename2"],
          "changes": [
            { "blockId": "id", "title": "filename", "content": "FULL NEW CONTENT", "explanation": "reason" }
          ]
        }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_REMEDIATION,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 10240 }, // High budget for deep analysis
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        thoughtStream: { type: Type.STRING, description: "Raw, verbose cognitive stream of the investigation" },
                        plan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strategic Scratchpad" },
                        toolLogs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Simulated internal tool execution logs" },
                        impactedFiles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of files that will be modified" },
                        changes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    blockId: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["blockId", "title", "content", "explanation"]
                            }
                        }
                    },
                    required: ["thoughtStream", "plan", "toolLogs", "impactedFiles", "changes"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Deep Remediation failed");
        return JSON.parse(text) as RemediationResult;
    });
};


export const chatWithContext = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  message: string,
  currentFiles: EditorFiles,
  images: string[] = []
) => {
    // Streams are harder to retry transparently, passing through directly.
    const ai = getClient();
    const contextPrompt = `
[CONTEXT - CURRENT CODE STATE]
HTML Length: ${currentFiles.html.length} chars
CSS Length: ${currentFiles.css.length} chars
JS Length: ${currentFiles.js.length} chars
(The user may refer to the code visible in the editors.)
`;
    
    const chat = ai.chats.create({
        model: MODEL_CHAT,
        history: [
            {
                role: 'user',
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood. I am ready to assist with the code and handle the runtime environment constraints." }]
            },
            ...history
        ],
    });

    const parts: any[] = [
        { text: `${contextPrompt}\n\nUser Question: ${message}` }
    ];

    for (const base64 of images) {
        const data = base64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
            inlineData: {
                data: data,
                mimeType: "image/png"
            }
        });
    }

    return await chat.sendMessageStream({
        message: parts
    });
};

// --- Agent Core Services ---

export const createAgentPlan = async (
    prompt: string,
    currentFiles: EditorFiles
): Promise<AgentPlan> => {
    return retry(async () => {
        const ai = getClient();
        
        const promptText = `
        You are an AI Software Architect.
        The user wants to build: "${prompt}"
        
        Current File Context:
        HTML: ${currentFiles.html.substring(0, 1000)}...
        CSS: ${currentFiles.css.substring(0, 1000)}...
        JS: ${currentFiles.js.substring(0, 1000)}...

        Create a robust implementation plan.
        1. Analyze the requirements.
        2. Break it down into sequential execution tasks (TASKS.json).
        3. Define success criteria (TESTS.spec).
        4. Provide a high-level technical overview (PLAN.md).

        Return JSON matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: promptText,
            config: {
                thinkingConfig: { thinkingBudget: 8192 }, // Moderate budget
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overview: { type: Type.STRING, description: "Markdown technical overview" },
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    description: { type: Type.STRING, description: "Detailed instruction for this step" },
                                    status: { type: Type.STRING, enum: ["pending"] }
                                },
                                required: ["id", "label", "description", "status"]
                            }
                        },
                        tests: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of verification steps or success criteria"
                        }
                    },
                    required: ["overview", "tasks", "tests"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Failed to generate plan");
        return JSON.parse(text) as AgentPlan;
    });
};

// 1. EXECUTE TASK (Autonomous File System Mode)
export const executeAgentTask = async (
    task: AgentTask,
    allBlocks: CodeBlock[],
    planOverview: string
): Promise<AgentExecutionResponse> => {
    return retry(async () => {
        const ai = getClient();

        // 1. Construct File System Context
        const fsContext = allBlocks.map(b => `
[FILE] ${b.title} (ID: ${b.id}, Type: ${b.type})
\`\`\`${b.type}
${b.content}
\`\`\`
`).join('\n\n');

        const prompt = `
        You are an Autonomous AI Developer executing a task in a live environment.
        
        PLAN OVERVIEW:
        ${planOverview}

        CURRENT TASK:
        Task ID: ${task.id}
        Label: ${task.label}
        Description: ${task.description}

        FILE SYSTEM STATE:
        ${fsContext}

        CAPABILITIES:
        You have FULL CONTROL over the file system. You can:
        1. **create**: Add new files (e.g., 'utils.js', 'test.md', 'component.html').
        2. **update**: Rewrite existing files.
        3. **delete**: Remove obsolete files.

        INSTRUCTIONS:
        1. Think step-by-step.
        2. Execute the necessary file operations to complete the task.
        3. If creating a new file, specify the 'path' (filename) and 'content'.
        4. If updating, provide the FULL new content.
        5. **Robustness**: Ensure new code integrates with existing blocks.
        
        OUTPUT SCHEMA:
        Return JSON with:
        - thought_process: Your inner monologue.
        - file_operations: Array of actions.
        - explanation: Summary for the user.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 8192 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        thought_process: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        file_operations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING, enum: ["create", "update", "delete"] },
                                    path: { type: Type.STRING, description: "The filename (e.g. script.js)" },
                                    content: { type: Type.STRING, description: "Full file content (required for create/update)" }
                                },
                                required: ["action", "path"]
                            }
                        }
                    },
                    required: ["thought_process", "explanation", "file_operations"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Failed to execute task");
        return JSON.parse(text) as AgentExecutionResponse;
    });
};

// 2. VERIFY TASK (Self-Reflection)
export const verifyAgentTask = async (
    task: AgentTask,
    originalBlocks: CodeBlock[],
    modifiedBlocks: CodeBlock[]
): Promise<VerificationResponse> => {
    return retry(async () => {
        const ai = getClient();
        
        const originalSummary = originalBlocks.map(b => `${b.title} (${b.content.length} chars)`).join(', ');
        const modifiedContext = modifiedBlocks.map(b => `[FILE] ${b.title}\n${b.content}`).join('\n\n');

        const prompt = `
        You are a QA Lead.
        
        TASK: ${task.label}
        DESCRIPTION: ${task.description}
        
        PREVIOUS STATE: ${originalSummary}

        CURRENT FILE SYSTEM (After Modification):
        ${modifiedContext}
        
        CHECKLIST:
        1. Did the agent create/update the files as requested?
        2. Is the code syntactically correct?
        3. Does it fulfill the task description?

        Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 4096 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        critique: { type: Type.STRING },
                        thought_process: { type: Type.STRING }
                    },
                    required: ["isValid", "critique", "thought_process"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Failed to verify task");
        return JSON.parse(text) as VerificationResponse;
    });
}

// 3. HEAL TASK (Self-Improvement) - Note: Simplification for now, re-uses executeAgentTask logic but with critique context
export const autoHealAgentTask = async (
    task: AgentTask,
    allBlocks: CodeBlock[],
    critique: string
): Promise<AgentExecutionResponse> => {
    return retry(async () => {
        const ai = getClient();
        const fsContext = allBlocks.map(b => `[FILE] ${b.title}\n${b.content}`).join('\n\n');

        const prompt = `
        You are a Senior Developer fixing a failed implementation.
        
        TASK: ${task.label}
        FAILED REASON (Critique): "${critique}"
        
        CURRENT FILES:
        ${fsContext}
        
        INSTRUCTIONS:
        1. Fix the files to address the critique.
        2. Return the necessary file operations.
        
        Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 8192 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        thought_process: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        file_operations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING, enum: ["create", "update", "delete"] },
                                    path: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ["action", "path"]
                            }
                        }
                    },
                    required: ["thought_process", "explanation", "file_operations"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Failed to heal task");
        return JSON.parse(text) as AgentExecutionResponse;
    });
};

// --- DATA STUDIO SERVICES ---

export const generateBackendPlan = async (
  schema: DataSchema
): Promise<BackendPlan> => {
  return retry(async () => {
    const ai = getClient();
    const prompt = `
    Generate a complete backend blueprint for a detected dataset.
    
    DATASET CONTEXT:
    File: ${schema.fileName}
    Rows: ${schema.rowCount}
    Columns: ${JSON.stringify(schema.columns)}
    Sample Data: ${JSON.stringify(schema.dataSample.slice(0, 1))}

    REQUIREMENTS:
    1. Create a SQL Schema compliant with PostgreSQL/SQLite.
    2. Define REST API endpoints (e.g., /api/data, /api/data/:id).
    3. Generate frontend React hooks to fetch this data.
    4. Provide a markdown summary.

    Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_CODE,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                markdown: { type: Type.STRING },
                sqlSchema: { type: Type.STRING },
                apiEndpoints: { type: Type.STRING },
                frontendHooks: { type: Type.STRING }
            },
            required: ["markdown", "sqlSchema", "apiEndpoints", "frontendHooks"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate backend plan");
    return JSON.parse(text) as BackendPlan;
  });
};

// --- SECURITY SERVICES ---

export const scanCodeSecurity = async (
    html: string,
    css: string,
    js: string
): Promise<SecurityIssue[]> => {
    return retry(async () => {
        const ai = getClient();
        const prompt = `
        Scan the following code for security vulnerabilities (XSS, Injection, Sensitive Data, Logic Flaws).
        
        CODE:
        HTML: ${html.substring(0, 1000)}
        JS: ${js.substring(0, 2000)}

        Return a list of issues. If none, return empty list.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CODE,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                            line: { type: Type.INTEGER },
                            description: { type: Type.STRING },
                            fixSuggestion: { type: Type.STRING },
                            blockId: { type: Type.STRING, description: "Assume 'js' or 'html'" }
                        },
                        required: ["id", "severity", "description", "fixSuggestion", "blockId"]
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as SecurityIssue[];
    });
};

// --- REAL-TIME LINTER SERVICE ---

export const checkCodeQuality = async (
    blocks: CodeBlock[]
): Promise<CodeIssue[]> => {
    // Only send simplified content to avoid token limits for rapid linting
    const blocksPayload = blocks.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        content: b.content
    }));

    return retry(async () => {
        const ai = getClient();
        const prompt = `
        You are a Real-time Code Linter, Logic Analyzer, and Security Sentinel.
        Analyze the provided code blocks for:
        1. Syntax Errors.
        2. Logical Bugs (e.g. infinite loops, null references).
        3. Cross-file inconsistencies (e.g. JS referencing missing HTML ID, missing CSS class).
        4. "Vibe Coding" Security Hazards (e.g. hardcoded API keys, tokens, wide-open database references, exposed secrets). Flag these as 'error'.
        
        CODE BLOCKS:
        ${JSON.stringify(blocksPayload)}

        Return a JSON list of issues. Return empty list if code is good.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CHAT, // Use Flash for speed
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            blockId: { type: Type.STRING },
                            line: { type: Type.INTEGER },
                            message: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ["error", "warning", "info"] }
                        },
                        required: ["blockId", "line", "message", "severity"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as CodeIssue[];
    });
};

export const scaffoldModuleByIntent = async (intent: string): Promise<{ title: string; content: string; type: string }> => {
    return retry(async () => {
        const ai = getClient();
        const prompt = `
        You are an Expert Architect. The user wants to build: "${intent}"
        Generate a secure, production-ready code scaffold for a single JavaScript module.
        
        ### SCOPE & SECURITY (CRITICAL "SEAT BELTS"):
        1. NO hardcoded keys, secrets, or tokens.
        2. Use the "Seat Belts" pattern (validate inputs, handle errors).
        3. Use ES Modules (export default/const).
        4. Provide a descriptive filename ending in .js.
        
        ### RETURN FORMAT:
        You must return ONLY a JSON object exactly like this:
        {
            "title": "filename.js",
            "type": "js",
            "content": "// code here..."
        }
        `;

        const result = await ai.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
        throw new Error("Failed to parse scaffolding");
    });
};
