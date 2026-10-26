import { create } from 'zustand';

export const useCaseStore = create((set, get) => ({
  activeCase: null,
  gameSession: null,
  activeTab: 'corkboard', // 'corkboard' | 'whatsapp' | 'cctv' | 'documents' | 'interrogation'
  selectedSuspectId: null,
  pinnedEvidence: [],
  notes: '',
  isGenerating: false,
  generationStage: '',
  generationProgress: 0,
  isScenarioModalOpen: false,
  isAccusationOpen: false,
  isVerdictOpen: false,
  verdictResult: null,

  setActiveCase: (caseData) => {
    const defaultSuspect = caseData?.suspects?.[0]?.id || caseData?.suspects?.[0]?._id || null;
    set({
      activeCase: caseData,
      selectedSuspectId: defaultSuspect,
      pinnedEvidence: caseData?.session?.pinnedEvidenceIds || [],
      notes: caseData?.session?.notes || '',
      gameSession: caseData?.session || null
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedSuspect: (suspectId) => set({ selectedSuspectId: suspectId }),

  togglePinEvidence: (evidenceId) => {
    const pinned = get().pinnedEvidence;
    const isPinned = pinned.includes(evidenceId);
    const updated = isPinned
      ? pinned.filter(id => id !== evidenceId)
      : [...pinned, evidenceId];
    
    set({ pinnedEvidence: updated });

    // Sync to backend if session exists
    const session = get().gameSession;
    const activeCase = get().activeCase;
    if (session?.sessionId && activeCase?.id) {
      fetch(`/api/v1/cases/${activeCase.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          notes: get().notes,
          pinnedEvidenceIds: updated
        })
      }).catch(err => console.warn('Sync pin failed', err));
    }
  },

  updateNotes: (text) => {
    set({ notes: text });
    const session = get().gameSession;
    const activeCase = get().activeCase;
    if (session?.sessionId && activeCase?.id) {
      fetch(`/api/v1/cases/${activeCase.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          notes: text,
          pinnedEvidenceIds: get().pinnedEvidence
        })
      }).catch(err => console.warn('Sync notes failed', err));
    }
  },

  setIsGenerating: (isGenerating, stage = '', progress = 0) => set({
    isGenerating,
    generationStage: stage,
    generationProgress: progress
  }),

  openScenarioModal: () => set({ isScenarioModalOpen: true }),
  closeScenarioModal: () => set({ isScenarioModalOpen: false }),

  openAccusation: () => set({ isAccusationOpen: true }),
  closeAccusation: () => set({ isAccusationOpen: false }),

  setVerdictResult: (result) => set({ verdictResult: result, isVerdictOpen: true }),
  closeVerdict: () => set({ isVerdictOpen: false })
}));

