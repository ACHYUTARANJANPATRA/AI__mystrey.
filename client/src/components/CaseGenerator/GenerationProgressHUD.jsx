import React from 'react';
import { Cpu, ShieldCheck, Database, Camera, BrainCircuit } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function GenerationProgressHUD() {
  const { isGenerating, generationStage, generationProgress } = useCaseStore();

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-md bg-obsidian-900 border border-forensic-cyan/50 rounded-2xl p-8 text-center shadow-2xl glow-cyan overflow-hidden">
        
        {/* Radar Scanner Animation */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-3 rounded-full border border-cyan-500/40" />
          <div className="absolute inset-6 rounded-full border border-cyan-500/60" />
          
          {/* Rotating sweep line */}
          <div className="absolute inset-0 rounded-full animate-spin duration-3000 bg-gradient-to-tr from-transparent via-transparent to-cyan-500/30" />
          
          <div className="relative z-10 p-4 rounded-full bg-obsidian-950 border border-forensic-cyan text-forensic-cyan">
            <BrainCircuit className="w-10 h-10 animate-pulse text-forensic-cyan" />
          </div>
        </div>

        {/* Text Status */}
        <h3 className="text-lg font-bold tracking-wider text-white font-mono uppercase mb-1">
          Dossier Synthesis In Progress
        </h3>
        <p className="text-xs text-forensic-cyan font-mono mb-4">
          {generationStage || 'Constructing Knox Fair-Play Logic Matrix...'}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-obsidian-950 rounded-full h-2.5 border border-slate-800 overflow-hidden mb-6">
          <div 
            className="bg-gradient-to-r from-forensic-cyan to-forensic-amber h-full transition-all duration-500 rounded-full"
            style={{ width: `${generationProgress || 35}%` }}
          />
        </div>

        {/* Stage Checkpoints */}
        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <Cpu className="w-4 h-4 text-forensic-cyan" />
            <span>Logic</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Database className="w-4 h-4 text-forensic-amber" />
            <span>Dossier</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Camera className="w-4 h-4 text-forensic-cyan" />
            <span>Visuals</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lock</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 mt-6 font-mono">
          Powered by Google Gemini 3.8 Flash & `@google/genai`
        </div>
      </div>
    </div>
  );
}
