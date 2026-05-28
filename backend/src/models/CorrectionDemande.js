import mongoose from 'mongoose';

const correctiondemandeSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  typeCorrection: { type: String },
  ancienneValeur: [String],
  nouvelleValeur: [String],
  justification: { type: String },
  commentaire: { type: String },
  statut: { type: String },
  dateCreation: { type: Date },
  dateTraitement: { type: Date },
  motifRefus: { type: String },
  documentsJustificatifs: [String],
}, {
  timestamps: true
});

const CorrectionDemande = mongoose.model('CorrectionDemande', correctiondemandeSchema);
export default CorrectionDemande;
