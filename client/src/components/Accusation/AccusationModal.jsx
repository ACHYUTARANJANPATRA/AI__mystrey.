import React, { useState } from 'react';
import { AlertOctagon, X, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function AccusationModal() {
  const { activeCase, isAccusationOpen, closeAccusation, setVerdictResult, gameSession } = useCaseStore();

  const [accusedCulpritId, setAccusedCulpritId] = useState('');
  const [motive, setMotive] = useState('');
  const [murderMethod, setMurderMethod] = useState('');
  const [keyEvidenceId, setKeyEvidenceId] = useState('');
  const [deductionStatement, setDeductionStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAccusationOpen || !activeCase) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accusedCulpritId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/cases/${activeCase.id || activeCase._id}/accuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: gameSession?.sessionId,
          accusedCulpritId,
          motive,
          murderMethod,
          keyEvidenceId: keyEvidenceId || null,
          deductionStatement
        })
      });

      if (!res.ok) throw new Error('Failed to submit verdict');
      const verdict = await res.json();
      closeAccusation();
      setVerdictResult(verdict);
    } catch (err) {
      alert('Error evaluating accusation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-red-500/60 rounded-2xl shadow-2xl p-6 glow-crimson max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white font-mono uppercase">
                Grand Jury Indictment & Accusation
              </h2>
              <p className="text-xs text-slate-400">
                Submit your formal findings. Knox fair-play rules grade your deduction from 0–100.
              </p>
            </div>
          </div>
          <button 
            onClick={closeAccusation}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accusation Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Culprit Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Prime Accused Culprit *
            </label>
            <select
              value={accusedCulpritId}
              onChange={(e) => setAccusedCulpritId(e.target.value)}
              required
              className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
            >
              <option value="">-- Select Prime Suspect --</option>
              {activeCase.suspects?.map(s => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Motive & Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Motive for Murder
              </label>
              <input
                type="text"
                value={motive}
                onChange={(e) => setMotive(e.target.value)}
                placeholder="e.g. Corporate espionage zero-day leak exposure"
                className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Murder Weapon or Method
              </label>
              <input
                type="text"
                value={murderMethod}
                onChange={(e) => setMurderMethod(e.target.value)}
                placeholder="e.g. Concentrated potassium chloride via USB debug pin"
                className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Key Evidence Item */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Critical Piece of Evidence (Disproving the Alibi)
            </label>
            <select
              value={keyEvidenceId}
              onChange={(e) => setKeyEvidenceId(e.target.value)}
              className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-mono"
            >
              <option value="">-- Select Key Evidence Item --</option>
              {activeCase.evidence?.map(e => (
                <option key={e.id || e._id} value={e.id || e._id}>
                  [{e.type.toUpperCase()}] {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Deduction Statement Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Deduction Statement & Contradiction Argument *
            </label>
            <textarea
              value={deductionStatement}
              onChange={(e) => setDeductionStatement(e.target.value)}
              placeholder="Present your logical argument: Why does the evidence prove this suspect lied about their alibi? How does the timeline expose their guilt?"
              rows={4}
              required
              className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeAccusation}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Back to Investigation
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !accusedCulpritId || !deductionStatement.trim()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-lg shadow-red-950/50 disabled:opacity-50 transition flex items-center gap-2"
            >
              <AlertOctagon className="w-4 h-4" />
              {isSubmitting ? 'Grand Jury In Session...' : 'Deliver Official Indictment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
