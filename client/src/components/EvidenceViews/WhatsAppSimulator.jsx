import React, { useState } from 'react';
import { MessageSquare, Pin, Phone, Video, MoreVertical, CheckCheck, Trash2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function WhatsAppSimulator() {
  const { activeCase, pinnedEvidence, togglePinEvidence, setActiveTab } = useCaseStore();

  const chatEvidenceList = activeCase?.evidence?.filter(e => e.type === 'whatsapp') || [];
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);

  const activeEvidence = chatEvidenceList[selectedChatIndex] || null;
  const isPinned = activeEvidence ? pinnedEvidence.includes(activeEvidence.id || activeEvidence._id) : false;

  if (chatEvidenceList.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6 text-center text-slate-500 font-mono text-xs">
        No recovered WhatsApp transcripts in this case dossier.
      </div>
    );
  }

  const payload = activeEvidence?.payload || {};
  const messages = payload.messages || [];

  return (
    <div className="h-[calc(100vh-8rem)] p-4 md:p-6 bg-obsidian-950 flex flex-col md:flex-row gap-4 items-center justify-center">
      
      {/* Smartphone Mock Frame */}
      <div className="w-full max-w-md h-full max-h-[720px] bg-[#0b141a] rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Phone Top Speaker & Camera Notch */}
        <div className="h-5 bg-black flex items-center justify-center relative">
          <div className="w-16 h-3 bg-slate-900 rounded-full" />
        </div>

        {/* WhatsApp App Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-white leading-tight">
                {payload.chatGroupTitle || activeEvidence.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {payload.participants?.join(', ') || 'End-to-end encrypted'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => togglePinEvidence(activeEvidence.id || activeEvidence._id)}
              className={`p-1.5 rounded-full transition ${isPinned ? 'text-forensic-amber bg-amber-500/20' : 'hover:text-white'}`}
              title="Pin Evidence"
            >
              <Pin className="w-4 h-4" />
            </button>
            <Phone className="w-4 h-4 opacity-50 cursor-not-allowed" />
            <MoreVertical className="w-4 h-4 opacity-70" />
          </div>
        </div>

        {/* WhatsApp Chat Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        >
          {/* Encryption Notice */}
          <div className="text-center my-2">
            <span className="inline-block px-3 py-1 rounded-md bg-[#182229] border border-slate-800 text-[10px] text-amber-300 font-mono shadow-sm">
              🔒 Forensic Extraction: Messages synced from suspect device.
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg, idx) => {
            const isDeleted = msg.isDeleted;

            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-lg p-2.5 shadow-sm text-xs leading-relaxed relative ${
                  msg.sender?.toLowerCase().includes('dr.') || idx % 2 === 0
                    ? 'ml-auto bg-[#005c4b] text-slate-100 rounded-tr-none'
                    : 'mr-auto bg-[#202c33] text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Sender Name */}
                <div className="font-bold text-[11px] text-emerald-300 mb-0.5">
                  {msg.sender}
                </div>

                {/* Content */}
                {isDeleted ? (
                  <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>This message was deleted</span>
                  </div>
                ) : (
                  <div>{msg.content}</div>
                )}

                {/* Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-300/80 mt-1 self-end">
                  <span>{msg.timestamp}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Phone Bottom Footer Mock */}
        <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-slate-800 text-xs text-slate-500 font-mono">
          <span className="w-full text-center text-[10px]">
            [READ-ONLY FORENSIC DUMP • LOG TAMPERING PROHIBITED]
          </span>
        </div>
      </div>

      {/* Forensic Inspection Metadata Panel */}
      <div className="w-full max-w-sm bg-obsidian-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-forensic-amber font-mono text-xs font-bold uppercase mb-2">
            <ShieldAlert className="w-4 h-4" />
            Digital Forensics Memo
          </div>
          <h3 className="text-base font-bold text-white mb-2">{activeEvidence.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {activeEvidence.description}
          </p>

          <div className="space-y-2 p-3 bg-obsidian-950 rounded-lg border border-slate-800 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Category:</span>
              <span className="text-slate-200">{activeEvidence.category}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Significance:</span>
              <span className="text-forensic-amber font-semibold">{activeEvidence.significance}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Deleted Messages:</span>
              <span className="text-red-400 font-semibold">
                {messages.filter(m => m.isDeleted).length} Found
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => togglePinEvidence(activeEvidence.id || activeEvidence._id)}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 ${
              isPinned ? 'bg-forensic-amber text-black' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{isPinned ? 'Evidence Pinned' : 'Pin Evidence'}</span>
          </button>
          <button
            onClick={() => setActiveTab('interrogation')}
            className="flex-1 py-2 rounded-lg bg-forensic-cyan hover:bg-cyan-400 text-black text-xs font-mono font-semibold transition"
          >
            Confront Suspect
          </button>
        </div>
      </div>
    </div>
  );
}
