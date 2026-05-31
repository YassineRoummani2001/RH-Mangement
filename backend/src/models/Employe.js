import mongoose from 'mongoose';

const employeSchema = new mongoose.Schema({
  // Informations personnelles
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  cin: { type: String },
  telephone: { type: String },
  adresse: { type: String },
  dateNaissance: { type: Date },
  sexe: { type: String },
  situationFamiliale: { type: String },
  photo: { type: String },

  // Informations administratives
  matricule: { type: String, required: true, unique: true },
  poste: { type: String },
  grade: { type: String },
  echelle: { type: String },
  dateRecrutement: { type: Date },
  statut: { type: String },
  salaire: { type: Number },
  contrat: { type: String, default: 'CDI' },
  localisation: { type: String, default: 'Siège Social' },
  soldeConges: { type: Number, default: 22 },
  soldeMaladie: { type: Number, default: 8 },

  // Informations familiales
  conjoint: { type: String },
  nombreEnfants: { type: Number },

  // Relations
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRH' },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

employeSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// Virtuals for relations
employeSchema.virtual('affectations', { ref: 'Affectation', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('conges', { ref: 'Conge', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('absences', { ref: 'Absence', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('attestations', { ref: 'Attestation', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('documents', { ref: 'Document', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('notifications', { ref: 'Notification', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('corrections', { ref: 'CorrectionDemande', localField: '_id', foreignField: 'employe' });
employeSchema.virtual('formations', { ref: 'Formation', localField: '_id', foreignField: 'participants' });

const Employe = mongoose.model('Employe', employeSchema);
export default Employe;
