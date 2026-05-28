import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const attestationSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  type: { type: String },
  statut: { type: String },
  dateDemande: { type: Date },
  dateGeneration: { type: Date },
  pdfPath: { type: String },
  signatureChef: { type: Boolean },
  signatureRH: { type: Boolean },
}, { timestamps: true });

const EmployeSchema = new mongoose.Schema({
  prenom: String,
  nom: String,
});

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhmangement');
    console.log('Connected to MongoDB');

    const Attestation = mongoose.models.Attestation || mongoose.model('Attestation', attestationSchema);
    const Employe = mongoose.models.Employe || mongoose.model('Employe', EmployeSchema);

    const employees = await Employe.find().limit(3);
    if (employees.length === 0) {
      console.log('No employees found, please create an employee first');
      process.exit(1);
    }

    const attestations = [
      {
        employe: employees[0]._id,
        type: 'travail', // Maps to Attestation de Travail
        statut: 'GENEREE',
        dateDemande: new Date(Date.now() - 86400000 * 2),
      },
      {
        employe: employees[0]._id,
        type: 'salaire', // Maps to Attestation de Salaire
        statut: 'SIGNEE',
        signatureRH: true,
        dateDemande: new Date(Date.now() - 86400000 * 5),
        dateGeneration: new Date(Date.now() - 86400000 * 4),
      },
      {
        employe: employees[1 % employees.length]._id,
        type: 'administratif', // Maps to Bulletin de Paie
        statut: 'EN_ATTENTE',
        dateDemande: new Date(),
      },
      {
        employe: employees[2 % employees.length]._id,
        type: 'travail',
        statut: 'SIGNEE',
        signatureRH: true,
        dateDemande: new Date(Date.now() - 86400000 * 10),
      },
      {
        employe: employees[0]._id,
        type: 'administratif',
        statut: 'SIGNEE',
        signatureRH: true,
        dateDemande: new Date(Date.now() - 86400000 * 30),
      }
    ];

    await Attestation.insertMany(attestations);
    console.log('Successfully inserted 5 attestations');

    // Also update any existing incorrect types
    await Attestation.updateMany({ type: 'Attestation de Travail' }, { $set: { type: 'travail' } });
    await Attestation.updateMany({ type: 'Attestation de Salaire' }, { $set: { type: 'salaire' } });
    await Attestation.updateMany({ type: 'Bulletin de Paie' }, { $set: { type: 'administratif' } });
    console.log('Fixed existing attestation types');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
