import React from 'react';
import { LayoutGrid, MessageSquare, Video, FileText, UserCheck } from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';

export default function WorkspaceTabs() {
  const { activeTab, setActiveTab, activeCase } = useCaseStore();

  const tabs = [
    {
      id: 'corkboard',
      label: 'Evidence Board',
      icon: LayoutGrid,
      count: activeCase?.evidence?.length ? `${activeCase.evidence.length} Clues` : null
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Logs',
      icon: MessageSquare,
      count: activeCase?.evidence?.filter(e => e.type === 'whatsapp').length || 0
    },
    {
      id: 'cctv',
      label: 'CCTV Feeds',
      icon: Video,
      count: activeCase?.evidence?.filter(e => e.type === 'cctv').length || 0
    },
    {
      id: 'documents',
      label: 'Forensics & Reports',
      icon: FileText,
      count: activeCase?.evidence?.filter(e => e.type === 'document' || e.type === 'image').length || 0
    },
    {
      id: 'interrogation',
      label: 'Interrogation Room',
      icon: UserCheck,
      count: activeCase?.suspects?.length ? `${activeCase.suspects.length} Suspects` : null
    }
  ];

  return (
    <div className="bg-obsidian-950/80 border-b border-slate-800 px-6">
      <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium tracking-wide transition whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800/90 text-forensic-amber border border-forensic-amber/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-forensic-amber' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isActive ? 'bg-amber-500/20 text-forensic-amber' : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
