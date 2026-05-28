import mongoose from 'mongoose';

const congeSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  motif: { type: String },
  statut: { type: String },
  commentaire: { type: String },
  nombreJours: { type: Number },
  justificatif: { type: String },
  signatureChef: { type: Boolean },
  signatureRH: { type: Boolean },
  motifRefus: { type: String },
}, {
  timestamps: true
});

const Conge = mongoose.model('Conge', congeSchema);
export default Conge;
