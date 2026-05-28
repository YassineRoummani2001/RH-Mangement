import mongoose from 'mongoose';

const affectationSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRH' },
  poste: { type: String },
  dateDebut: { type: Date },
  dateFin: { type: Date },
}, {
  timestamps: true
});

const Affectation = mongoose.model('Affectation', affectationSchema);
export default Affectation;
