import { v4 as uuidv4 } from 'uuid';
import Case from '../models/Case.js';
import Suspect from '../models/Suspect.js';
import Evidence from '../models/Evidence.js';
import GameSession from '../models/GameSession.js';
import { isMemoryMode, memoryStore } from './db.js';

export const repo = {
  // CASES
  async createCase(data) {
    if (isMemoryMode()) {
      const newCase = {
        _id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.data.cases.push(newCase);
      memoryStore.save();
      return newCase;
    }
    return await Case.create(data);
  },

  async getCaseById(id) {
    if (isMemoryMode()) {
      return memoryStore.data.cases.find(c => String(c._id) === String(id)) || null;
    }
    return await Case.findById(id).lean();
  },

  async updateCase(id, updateData) {
    if (isMemoryMode()) {
      const idx = memoryStore.data.cases.findIndex(c => String(c._id) === String(id));
      if (idx !== -1) {
        memoryStore.data.cases[idx] = {
          ...memoryStore.data.cases[idx],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        memoryStore.save();
        return memoryStore.data.cases[idx];
      }
      return null;
    }
    return await Case.findByIdAndUpdate(id, updateData, { new: true }).lean();
  },

  async listCases() {
    if (isMemoryMode()) {
      return [...memoryStore.data.cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return await Case.find().sort({ createdAt: -1 }).lean();
  },

  // SUSPECTS
  async createSuspects(suspectsList) {
    if (isMemoryMode()) {
      const created = suspectsList.map(s => ({
        _id: uuidv4(),
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      memoryStore.data.suspects.push(...created);
      memoryStore.save();
      return created;
    }
    return await Suspect.insertMany(suspectsList);
  },

  async getSuspectsByCase(caseId) {
    if (isMemoryMode()) {
      return memoryStore.data.suspects.filter(s => String(s.caseId) === String(caseId));
    }
    return await Suspect.find({ caseId }).lean();
  },

  async getSuspectById(id) {
    if (isMemoryMode()) {
      return memoryStore.data.suspects.find(s => String(s._id) === String(id)) || null;
    }
    return await Suspect.findById(id).lean();
  },

  async updateSuspect(id, updateData) {
    if (isMemoryMode()) {
      const idx = memoryStore.data.suspects.findIndex(s => String(s._id) === String(id));
      if (idx !== -1) {
        memoryStore.data.suspects[idx] = {
          ...memoryStore.data.suspects[idx],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        memoryStore.save();
        return memoryStore.data.suspects[idx];
      }
      return null;
    }
    return await Suspect.findByIdAndUpdate(id, updateData, { new: true }).lean();
  },

  // EVIDENCE
  async createEvidence(evidenceList) {
    if (isMemoryMode()) {
      const created = evidenceList.map(e => ({
        _id: uuidv4(),
        ...e,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      memoryStore.data.evidence.push(...created);
      memoryStore.save();
      return created;
    }
    return await Evidence.insertMany(evidenceList);
  },

  async getEvidenceByCase(caseId) {
    if (isMemoryMode()) {
      return memoryStore.data.evidence.filter(e => String(e.caseId) === String(caseId));
    }
    return await Evidence.find({ caseId }).lean();
  },

  async getEvidenceById(id) {
    if (isMemoryMode()) {
      return memoryStore.data.evidence.find(e => String(e._id) === String(id)) || null;
    }
    return await Evidence.findById(id).lean();
  },

  // GAME SESSIONS
  async getOrCreateGameSession(caseId, playerId = 'detective-agent') {
    if (isMemoryMode()) {
      let session = memoryStore.data.gameSessions.find(
        g => String(g.caseId) === String(caseId) && g.playerId === playerId
      );
      if (!session) {
        session = {
          _id: uuidv4(),
          caseId,
          playerId,
          notes: '',
          pinnedEvidenceIds: [],
          interrogationHistory: [],
          startedAt: new Date().toISOString()
        };
        memoryStore.data.gameSessions.push(session);
        memoryStore.save();
      }
      return session;
    }

    let session = await GameSession.findOne({ caseId, playerId }).lean();
    if (!session) {
      session = await GameSession.create({ caseId, playerId });
      session = session.toObject();
    }
    return session;
  },

  async updateGameSession(id, updateData) {
    if (isMemoryMode()) {
      const idx = memoryStore.data.gameSessions.findIndex(s => String(s._id) === String(id));
      if (idx !== -1) {
        memoryStore.data.gameSessions[idx] = {
          ...memoryStore.data.gameSessions[idx],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        memoryStore.save();
        return memoryStore.data.gameSessions[idx];
      }
      return null;
    }
    return await GameSession.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }
};
