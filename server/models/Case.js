import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  scenarioSeed: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Rookie', 'Detective', 'Sherlock'],
    default: 'Detective'
  },
  status: {
    type: String,
    enum: ['generating', 'ready', 'archived', 'failed'],
    default: 'generating'
  },
  progressPercentage: { type: Number, default: 0 },
  groundTruth: {
    culpritId: { type: mongoose.Schema.Types.Mixed },
    crimeSummary: { type: String },
    actualTimeline: [
      {
        time: { type: String },
        event: { type: String },
        involvedSuspects: [{ type: String }]
      }
    ],
    murderWeaponOrMethod: { type: String },
    criticalClueId: { type: mongoose.Schema.Types.Mixed },
    criticalClueDescription: { type: String },
    solutionExplanation: { type: String }
  }
}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
