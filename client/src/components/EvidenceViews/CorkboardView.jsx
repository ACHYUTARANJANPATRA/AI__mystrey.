import React from 'react';
import { Pin, ArrowRight, AlertCircle, FileSearch, ShieldAlert, Sparkles } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function CorkboardView() {
  const { activeCase, setActiveTab, setSelectedSuspect, togglePinEvidence, pinnedEvidence, openScenarioModal } = useCaseStore();

  if (!activeCase) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-obsidian-900 border border-slate-800 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-forensic-amber mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-2 font-mono">No Active Investigation</h3>
          <p className="text-xs text-slate-400 mb-6">
            Initialize an AI-architected murder mystery dossier or launch a pre-baked case to enter the Detective's Terminal.
          </p>
          <button
            onClick={openScenarioModal}
            className="px-5 py-2.5 rounded-lg bg-forensic-amber text-black font-semibold text-xs tracking-wider uppercase font-mono shadow-lg hover:bg-amber-400 transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Launch Mystery Dossier
          </button>
        </div>
      </div>
    );
  }

  const handleInterrogate = (suspectId) => {
    setSelectedSuspect(suspectId);
    setActiveTab('interrogation');
  };

  const handleInspectEvidence = (evidence) => {
    if (evidence.type === 'whatsapp') setActiveTab('whatsapp');
    else if (evidence.type === 'cctv') setActiveTab('cctv');
    else setActiveTab('documents');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] p-6 bg-obsidian-950 bg-grid-pattern relative overflow-hidden">
      
      {/* Crime Scene Overview Banner */}
      <div className="mb-8 p-5 rounded-xl bg-obsidian-900/90 border border-slate-800 shadow-lg glow-amber relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-forensic-amber" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-forensic-amber/20 text-forensic-amber border border-forensic-amber/30">
                CASE GROUND BRIEFING
              </span>
              <span className="text-xs text-slate-400 font-mono">
                DIFFICULTY: {activeCase.difficulty?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1 tracking-wide">
              {activeCase.title}
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-4xl leading-relaxed">
              {activeCase.crimeSummary}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800 text-center min-w-[140px]">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Suspects in Custody</div>
            <div className="text-lg font-bold text-forensic-cyan font-mono mt-0.5">
              {activeCase.suspects?.length || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">1 Killer • Knox Compliant</div>
          </div>
        </div>
      </div>

      {/* Visual Red Thread Header Line */}
      <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
        <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm shadow-red-500" />
        <span className="text-slate-300 font-bold uppercase tracking-wider">SUSPECT PERSONS OF INTEREST</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/60 to-transparent" />
      </div>

      {/* Suspect Polaroid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {activeCase.suspects?.map((suspect, idx) => (
          <div
            key={suspect.id || suspect._id || idx}
            className="relative bg-obsidian-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 shadow-xl transition-all duration-200 group flex flex-col justify-between"
          >
            {/* Top pushpin */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-red-700" />

            <div>
              {/* Mugshot */}
              <div className="w-full h-44 rounded-lg bg-obsidian-950 border border-slate-800 overflow-hidden mb-3 relative">
                {suspect.avatarUrl ? (
                  <img
                    src={suspect.avatarUrl}
                    alt={suspect.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                    MUGSHOT #0{idx + 1}
                  </div>
                )}
                <div className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-slate-300">
                  REF #{idx + 1}
                </div>
              </div>

              {/* Suspect details */}
              <h3 className="font-bold text-sm text-white group-hover:text-forensic-amber transition">
                {suspect.name}
              </h3>
              <div className="text-xs text-forensic-cyan font-mono mb-2">
                {suspect.role}
              </div>

              <div className="p-2.5 rounded-lg bg-obsidian-950/70 border border-slate-800/80 mb-3">
                <div className="text-[10px] text-slate-500 font-mono uppercase">Stated Alibi:</div>
                <div className="text-xs text-slate-300 italic line-clamp-3 mt-0.5">
                  "{suspect.statedAlibi}"
                </div>
              </div>
            </div>

            {/* Interrogate CTA */}
            <button
              onClick={() => handleInterrogate(suspect.id || suspect._id)}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-forensic-amber hover:text-black text-xs font-mono font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <span>Interrogate Suspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Evidence Corkboard Grid */}
      <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
        <div className="w-3 h-3 rounded-full bg-forensic-amber shadow-sm shadow-amber-500" />
        <span className="text-slate-300 font-bold uppercase tracking-wider">RECOVERED FORENSIC DOSSIER & CLUES</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-forensic-amber/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeCase.evidence?.map((item, idx) => {
          const isPinned = pinnedEvidence.includes(item.id || item._id);

          return (
            <div
              key={item.id || item._id || idx}
              className={`relative bg-obsidian-900 border rounded-xl p-4 shadow-xl transition-all duration-200 flex flex-col justify-between ${
                isPinned ? 'border-forensic-amber ring-1 ring-forensic-amber/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    item.type === 'whatsapp'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : item.type === 'cctv'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {item.type?.toUpperCase()} • {item.category}
                  </span>

                  <button
                    onClick={() => togglePinEvidence(item.id || item._id)}
                    className={`p-1.5 rounded-lg border transition ${
                      isPinned 
                        ? 'bg-forensic-amber text-black border-forensic-amber' 
                        : 'bg-obsidian-950 text-slate-500 border-slate-800 hover:text-white'
                    }`}
                    title={isPinned ? 'Unpin Clue' : 'Pin to Board'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-sm text-white mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => handleInspectEvidence(item)}
                className="w-full py-2 px-3 rounded-lg bg-obsidian-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-forensic-cyan transition flex items-center justify-center gap-1.5"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Examine Dossier View</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
