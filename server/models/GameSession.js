import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.Mixed, required: true },
  playerId: { type: String, required: true },
  notes: { type: String, default: '' },
  pinnedEvidenceIds: [{ type: mongoose.Schema.Types.Mixed }],
  interrogationHistory: [
    {
      suspectId: { type: mongoose.Schema.Types.Mixed },
      messages: [
        {
          role: { type: String, enum: ['user', 'suspect'] },
          content: { type: String },
          timestamp: { type: Date, default: Date.now }
        }
      ]
    }
  ],
  submittedAccusation: {
    culpritId: { type: mongoose.Schema.Types.Mixed },
    accusedMotive: { type: String },
    murderMethod: { type: String },
    keyEvidenceId: { type: mongoose.Schema.Types.Mixed },
    deductionStatement: { type: String },
    submittedAt: { type: Date }
  },
  verdictResult: {
    isCulpritCorrect: { type: Boolean },
    logicScore: { type: Number },
    detectiveRank: { type: String },
    feedbackSummary: { type: String },
    groundTruthBreakdown: { type: String }
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);

