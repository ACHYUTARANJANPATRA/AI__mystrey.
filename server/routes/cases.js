import express from 'express';
import { repo } from '../utils/repository.js';
import { generateGroundTruth, generateEvidenceDossier, generateEvidenceVisual } from '../services/geminiService.js';
import { processAccusation } from '../services/verdictService.js';

const router = express.Router();

// Helper to run multi-stage case generation in background
async function orchestrateCaseGeneration(caseId, scenarioSeed, difficulty) {
  try {
    console.log(`[Pipeline] Starting Stage 1: Ground Truth for Case ${caseId}`);
    await repo.updateCase(caseId, { progressPercentage: 20 });

    const groundTruth = await generateGroundTruth(scenarioSeed, difficulty);
    console.log(`[Pipeline] Stage 1 Complete: "${groundTruth.title}"`);

    await repo.updateCase(caseId, {
      title: groundTruth.title,
      tagline: groundTruth.tagline,
      progressPercentage: 45,
      groundTruth: {
        crimeSummary: groundTruth.crimeSummary,
        actualTimeline: groundTruth.actualTimeline,
        murderWeaponOrMethod: groundTruth.murderWeaponOrMethod,
        criticalClueDescription: groundTruth.criticalClueDescription,
        solutionExplanation: groundTruth.solutionExplanation
      }
    });

    // Save Suspects
    console.log(`[Pipeline] Persisting ${groundTruth.suspects.length} Suspects...`);
    const suspectEntities = groundTruth.suspects.map(s => ({
      caseId,
      tempId: s.tempId,
      name: s.name,
      role: s.role,
      avatarUrl: '',
      personality: s.personality,
      statedAlibi: s.statedAlibi,
      motive: s.motive,
      isCulprit: Boolean(s.isCulprit),
      secrets: s.secrets || [],
      knowledgeBase: {
        whatTheyKnow: s.whatTheyKnow || [],
        whatTheyLieAbout: s.whatTheyLieAbout || [],
        breakingPointThreshold: 3
      },
      currentStressLevel: 20
    }));

    const savedSuspects = await repo.createSuspects(suspectEntities);
    const culprit = savedSuspects.find(s => s.isCulprit);

    await repo.updateCase(caseId, {
      'groundTruth.culpritId': culprit ? culprit._id : null,
      progressPercentage: 60
    });

    // Stage 2: Evidence Dossier
    console.log(`[Pipeline] Starting Stage 2: Evidence Dossier Generation`);
    const evidenceItems = await generateEvidenceDossier(groundTruth, difficulty);

    // Save Evidence
    const evidenceEntities = evidenceItems.map(item => ({
      caseId,
      title: item.title,
      type: item.type,
      description: item.description,
      category: item.category || 'Forensics',
      isRedHerring: Boolean(item.isRedHerring),
      significance: item.significance || 'Supporting',
      payload: item.payload || {},
      isUnlocked: true
    }));

    const savedEvidence = await repo.createEvidence(evidenceEntities);
    console.log(`[Pipeline] Stage 2 Complete: ${savedEvidence.length} Evidence items stored`);

    // Stage 3: Visual evidence generation
    console.log(`[Pipeline] Stage 3: Generating Visuals...`);
    await repo.updateCase(caseId, { progressPercentage: 80 });

    for (const suspect of savedSuspects) {
      const avatarUrl = await generateEvidenceVisual(`Mugshot portrait of ${suspect.name}, ${suspect.role}`, 'portrait');
      await repo.updateSuspect(suspect._id, { avatarUrl });
    }

    // Set case to ready
    await repo.updateCase(caseId, {
      status: 'ready',
      progressPercentage: 100
    });
    console.log(`[Pipeline] Case ${caseId} is READY for investigation!`);
  } catch (error) {
    console.error(`[Pipeline Error] Case generation failed:`, error);
    await repo.updateCase(caseId, {
      status: 'failed',
      progressPercentage: 100
    });
  }
}

// 1. Generate Mystery Case
router.post('/generate', async (req, res) => {
  try {
    const { scenarioSeed, difficulty = 'Detective' } = req.body;
    if (!scenarioSeed || typeof scenarioSeed !== 'string') {
      return res.status(400).json({ error: 'scenarioSeed string is required' });
    }

    const newCase = await repo.createCase({
      title: 'Synthesizing Mystery Dossier...',
      tagline: 'Analyzing crime scene parameters...',
      scenarioSeed,
      difficulty,
      status: 'generating',
      progressPercentage: 10
    });

    // Fire generation asynchronously in background
    setTimeout(() => {
      orchestrateCaseGeneration(newCase._id, scenarioSeed, difficulty);
    }, 50);

    return res.status(202).json({
      status: 'success',
      caseId: newCase._id,
      message: 'Mystery synthesis started in background',
      pollUrl: `/api/v1/cases/${newCase._id}/status`
    });
  } catch (err) {
    console.error('Error initiating case generation:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Poll Case Status
router.get('/:id/status', async (req, res) => {
  try {
    const caseData = await repo.getCaseById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    return res.json({
      caseId: caseData._id,
      status: caseData.status,
      progressPercentage: caseData.progressPercentage || (caseData.status === 'ready' ? 100 : 30)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Fetch Case Brief & Evidence (Public Redacted View)
router.get('/:id', async (req, res) => {
  try {
    const caseData = await repo.getCaseById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const suspects = await repo.getSuspectsByCase(caseData._id);
    const evidence = await repo.getEvidenceByCase(caseData._id);
    const session = await repo.getOrCreateGameSession(caseData._id, req.query.playerId || 'detective-1');

    // REDACT SECRET DATA: Exclude groundTruth, isCulprit, secrets, whatTheyLieAbout
    const redactedSuspects = suspects.map(s => ({
      id: s._id,
      _id: s._id,
      name: s.name,
      role: s.role,
      avatarUrl: s.avatarUrl,
      personality: s.personality,
      statedAlibi: s.statedAlibi,
      motive: s.motive,
      currentStressLevel: s.currentStressLevel || 20
    }));

    const formattedEvidence = evidence.map(e => ({
      id: e._id,
      _id: e._id,
      title: e.title,
      type: e.type,
      category: e.category,
      description: e.description,
      significance: e.significance,
      payload: e.payload,
      discoveredAt: e.discoveredAt,
      isUnlocked: e.isUnlocked
    }));

    return res.json({
      id: caseData._id,
      _id: caseData._id,
      title: caseData.title,
      tagline: caseData.tagline,
      crimeSummary: caseData.groundTruth?.crimeSummary || 'Under investigation',
      difficulty: caseData.difficulty,
      status: caseData.status,
      suspects: redactedSuspects,
      evidence: formattedEvidence,
      session: {
        sessionId: session._id,
        notes: session.notes,
        pinnedEvidenceIds: session.pinnedEvidenceIds || [],
        interrogationHistory: session.interrogationHistory || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit Accusation / Close Case
router.post('/:id/accuse', async (req, res) => {
  try {
    const { sessionId, accusedCulpritId, motive, murderMethod, keyEvidenceId, deductionStatement } = req.body;

    if (!accusedCulpritId) {
      return res.status(400).json({ error: 'accusedCulpritId is required' });
    }

    const verdict = await processAccusation({
      caseId: req.params.id,
      sessionId,
      accusedCulpritId,
      motive: motive || '',
      murderMethod: murderMethod || '',
      keyEvidenceId: keyEvidenceId || null,
      deductionStatement: deductionStatement || ''
    });

    return res.json(verdict);
  } catch (err) {
    console.error('Error submitting accusation:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Detective Notes & Pin Evidence
router.post('/:id/notes', async (req, res) => {
  try {
    const { sessionId, notes, pinnedEvidenceIds } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const updated = await repo.updateGameSession(sessionId, {
      notes: notes !== undefined ? notes : '',
      pinnedEvidenceIds: pinnedEvidenceIds || []
    });

    return res.json({ success: true, session: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. List Recent Cases
router.get('/', async (req, res) => {
  try {
    const cases = await repo.listCases();
    res.json(cases.map(c => ({
      id: c._id,
      title: c.title,
      tagline: c.tagline,
      difficulty: c.difficulty,
      status: c.status,
      createdAt: c.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Seed Instant Demo Case
router.post('/seed-demo', async (req, res) => {
  try {
    const seed = 'A prominent cyber-security CEO found dead in a hermetically sealed Faraday room with a flash drive in his throat.';
    const newCase = await repo.createCase({
      title: 'Synthesizing Faraday Protocol...',
      tagline: 'Air-gapped and breathless.',
      scenarioSeed: seed,
      difficulty: 'Detective',
      status: 'generating',
      progressPercentage: 10
    });

    // Execute generation immediately
    await orchestrateCaseGeneration(newCase._id, seed, 'Detective');
    const created = await repo.getCaseById(newCase._id);
    res.json({ success: true, caseId: created._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

