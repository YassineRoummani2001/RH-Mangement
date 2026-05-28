import mongoose from 'mongoose';

const servicerhSchema = new mongoose.Schema({
  nom: { type: String },
  description: { type: String },
  chefService: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  employes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employe' }],
}, {
  timestamps: true
});

const ServiceRH = mongoose.model('ServiceRH', servicerhSchema);
export default ServiceRH;
