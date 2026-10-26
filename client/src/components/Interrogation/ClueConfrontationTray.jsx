import React from 'react';
import { Pin, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function ClueConfrontationTray({ selectedEvidenceId, onSelectEvidence }) {
  const { activeCase, pinnedEvidence } = useCaseStore();

  const evidenceItems = activeCase?.evidence || [];
  const selectedEvidence = evidenceItems.find(e => String(e.id || e._id) === String(selectedEvidenceId));

  return (
    <div className="p-3 bg-obsidian-950 border-t border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-bold text-forensic-amber uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          Confront with Physical Evidence:
        </span>
        {selectedEvidence && (
          <button
            onClick={() => onSelectEvidence(null)}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
          >
            <X className="w-3 h-3" />
            Clear selection
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {evidenceItems.map(item => {
          const isSelected = String(item.id || item._id) === String(selectedEvidenceId);
          const isPinned = pinnedEvidence.includes(item.id || item._id);

          return (
            <button
              key={item.id || item._id}
              onClick={() => onSelectEvidence(isSelected ? null : (item.id || item._id))}
              className={`p-2 rounded-lg border text-left whitespace-nowrap transition min-w-[160px] max-w-[200px] flex-shrink-0 ${
                isSelected
                  ? 'bg-amber-500/20 border-forensic-amber text-white shadow-sm'
                  : 'bg-obsidian-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-forensic-cyan uppercase">{item.type}</span>
                {isPinned && <Pin className="w-3 h-3 text-forensic-amber" />}
              </div>
              <div className="font-semibold text-xs truncate text-slate-200">
                {item.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

