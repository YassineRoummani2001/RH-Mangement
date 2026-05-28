import mongoose from 'mongoose';

const attestationSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  type: { type: String },
  statut: { type: String },
  dateDemande: { type: Date },
  dateGeneration: { type: Date },
  pdfPath: { type: String },
  signatureChef: { type: Boolean },
  signatureRH: { type: Boolean },
}, {
  timestamps: true
});

const Attestation = mongoose.model('Attestation', attestationSchema);
export default Attestation;
