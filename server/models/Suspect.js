import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.Mixed, required: true },
  tempId: { type: String },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  personality: { type: String, default: '' },
  statedAlibi: { type: String, default: '' },
  motive: { type: String, default: '' },
  isCulprit: { type: Boolean, default: false },
  secrets: [{ type: String }],
  knowledgeBase: {
    whatTheyKnow: [{ type: String }],
    whatTheyLieAbout: [{ type: String }],
    breakingPointThreshold: { type: Number, default: 3 }
  },
  currentStressLevel: { type: Number, default: 20 }
}, { timestamps: true });

export default mongoose.models.Suspect || mongoose.model('Suspect', SuspectSchema);
