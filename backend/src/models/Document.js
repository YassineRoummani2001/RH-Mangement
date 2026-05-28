import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  nom: { type: String },
  type: { type: String },
  path: { type: String },
  mimeType: { type: String },
  taille: { type: Number },
  uploadedAt: { type: Date },
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
