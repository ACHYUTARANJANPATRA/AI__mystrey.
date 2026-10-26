import { useState, useEffect } from 'react';
import { useCaseStore } from '../store/useCaseStore';

export function useCasePolling() {
  const [pollingCaseId, setPollingCaseId] = useState(null);
  const { setActiveCase, setIsGenerating } = useCaseStore();

  useEffect(() => {
    if (!pollingCaseId) return;

    let isCancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/cases/${pollingCaseId}/status`);
        if (!res.ok) throw new Error('Status poll failed');
        const data = await res.json();

        setIsGenerating(true, `Stage: ${data.status.toUpperCase()}`, data.progressPercentage || 50);

        if (data.status === 'ready') {
          clearInterval(interval);
          const fullRes = await fetch(`/api/v1/cases/${pollingCaseId}`);
          const fullData = await fullRes.json();
          if (!isCancelled) {
            setActiveCase(fullData);
            setIsGenerating(false, 'Case Ready', 100);
            setPollingCaseId(null);
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setIsGenerating(false, 'Synthesis Failed', 0);
          setPollingCaseId(null);
          alert('Mystery synthesis encountered an error. Please try another scenario.');
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    }, 1500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [pollingCaseId, setActiveCase, setIsGenerating]);

  const startPolling = (caseId) => {
    setPollingCaseId(caseId);
    setIsGenerating(true, 'Initializing Logic Engine...', 15);
  };

  return { startPolling };
}
