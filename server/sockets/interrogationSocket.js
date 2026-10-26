import { repo } from '../utils/repository.js';
import { interrogateSuspectAI } from '../services/geminiService.js';
import { sanitizeInterrogationMessage } from '../middleware/interrogationGuard.js';

export function setupInterrogationSocket(io) {
  io.on('connection', async (socket) => {
    const { caseId, sessionId } = socket.handshake.query;
    console.log(`[Socket] Detective connected. Case: ${caseId}, Session: ${sessionId}`);

    if (caseId) {
      socket.join(`case_${caseId}`);
    }

    // EVENT: Interrogate Suspect
    socket.on('interrogate_suspect', async (data) => {
      try {
        const { suspectId, message, presentedEvidenceId } = data;

        if (!suspectId || !message) {
          return socket.emit('interrogation_error', { message: 'Missing suspectId or message' });
        }

        // 1. Sanitize & check prompt injection guardrails
        const guardResult = sanitizeInterrogationMessage(message);
        if (guardResult.isBlocked) {
          return socket.emit('suspect_message', {
            suspectId,
            content: "...Excuse me? Are you mumbling in system code, Detective? Ask me an actual question about the case or stop wasting my time.",
            stressLevel: 25,
            timestamp: new Date().toISOString()
          });
        }

        // 2. Fetch Suspect & Case context
        const suspect = await repo.getSuspectById(suspectId);
        if (!suspect) {
          return socket.emit('interrogation_error', { message: 'Suspect not found' });
        }

        const caseData = await repo.getCaseById(caseId || suspect.caseId);
        const presentedEvidence = presentedEvidenceId ? await repo.getEvidenceById(presentedEvidenceId) : null;

        // 3. Emit typing indicator
        socket.emit('suspect_typing', { suspectId, isTyping: true });

        // Retrieve conversation history from game session
        let conversationHistory = [];
        if (sessionId) {
          const session = await repo.getOrCreateGameSession(caseId || suspect.caseId);
          const historyEntry = session.interrogationHistory?.find(
            h => String(h.suspectId) === String(suspectId)
          );
          if (historyEntry) {
            conversationHistory = historyEntry.messages || [];
          }
        }

        // 4. Generate in-character response via Gemini
        const aiResponse = await interrogateSuspectAI({
          suspect,
          caseData,
          conversationHistory,
          playerMessage: guardResult.sanitized,
          presentedEvidence
        });

        // 5. Update suspect stress level
        const newStress = Math.max(0, Math.min(100, (suspect.currentStressLevel || 20) + (aiResponse.stressDelta || 5)));
        await repo.updateSuspect(suspectId, { currentStressLevel: newStress });

        // 6. Persist to session history
        if (sessionId) {
          const session = await repo.getOrCreateGameSession(caseId || suspect.caseId);
          let history = session.interrogationHistory || [];
          let suspectHistIdx = history.findIndex(h => String(h.suspectId) === String(suspectId));

          const userMsg = { role: 'user', content: guardResult.sanitized, timestamp: new Date() };
          const suspMsg = { role: 'suspect', content: aiResponse.content, timestamp: new Date() };

          if (suspectHistIdx >= 0) {
            history[suspectHistIdx].messages.push(userMsg, suspMsg);
          } else {
            history.push({
              suspectId,
              messages: [userMsg, suspMsg]
            });
          }

          await repo.updateGameSession(sessionId, { interrogationHistory: history });
        }

        // Small realistic typing delay
        setTimeout(() => {
          socket.emit('suspect_typing', { suspectId, isTyping: false });
          socket.emit('suspect_message', {
            suspectId,
            content: aiResponse.content,
            stressLevel: newStress,
            cracked: aiResponse.cracked,
            timestamp: new Date().toISOString()
          });
        }, 600);
      } catch (err) {
        console.error('[Socket] Interrogation error:', err);
        socket.emit('suspect_typing', { suspectId: data?.suspectId, isTyping: false });
        socket.emit('interrogation_error', { message: 'Interrogation transmission disrupted.' });
      }
    });

    // EVENT: Pin Evidence
    socket.on('pin_evidence', async (data) => {
      try {
        const { evidenceId } = data;
        if (!sessionId || !evidenceId) return;

        const session = await repo.getOrCreateGameSession(caseId);
        let pinned = session.pinnedEvidenceIds || [];
        const isPinned = pinned.some(id => String(id) === String(evidenceId));

        if (isPinned) {
          pinned = pinned.filter(id => String(id) !== String(evidenceId));
        } else {
          pinned.push(evidenceId);
        }

        await repo.updateGameSession(sessionId, { pinnedEvidenceIds: pinned });
        socket.emit('evidence_pinned', { evidenceId, pinned: !isPinned });
      } catch (err) {
        console.error('[Socket] Pin error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Detective disconnected from case ${caseId}`);
    });
  });
}

