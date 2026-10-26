import React, { useState } from 'react';
import { Video, Pin, Play, Pause, RotateCcw, ZoomIn, ShieldCheck, Film, AlertTriangle } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function CCTVViewer() {
  const { activeCase, pinnedEvidence, togglePinEvidence, setActiveTab } = useCaseStore();
  const cctvEvidenceList = activeCase?.evidence?.filter(e => e.type === 'cctv') || [];

  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (cctvEvidenceList.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6 text-center text-slate-500 font-mono text-xs">
        No CCTV surveillance logs recovered for this case.
      </div>
    );
  }

  const cctv = cctvEvidenceList[0];
  const payload = cctv.payload || {};
  const frames = payload.frames || [];
  const currentFrame = frames[activeFrameIndex] || null;
  const isPinned = pinnedEvidence.includes(cctv.id || cctv._id);

  return (
    <div className="h-[calc(100vh-8rem)] p-4 md:p-6 bg-obsidian-950 flex flex-col lg:flex-row gap-5 items-stretch justify-center max-w-7xl mx-auto">
      
      {/* CCTV Monitor Shell */}
      <div className="flex-1 bg-obsidian-900 border-2 border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col justify-between glow-cyan relative overflow-hidden">
        
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 crt-overlay pointer-events-none z-20" />

        {/* Monitor Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-bold tracking-widest uppercase">
              LIVE SURVEILLANCE FEED // ARCHIVE
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-forensic-cyan">{payload.cameraLocation || 'CAM 04 - VAULT CORRIDOR'}</span>
            <button
              onClick={() => togglePinEvidence(cctv.id || cctv._id)}
              className={`p-1.5 rounded transition ${isPinned ? 'text-forensic-amber' : 'hover:text-white'}`}
              title="Pin CCTV Clue"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Frame Display */}
        <div className="relative flex-1 my-3 bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center min-h-[360px]">
          {currentFrame ? (
            <img
              src={currentFrame.imageUrl}
              alt="CCTV Frame"
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          ) : (
            <div className="text-xs font-mono text-slate-500">
              NO VIDEO SIGNAL DETECTED
            </div>
          )}

          {/* Timestamp HUD Stamp */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-slate-700 text-xs font-mono text-forensic-amber z-10">
            TIME: {currentFrame?.timestamp || payload.timeWindow || '21:55:18'}
          </div>

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-black border border-slate-700 text-slate-300 z-10 transition"
            title="Toggle Forensic Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Video Scrubber & Controls */}
        <div className="bg-obsidian-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Frame: #{activeFrameIndex + 1} of {frames.length || 1}</span>
            <span>{currentFrame?.description}</span>
          </div>

          {/* Frame Buttons / Scrubber */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="flex-1 flex gap-2">
              {frames.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFrameIndex(idx)}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono transition border ${
                    activeFrameIndex === idx
                      ? 'bg-forensic-cyan text-black font-bold border-forensic-cyan'
                      : 'bg-obsidian-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {f.timestamp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Surveillance Transcript & Forensics Report */}
      <div className="w-full lg:w-96 bg-obsidian-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-forensic-cyan font-mono text-xs font-bold uppercase mb-2">
            <Film className="w-4 h-4" />
            Security Motion Analysis
          </div>
          <h3 className="text-base font-bold text-white mb-2">{cctv.title}</h3>
          
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800 mb-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Time Window</div>
            <div className="text-xs text-forensic-amber font-mono font-bold">
              {payload.timeWindow || '21:45 - 22:15'}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Surveillance Transcript Logs
          </div>
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed max-h-56 overflow-y-auto">
            {payload.videoTranscript || cctv.description}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => togglePinEvidence(cctv.id || cctv._id)}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 ${
              isPinned ? 'bg-forensic-amber text-black' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{isPinned ? 'Frame Pinned' : 'Pin to Board'}</span>
          </button>
          <button
            onClick={() => setActiveTab('interrogation')}
            className="flex-1 py-2 rounded-lg bg-forensic-cyan hover:bg-cyan-400 text-black text-xs font-mono font-semibold transition"
          >
            Confront Alibi
          </button>
        </div>
      </div>
    </div>
  );
}
