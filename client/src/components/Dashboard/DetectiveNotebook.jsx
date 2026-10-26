import React from 'react';
import { X, BookOpen, Pin, Trash2, CheckCircle2 } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function DetectiveNotebook({ isOpen, onClose }) {
  const { notes, updateNotes, pinnedEvidence, activeCase, togglePinEvidence } = useCaseStore();

  if (!isOpen) return null;

  const pinnedItems = activeCase?.evidence?.filter(e => pinnedEvidence.includes(e.id || e._id)) || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-obsidian-900 border-l border-slate-700/80 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-obsidian-950">
        <div className="flex items-center gap-2 text-forensic-amber font-mono font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>DETECTIVE'S SCRATCHPAD</span>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Pinned Evidence Section */}
        <div>
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-forensic-amber" />
            Pinned Evidence ({pinnedItems.length})
          </div>
          {pinnedItems.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-3 bg-obsidian-950 rounded-lg border border-slate-800 text-center">
              No clues pinned yet. Click the pin icon on any evidence item to track it here.
            </div>
          ) : (
            <div className="space-y-2">
              {pinnedItems.map(item => (
                <div 
                  key={item.id || item._id}
                  className="p-2.5 rounded-lg bg-obsidian-950 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-forensic-cyan font-mono uppercase mt-0.5">
                      {item.category} • {item.type}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePinEvidence(item.id || item._id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Unpin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Freeform Notes Textarea */}
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            Working Hypotheses & Timeline Notes
          </div>
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Document discrepancies, suspect alibi conflicts, and critical timeline markers here..."
            rows={14}
            className="w-full bg-obsidian-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-forensic-amber focus:ring-1 focus:ring-forensic-amber resize-none"
          />
          <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Auto-synced to current case session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

