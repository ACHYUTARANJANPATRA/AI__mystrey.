import { repo } from '../utils/repository.js';
import { evaluateAccusation } from './geminiService.js';

export async function processAccusation({ caseId, sessionId, accusedCulpritId, motive, murderMethod, keyEvidenceId, deductionStatement }) {
  const caseData = await repo.getCaseById(caseId);
  if (!caseData) {
    throw new Error('Case not found');
  }

  const suspects = await repo.getSuspectsByCase(caseId);
  const accusedSuspect = suspects.find(s => String(s._id) === String(accusedCulpritId));
  const keyEvidence = keyEvidenceId ? await repo.getEvidenceById(keyEvidenceId) : null;

  const evaluation = await evaluateAccusation({
    accusation: {
      accusedMotive: motive,
      murderMethod,
      keyEvidenceId,
      deductionStatement
    },
    caseData,
    suspect: accusedSuspect,
    keyEvidence
  });

  // Find true culprit suspect
  const trueKiller = suspects.find(s => s.isCulprit) || null;

  const resultPayload = {
    isCulpritCorrect: evaluation.isCulpritCorrect,
    logicScore: evaluation.logicScore,
    detectiveRank: evaluation.detectiveRank,
    feedbackSummary: evaluation.feedbackSummary,
    groundTruthBreakdown: evaluation.groundTruthBreakdown,
    fullTruthReveal: {
      culpritName: trueKiller ? trueKiller.name : 'Unknown',
      culpritRole: trueKiller ? trueKiller.role : '',
      trueMotive: trueKiller ? trueKiller.motive : '',
      murderWeaponOrMethod: caseData.groundTruth?.murderWeaponOrMethod || '',
      criticalClue: caseData.groundTruth?.criticalClueDescription || '',
      actualTimeline: caseData.groundTruth?.actualTimeline || []
    }
  };

  // Update session if sessionId was passed
  if (sessionId) {
    await repo.updateGameSession(sessionId, {
      submittedAccusation: {
        culpritId: accusedCulpritId,
        accusedMotive: motive,
        murderMethod,
        keyEvidenceId,
        deductionStatement,
        submittedAt: new Date().toISOString()
      },
      verdictResult: {
        isCulpritCorrect: evaluation.isCulpritCorrect,
        logicScore: evaluation.logicScore,
        detectiveRank: evaluation.detectiveRank,
        feedbackSummary: evaluation.feedbackSummary,
        groundTruthBreakdown: evaluation.groundTruthBreakdown
      },
      completedAt: new Date().toISOString()
    });
  }

  return resultPayload;
}

