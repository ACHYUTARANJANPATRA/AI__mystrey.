import React from 'react';
import { Activity, ShieldAlert, Heart, User, CheckCircle } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function SuspectDossierCard({ suspect, currentStress = 20, isCracked = false }) {
  const { activeCase, selectedSuspectId, setSelectedSuspect } = useCaseStore();

  const getStressColor = (stress) => {
    if (stress >= 75) return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (stress >= 50) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  };

  return (
    <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Suspect Selector Pill Switcher */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-800 scrollbar-none">
          {activeCase?.suspects?.map(s => {
            const isSelected = String(s.id || s._id) === String(selectedSuspectId);
            return (
              <button
                key={s.id || s._id}
                onClick={() => setSelectedSuspect(s.id || s._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-forensic-amber text-black font-bold'
                    : 'bg-obsidian-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Suspect Avatar & Status */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-obsidian-950 mb-4">
          {suspect.avatarUrl ? (
            <img
              src={suspect.avatarUrl}
              alt={suspect.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
              MUGSHOT READY
            </div>
          )}

          {isCracked && (
            <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
              <div className="p-3 bg-red-900 border border-red-500 rounded-xl text-white font-mono font-bold text-xs uppercase animate-pulse">
                ⚠️ SUSPECT HAS CRACKED UNDER CONTRADICTION
              </div>
            </div>
          )}

          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
            INTERVIEW ROOM #1
          </div>
        </div>

        {/* Suspect Information */}
        <h2 className="text-lg font-bold text-white leading-tight">
          {suspect.name}
        </h2>
        <div className="text-xs text-forensic-cyan font-mono mb-3">
          {suspect.role}
        </div>

        {/* Stress & Heart-Rate Indicator */}
        <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Heart className={`w-3.5 h-3.5 ${currentStress >= 70 ? 'text-red-500 animate-ping' : 'text-emerald-400'}`} />
              Stress Pulse Gauge
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStressColor(currentStress)}`}>
              {currentStress}% {currentStress >= 75 ? 'CRITICAL' : currentStress >= 50 ? 'ELEVATED' : 'CALM'}
            </span>
          </div>

          {/* Stress Progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                currentStress >= 75 ? 'bg-red-500' : currentStress >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${currentStress}%` }}
            />
          </div>
        </div>

        {/* Stated Alibi */}
        <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Initial Stated Alibi</span>
            <p className="text-slate-300 italic mt-0.5">"{suspect.statedAlibi}"</p>
          </div>
          {suspect.personality && (
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Observed Personality</span>
              <p className="text-slate-400 mt-0.5">{suspect.personality}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center pt-3 border-t border-slate-800 mt-4">
        Zero-Knowledge Character Guardrails Active
      </div>
    </div>
  );
}

