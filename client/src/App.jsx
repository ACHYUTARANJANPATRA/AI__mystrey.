import React, { useState, useEffect } from 'react';
import { useCaseStore } from './store/useCaseStore';
import TopNavigationBar from './components/Dashboard/TopNavigationBar';
import WorkspaceTabs from './components/Dashboard/WorkspaceTabs';
import DetectiveNotebook from './components/Dashboard/DetectiveNotebook';
import CorkboardView from './components/EvidenceViews/CorkboardView';
import WhatsAppSimulator from './components/EvidenceViews/WhatsAppSimulator';
import CCTVViewer from './components/EvidenceViews/CCTVViewer';
import DocumentViewer from './components/EvidenceViews/DocumentViewer';
import InterrogationRoom from './components/Interrogation/InterrogationRoom';
import ScenarioInputModal from './components/CaseGenerator/ScenarioInputModal';
import GenerationProgressHUD from './components/CaseGenerator/GenerationProgressHUD';
import AccusationModal from './components/Accusation/AccusationModal';
import VerdictReportModal from './components/Accusation/VerdictReportModal';

export default function App() {
  const { activeTab, activeCase, setActiveCase, openScenarioModal } = useCaseStore();
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Auto-load most recent case or seed the default demo case on first boot
  useEffect(() => {
    async function initCase() {
      try {
        const res = await fetch('/api/v1/cases');
        const cases = await res.json();

        if (Array.isArray(cases) && cases.length > 0) {
          const latest = cases[0];
          const fullRes = await fetch(`/api/v1/cases/${latest.id}`);
          const fullCase = await fullRes.json();
          setActiveCase(fullCase);
        } else {
          // Auto-seed first case for instant immediate gameplay
          console.log('[Init] Auto-seeding initial demo case...');
          const seedRes = await fetch('/api/v1/cases/seed-demo', { method: 'POST' });
          const seedData = await seedRes.json();
          if (seedData.caseId) {
            const caseRes = await fetch(`/api/v1/cases/${seedData.caseId}`);
            const caseData = await caseRes.json();
            setActiveCase(caseData);
          }
        }
      } catch (err) {
        console.warn('Initial case boot check:', err.message);
      } finally {
        setIsLoadingInitial(false);
      }
    }

    initCase();
  }, [setActiveCase]);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-forensic-amber selection:text-black">
      {/* Top Bar */}
      <TopNavigationBar onToggleNotebook={() => setIsNotebookOpen(!isNotebookOpen)} />

      {/* Workspace Tabs */}
      <WorkspaceTabs />

      {/* Main Investigation Workspace Area */}
      <main className="flex-1 relative">
        {activeTab === 'corkboard' && <CorkboardView />}
        {activeTab === 'whatsapp' && <WhatsAppSimulator />}
        {activeTab === 'cctv' && <CCTVViewer />}
        {activeTab === 'documents' && <DocumentViewer />}
        {activeTab === 'interrogation' && <InterrogationRoom />}
      </main>

      {/* Slide-out Detective Notebook */}
      <DetectiveNotebook
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />

      {/* Modals & HUDs */}
      <ScenarioInputModal />
      <GenerationProgressHUD />
      <AccusationModal />
      <VerdictReportModal />
    </div>
  );
}
