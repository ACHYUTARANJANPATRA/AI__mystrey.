import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['whatsapp', 'cctv', 'image', 'document', 'audio_transcript'],
    required: true
  },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Forensics', 'Digital Log', 'Witness Statement', 'Surveillance'],
    default: 'Forensics'
  },
  isRedHerring: { type: Boolean, default: false },
  significance: {
    type: String,
    enum: ['Critical', 'Supporting', 'Distraction'],
    default: 'Supporting'
  },
  payload: {
    // For 'whatsapp'
    chatGroupTitle: { type: String },
    participants: [{ type: String }],
    messages: [
      {
        sender: { type: String },
        timestamp: { type: String },
        content: { type: String },
        isDeleted: { type: Boolean, default: false },
        attachmentUrl: { type: String }
      }
    ],

    // For 'cctv'
    cameraLocation: { type: String },
    timeWindow: { type: String },
    videoTranscript: { type: String },
    frames: [
      {
        timestamp: { type: String },
        imageUrl: { type: String },
        description: { type: String }
      }
    ],

    // For 'image'
    imageUrl: { type: String },
    forensicNotes: { type: String },

    // For 'document'
    documentType: { type: String },
    bodyContent: { type: String },
    metadataTable: { type: Map, of: String }
  },
  discoveredAt: { type: Date, default: Date.now },
  isUnlocked: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Evidence || mongoose.model('Evidence', EvidenceSchema);

