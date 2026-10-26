import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, XCircle, ShieldAlert, Sparkles, X, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function VerdictReportModal() {
  const { verdictResult, isVerdictOpen, closeVerdict, openScenarioModal } = useCaseStore();

  useEffect(() => {
    if (isVerdictOpen && verdictResult?.isCulpritCorrect && verdictResult?.logicScore >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isVerdictOpen, verdictResult]);

  if (!isVerdictOpen || !verdictResult) return null;

  const isSuccess = verdictResult.isCulpritCorrect;
  const score = verdictResult.logicScore || 0;
  const rank = verdictResult.detectiveRank || 'Investigator';
  const truth = verdictResult.fullTruthReveal || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in">
      <div className={`relative w-full max-w-2xl bg-obsidian-900 border rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto ${
        isSuccess ? 'border-amber-500/60 glow-amber' : 'border-red-500/60 glow-crimson'
      }`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              isSuccess 
                ? 'bg-amber-500/10 border-amber-500/40 text-forensic-amber' 
                : 'bg-red-500/10 border-red-500/40 text-red-500'
            }`}>
              {isSuccess ? <Award className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white font-mono uppercase">
                {isSuccess ? 'Case Solved: Verdict Confirmed' : 'Case Closed: Flawed Deduction'}
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                OFFICIAL POST-MORTEM REPORT & SCORE
              </div>
            </div>
          </div>

          <button
            onClick={closeVerdict}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Rank Banner */}
        <div className="my-5 p-5 rounded-xl bg-obsidian-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-extrabold font-mono ${
              score >= 80 ? 'text-forensic-amber' : score >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {score}<span className="text-xl text-slate-500 font-normal">/100</span>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Detective Ranking</div>
              <div className="text-base font-bold text-white tracking-wide">
                {rank}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
              isSuccess ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              {isSuccess ? 'Culprit Apprehended' : 'Culprit Evaded Justice'}
            </span>
          </div>
        </div>

        {/* Evaluator Feedback */}
        <div className="mb-6 p-4 rounded-xl bg-obsidian-950/60 border border-slate-800 text-xs text-slate-200 leading-relaxed">
          <div className="text-[10px] font-mono text-forensic-cyan uppercase font-bold mb-1">
            Senior Magistrate Logic Assessment:
          </div>
          <p>{verdictResult.feedbackSummary}</p>
        </div>

        {/* Full Ground Truth Reveal */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-forensic-amber font-mono uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            The Ground Truth Reconstruction
          </h3>

          <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-mono uppercase text-[10px]">Actual Perpetrator:</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {truth.culpritName} <span className="text-slate-400 font-normal">({truth.culpritRole})</span>
              </div>
            </div>

            {truth.trueMotive && (
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px]">Actual Motive:</span>
                <p className="text-slate-300 mt-0.5">{truth.trueMotive}</p>
              </div>
            )}

            {truth.murderWeaponOrMethod && (
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px]">Forensic Execution Method:</span>
                <p className="text-slate-300 mt-0.5">{truth.murderWeaponOrMethod}</p>
              </div>
            )}

            {truth.criticalClue && (
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px]">Decisive Knox Contradiction Clue:</span>
                <p className="text-forensic-amber font-mono mt-0.5">{truth.criticalClue}</p>
              </div>
            )}

            {/* Actual Timeline */}
            {truth.actualTimeline && truth.actualTimeline.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-2">
                  True Chronological Crime Timeline:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {truth.actualTimeline.map((item, idx) => (
                    <div key={idx} className="flex gap-2 text-slate-300">
                      <span className="text-forensic-cyan font-bold min-w-[50px]">{item.time}</span>
                      <span>—</span>
                      <span className="text-slate-200">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={closeVerdict}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Review Evidence Board
          </button>

          <button
            onClick={() => {
              closeVerdict();
              openScenarioModal();
            }}
            className="px-5 py-2.5 rounded-lg bg-forensic-amber text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-amber-400 transition flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Launch Another Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}

