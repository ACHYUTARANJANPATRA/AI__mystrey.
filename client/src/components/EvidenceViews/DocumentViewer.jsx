import React, { useState } from 'react';
import { FileText, Pin, Stamp, AlertCircle, FileSearch, ShieldCheck } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function DocumentViewer() {
  const { activeCase, pinnedEvidence, togglePinEvidence, setActiveTab } = useCaseStore();

  const docEvidenceList = activeCase?.evidence?.filter(e => e.type === 'document' || e.type === 'image') || [];
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  if (docEvidenceList.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6 text-center text-slate-500 font-mono text-xs">
        No documentary or physical forensic items in this dossier.
      </div>
    );
  }

  const activeDoc = docEvidenceList[selectedDocIndex] || docEvidenceList[0];
  const payload = activeDoc?.payload || {};
  const isPinned = pinnedEvidence.includes(activeDoc.id || activeDoc._id);

  return (
    <div className="h-[calc(100vh-8rem)] p-4 md:p-6 bg-obsidian-950 flex flex-col lg:flex-row gap-6 items-stretch justify-center max-w-7xl mx-auto">
      
      {/* Document Selector Sidebar */}
      <div className="w-full lg:w-80 bg-obsidian-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
        <div className="text-xs font-mono font-bold text-forensic-amber uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileSearch className="w-4 h-4" />
          Forensic Artifacts ({docEvidenceList.length})
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {docEvidenceList.map((doc, idx) => {
            const isSelected = idx === selectedDocIndex;
            const docIsPinned = pinnedEvidence.includes(doc.id || doc._id);

            return (
              <button
                key={doc.id || doc._id || idx}
                onClick={() => setSelectedDocIndex(idx)}
                className={`w-full p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-slate-800 border-forensic-cyan text-white shadow-md'
                    : 'bg-obsidian-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-forensic-cyan uppercase">
                    {doc.type}
                  </span>
                  {docIsPinned && <Pin className="w-3 h-3 text-forensic-amber" />}
                </div>
                <div className="font-semibold text-xs truncate">
                  {doc.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  {doc.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Presentation Sheet */}
      <div className="flex-1 bg-obsidian-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto relative">
        
        {/* Document Top Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-forensic-amber/20 text-forensic-amber border border-forensic-amber/30">
                OFFICIAL REPORT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SIGNIFICANCE: {activeDoc.significance?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {activeDoc.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeDoc.description}
            </p>
          </div>

          <button
            onClick={() => togglePinEvidence(activeDoc.id || activeDoc._id)}
            className={`p-2 rounded-lg border transition ${
              isPinned
                ? 'bg-forensic-amber text-black border-forensic-amber'
                : 'bg-obsidian-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Pin Document"
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>

        {/* Document Content View */}
        <div className="my-6">
          {/* If it's an image evidence */}
          {activeDoc.type === 'image' && payload.imageUrl && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[380px]">
                <img
                  src={payload.imageUrl}
                  alt={activeDoc.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {payload.forensicNotes && (
                <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <div className="text-[10px] text-forensic-amber uppercase mb-1">Forensic Investigator Notes:</div>
                  {payload.forensicNotes}
                </div>
              )}
            </div>
          )}

          {/* If it's a paper / autopsy / keycard report */}
          {activeDoc.type === 'document' && (
            <div className="space-y-4">
              {/* Paper styled report sheet */}
              <div className="p-6 rounded-xl bg-obsidian-950 border border-slate-800 shadow-inner font-mono text-xs text-slate-200 leading-relaxed relative">
                
                {/* Official stamp in corner */}
                <div className="absolute top-4 right-4 rotate-12 border-2 border-red-500/70 text-red-400 text-[10px] font-bold px-2 py-1 uppercase rounded tracking-widest pointer-events-none">
                  EVIDENTIARY EXHIBIT
                </div>

                <div className="text-sm font-bold text-forensic-amber mb-3">
                  {payload.documentType || 'Forensic Examination Statement'}
                </div>

                <p className="text-slate-300 whitespace-pre-line mb-6">
                  {payload.bodyContent || activeDoc.description}
                </p>

                {/* Metadata Table */}
                {payload.metadataTable && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-forensic-cyan uppercase mb-2">
                      Access Matrix & Forensic Attributes
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(payload.metadataTable).map(([key, val], idx) => (
                        <div key={idx} className="p-2 rounded bg-obsidian-900 border border-slate-800/80 flex justify-between">
                          <span className="text-slate-400">{key}:</span>
                          <span className="text-slate-100 font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Chain of Custody ID: {activeDoc.id || activeDoc._id}
          </div>
          <button
            onClick={() => setActiveTab('interrogation')}
            className="px-4 py-2 rounded-lg bg-forensic-cyan hover:bg-cyan-400 text-black text-xs font-mono font-semibold transition"
          >
            Confront Suspect with Document
          </button>
        </div>
      </div>
    </div>
  );
}
