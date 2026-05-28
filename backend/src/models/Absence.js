import mongoose from 'mongoose';

const absenceSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  type: { type: String },
  motif: { type: String },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  justificatif: { type: String },
  statut: { type: String },
}, {
  timestamps: true
});

const Absence = mongoose.model('Absence', absenceSchema);
export default Absence;
