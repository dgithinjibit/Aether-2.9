import React, { useState, useCallback } from 'react';
import { Upload, Database, FileText, CheckCircle, ArrowRight, Loader2, Table } from 'lucide-react';
import Papa from 'papaparse';
import { DataSchema, BackendPlan } from '../types';
import * as GeminiService from '../services/geminiService';

interface DataStudioProps {
  onSchemaReady: (data: any[]) => void;
}

const DataStudio: React.FC<DataStudioProps> = ({ onSchemaReady }) => {
  const [schema, setSchema] = useState<DataSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendPlan, setBackendPlan] = useState<BackendPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    // Parse CSV (Simplified for demo)
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        preview: 10,
        complete: (results) => {
            if (results.data && results.data.length > 0) {
                const cols = Object.keys(results.data[0] as object).map(key => {
                    const val = (results.data[0] as any)[key];
                    let type: 'String' | 'Integer' | 'Float' | 'Boolean' | 'Date' = 'String';
                    if (typeof val === 'number') type = Number.isInteger(val) ? 'Integer' : 'Float';
                    else if (typeof val === 'boolean') type = 'Boolean';
                    
                    return { name: key, type, sample: String(val) };
                });

                setSchema({
                    fileName: file.name,
                    columns: cols,
                    rowCount: 1000, // Simulated count
                    dataSample: results.data as any[]
                });
            }
            setLoading(false);
        }
    });
  };

  const handleGeneratePlan = async () => {
    if (!schema) return;
    setPlanLoading(true);
    try {
        const plan = await GeminiService.generateBackendPlan(schema);
        setBackendPlan(plan);
    } catch (e) {
        console.error(e);
        alert("Failed to generate plan");
    } finally {
        setPlanLoading(false);
    }
  };

  const handleConnect = () => {
      setIsConnected(true);
      if (schema) {
          onSchemaReady(schema.dataSample);
      }
  };

  return (
    <div className="h-full bg-[#111] overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center border border-purple-500/30">
                    <Database className="text-purple-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Data & Backend Studio</h2>
                    <p className="text-gray-400">Ingest data, define schemas, and autonomous backend construction.</p>
                </div>
            </div>

            {/* 1. Ingestion */}
            {!schema && (
                <div className="border-2 border-dashed border-[#333] hover:border-purple-500/50 rounded-2xl p-12 text-center transition-colors bg-[#18181b]">
                    <Upload className="mx-auto text-gray-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">Drop Dataset Here</h3>
                    <p className="text-gray-500 mb-6">Support for .CSV, .JSON, .XLSX</p>
                    <label className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                        Select File
                        <input type="file" className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
                    </label>
                    {loading && <div className="mt-4 text-purple-400 animate-pulse">Analyzing structure...</div>}
                </div>
            )}

            {/* 2. Schema Editor */}
            {schema && !backendPlan && (
                <div className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-4 border-b border-[#333] bg-[#252526] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Table size={18} className="text-purple-400" />
                             <span className="font-semibold">{schema.fileName} Schema</span>
                        </div>
                        <button onClick={() => setSchema(null)} className="text-xs text-red-400 hover:underline">Reset</button>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-[#18181b]">
                                <tr>
                                    <th className="px-4 py-2">Column Name</th>
                                    <th className="px-4 py-2">Detected Type</th>
                                    <th className="px-4 py-2">Sample</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {schema.columns.map((col, idx) => (
                                    <tr key={idx} className="hover:bg-[#252526]">
                                        <td className="px-4 py-2 font-mono text-purple-300">{col.name}</td>
                                        <td className="px-4 py-2">
                                            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 text-xs">
                                                {col.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{col.sample}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleGeneratePlan}
                                disabled={planLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {planLoading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                                Generate Backend Blueprint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Backend Plan & Construction */}
            {backendPlan && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4">
                            <h4 className="font-semibold text-purple-400 mb-2">Generated SQL Schema</h4>
                            <pre className="text-xs font-mono text-gray-300 overflow-x-auto bg-black/30 p-2 rounded">
                                {backendPlan.sqlSchema}
                            </pre>
                        </div>
                        <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4">
                            <h4 className="font-semibold text-blue-400 mb-2">API Endpoints</h4>
                            <pre className="text-xs font-mono text-gray-300 overflow-x-auto bg-black/30 p-2 rounded">
                                {backendPlan.apiEndpoints}
                            </pre>
                        </div>
                    </div>

                     <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4">
                        <h4 className="font-semibold text-green-400 mb-2">Frontend React Hooks</h4>
                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto bg-black/30 p-2 rounded max-h-48">
                            {backendPlan.frontendHooks}
                        </pre>
                    </div>

                    <div className="flex items-center justify-between bg-green-900/10 border border-green-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className={`text-green-500 transition-all ${isConnected ? 'scale-110' : ''}`} size={24} />
                            <div>
                                <h4 className="font-bold text-green-400">{isConnected ? "System Live & Connected" : "Ready to Deploy"}</h4>
                                <p className="text-xs text-green-300/70">
                                    {isConnected ? "Data is flowing to the frontend preview context." : "Approve to spin up local database and API bridge."}
                                </p>
                            </div>
                        </div>
                         {!isConnected && (
                             <button 
                                onClick={handleConnect}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 flex items-center gap-2"
                            >
                                Approve & Connect <ArrowRight size={16} />
                            </button>
                         )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default DataStudio;
