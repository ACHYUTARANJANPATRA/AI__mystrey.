import React from 'react';
import { Shield, Sparkles, BookOpen, AlertOctagon, FolderPlus, Pin } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function TopNavigationBar({ onToggleNotebook }) {
  const { activeCase, pinnedEvidence, openScenarioModal, openAccusation } = useCaseStore();

  return (
    <header className="h-16 bg-obsidian-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Active Case Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-forensic-amber to-amber-700 flex items-center justify-center text-black font-bold shadow-md shadow-amber-950/40">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-forensic-amber uppercase">
              AI Mystery Room
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              THE DETECTIVE'S TERMINAL
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

        {/* Current Case Badge */}
        {activeCase ? (
          <div className="hidden lg:flex items-center gap-3">
            <div>
              <div className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                {activeCase.title}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-forensic-cyan">
                  {activeCase.difficulty}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-md">
                {activeCase.tagline}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-400 italic hidden md:block">
            No active investigation dossier loaded.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Pinned Clues Badge */}
        {pinnedEvidence.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-950 border border-slate-800 text-xs font-mono text-forensic-amber">
            <Pin className="w-3.5 h-3.5" />
            <span>{pinnedEvidence.length} Pinned</span>
          </div>
        )}

        {/* New Mystery Case */}
        <button
          onClick={openScenarioModal}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-1.5"
        >
          <FolderPlus className="w-4 h-4 text-forensic-cyan" />
          <span className="hidden sm:inline">New Case</span>
        </button>

        {/* Detective Notebook */}
        <button
          onClick={onToggleNotebook}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4 text-forensic-amber" />
          <span className="hidden sm:inline">Notebook</span>
        </button>

        {/* Grand Jury Accusation Button */}
        {activeCase && (
          <button
            onClick={openAccusation}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold tracking-wider uppercase font-mono shadow-lg shadow-red-950/40 glow-crimson transition flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>File Accusation</span>
          </button>
        )}
      </div>
    </header>
  );
}

