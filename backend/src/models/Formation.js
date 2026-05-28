import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema({
  titre: { type: String },
  description: { type: String },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  lieu: { type: String },
  capacite: { type: Number },
  statut: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employe' }],
}, {
  timestamps: true
});

const Formation = mongoose.model('Formation', formationSchema);
export default Formation;
