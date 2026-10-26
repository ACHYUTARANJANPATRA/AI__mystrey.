import React, { useState } from 'react';
import { Sparkles, Terminal, Shield, HelpCircle, X, Compass, Zap } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';
import { useCasePolling } from '../../hooks/useCasePolling';

const PRESET_SCENARIOS = [
  {
    title: "The Faraday Protocol",
    seed: "A prominent cyber-security CEO is found dead inside a hermetically sealed, air-gapped Faraday conference room with an encrypted USB probe nearby.",
    difficulty: "Detective"
  },
  {
    title: "High-Tech Vineyard Homicide",
    seed: "A celebrity viticulturist collapses during a private tasting in an automated smart-fermentation cellar; rare cryogenic nitrogen was released unexpectedly.",
    difficulty: "Detective"
  },
  {
    title: "Submarine Boardroom Murder",
    seed: "A deep-sea mining tycoon is found dead inside an observation sphere at 3,000 meters depth; the air scrubber valves were deliberately recalibrated.",
    difficulty: "Sherlock"
  },
  {
    title: "The Quantum Lab Sabotage",
    seed: "The lead quantum physicist at a secretive institute is fatally exposed to coolant leakage inside the dilution refrigerator lab with security credentials forged.",
    difficulty: "Rookie"
  }
];

export default function ScenarioInputModal() {
  const { isScenarioModalOpen, closeScenarioModal } = useCaseStore();
  const { startPolling } = useCasePolling();
  const [scenarioSeed, setScenarioSeed] = useState('');
  const [difficulty, setDifficulty] = useState('Detective');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isScenarioModalOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!scenarioSeed.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/cases/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioSeed, difficulty })
      });
      const data = await res.json();
      if (data.caseId) {
        closeScenarioModal();
        startPolling(data.caseId);
      }
    } catch (err) {
      alert('Failed to initiate case generation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/cases/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.caseId) {
        closeScenarioModal();
        startPolling(data.caseId);
      }
    } catch (err) {
      alert('Failed to launch demo: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-slate-700/60 rounded-xl shadow-2xl p-6 glow-cyan">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-forensic-cyan">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                Generate Mystery Dossier
                <span className="text-xs px-2 py-0.5 rounded bg-forensic-amber/20 text-forensic-amber border border-forensic-amber/30 uppercase font-mono">
                  Gemini Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">Specify seed scenario or select an architectural blueprint</p>
            </div>
          </div>
          <button 
            onClick={closeScenarioModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Crime Scenario Prompt / Seed
            </label>
            <textarea
              value={scenarioSeed}
              onChange={(e) => setScenarioSeed(e.target.value)}
              placeholder="e.g., A luxury superyacht anchored in Monaco loses power; the crypto founder is poisoned inside the master stateroom with only 4 passengers on board..."
              rows={3}
              required
              className="w-full bg-obsidian-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-forensic-cyan focus:ring-1 focus:ring-forensic-cyan font-mono"
            />
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Deduction Difficulty (Knox Fair-Play Matrix)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Rookie', label: 'Rookie', desc: 'Obvious contradiction & simple alibi' },
                { id: 'Detective', label: 'Detective', desc: 'Cross-evidence timeline conflict' },
                { id: 'Sherlock', label: 'Sherlock', desc: 'Subtle forensic & digital anomalies' }
              ].map(d => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-3 rounded-lg border text-left transition ${
                    difficulty === d.id
                      ? 'bg-cyan-500/10 border-forensic-cyan text-white shadow-sm'
                      : 'bg-obsidian-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center justify-between">
                    {d.label}
                    {difficulty === d.id && <span className="w-2 h-2 rounded-full bg-forensic-cyan" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Prompts */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-forensic-amber" />
              Preset Archetypes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setScenarioSeed(p.seed);
                    setDifficulty(p.difficulty);
                  }}
                  className="text-left p-2.5 rounded-lg bg-obsidian-950 border border-slate-800/80 hover:border-slate-600 transition group"
                >
                  <div className="text-xs font-semibold text-slate-300 group-hover:text-forensic-amber transition">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {p.seed}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-mono font-medium rounded-lg border border-forensic-amber/50 text-forensic-amber hover:bg-forensic-amber/10 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Instant Pre-Baked Case
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeScenarioModal}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !scenarioSeed.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-forensic-cyan to-blue-600 text-white hover:opacity-95 disabled:opacity-50 transition flex items-center gap-1.5 shadow-lg shadow-cyan-900/30"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Architecting Case...' : 'Synthesize Mystery'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

