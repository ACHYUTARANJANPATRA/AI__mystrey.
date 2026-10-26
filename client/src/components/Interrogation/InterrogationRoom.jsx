import React, { useState, useRef, useEffect } from 'react';
import { Send, User, ShieldAlert, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';
import { useInterrogationSocket } from '../../hooks/useInterrogationSocket';
import SuspectDossierCard from './SuspectDossierCard';
import ClueConfrontationTray from './ClueConfrontationTray';

export default function InterrogationRoom() {
  const { activeCase, selectedSuspectId, gameSession } = useCaseStore();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const messagesEndRef = useRef(null);

  const { isConnected, isTyping, messages, stressLevels, sendMessage } = useInterrogationSocket(
    activeCase?.id || activeCase?._id,
    gameSession?.sessionId
  );

  const currentSuspect = activeCase?.suspects?.find(
    s => String(s.id || s._id) === String(selectedSuspectId)
  ) || activeCase?.suspects?.[0];

  const currentStress = (selectedSuspectId && stressLevels[selectedSuspectId]) !== undefined
    ? stressLevels[selectedSuspectId]
    : currentSuspect?.currentStressLevel || 20;

  const hasCracked = messages.some(m => m.cracked);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    sendMessage(inputMessage, selectedEvidenceId);
    setInputMessage('');
    setSelectedEvidenceId(null);
  };

  const handleQuickQuestion = (q) => {
    setInputMessage(q);
  };

  if (!currentSuspect) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-slate-500 font-mono text-xs">
        No suspect selected for interrogation.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] p-4 md:p-6 bg-obsidian-950 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Left Column: Suspect Dossier & Stress Gauge */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <SuspectDossierCard
          suspect={currentSuspect}
          currentStress={currentStress}
          isCracked={hasCracked}
        />
      </div>

      {/* Right Column: Live Interrogation Dialogue Terminal */}
      <div className="flex-1 bg-obsidian-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-obsidian-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-300 font-bold uppercase">
              INTERROGATION TRANSCRIPT // {currentSuspect.name?.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            {isConnected ? 'LIVE CHANNEL ACTIVE' : 'CONNECTING...'}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Initial Opening Note */}
          <div className="text-center my-2">
            <span className="inline-block px-3 py-1 rounded bg-obsidian-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
              Detective has entered Interrogation Room 1. The suspect is seated and awaiting questioning.
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isUser
                    ? 'bg-forensic-amber text-black'
                    : 'bg-slate-800 text-forensic-cyan border border-slate-700'
                }`}>
                  {isUser ? 'DET' : 'SUS'}
                </div>

                <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-800 border border-slate-700 text-white rounded-tr-none'
                    : msg.cracked
                    ? 'bg-red-950/80 border border-red-500 text-red-200 font-semibold rounded-tl-none glow-crimson'
                    : 'bg-obsidian-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="font-mono text-[10px] mb-1 text-slate-400 flex items-center justify-between gap-4">
                    <span>{isUser ? 'Detective' : currentSuspect.name}</span>
                    <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>

                  <div>{msg.content}</div>
                </div>
              </div>
            );
          })}

          {/* Suspect Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-forensic-cyan border border-slate-700 flex items-center justify-center font-bold text-xs">
                SUS
              </div>
              <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forensic-cyan animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-forensic-cyan animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-forensic-cyan animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-500 ml-1">Suspect is reacting...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Strategic Quick Prompts */}
        <div className="px-4 py-2 bg-obsidian-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">Suggested:</span>
          {[
            "Where exactly were you between 21:40 and 22:15?",
            "Can anyone corroborate your whereabouts?",
            "Why does the security access record contradict your story?",
            "What did you speak with the victim about earlier that evening?"
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Clue Confrontation Tray */}
        <ClueConfrontationTray
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={setSelectedEvidenceId}
        />

        {/* Chat Input Field */}
        <form onSubmit={handleSubmit} className="p-4 bg-obsidian-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Question ${currentSuspect.name} or press them on inconsistencies...`}
            maxLength={250}
            className="flex-1 bg-obsidian-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forensic-cyan focus:ring-1 focus:ring-forensic-cyan font-mono"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-forensic-cyan hover:bg-cyan-400 text-black font-bold text-xs font-mono disabled:opacity-40 transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
          >
            <span>Interrogate</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

