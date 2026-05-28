import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employe from './src/models/Employe.js';
import Attestation from './src/models/Attestation.js';
import AuditLog from './src/models/AuditLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhmangement';

const seedMore = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for seeding Attestations and AuditLogs');

    await Attestation.deleteMany();
    await AuditLog.deleteMany();

    const employes = await Employe.find();
    if (employes.length < 3) {
      console.error('Not enough employes to seed.');
      process.exit(1);
    }
    
    const [emp1, emp2, emp3] = employes;

    // Create Attestations
    await Attestation.create([
      {
        employe: emp1._id,
        type: 'Attestation de salaire',
        statut: 'GENEREE',
        dateDemande: new Date('2026-05-20'),
        dateGeneration: new Date('2026-05-21'),
        signatureChef: true,
        signatureRH: true
      },
      {
        employe: emp2._id,
        type: 'Attestation de travail',
        statut: 'EN_ATTENTE',
        dateDemande: new Date('2026-05-27'),
        signatureChef: true,
        signatureRH: false
      },
      {
        employe: emp3._id,
        type: 'Demande de Congé',
        statut: 'A_VALIDER',
        dateDemande: new Date('2026-05-26'),
        signatureChef: false,
        signatureRH: false
      },
      {
        employe: emp1._id,
        type: 'Certificat de Maladie',
        statut: 'SIGNEE',
        dateDemande: new Date('2026-05-15'),
        dateGeneration: new Date('2026-05-16'),
        signatureChef: true,
        signatureRH: true
      }
    ]);

    // Create Audit Logs
    await AuditLog.create([
      {
        action: 'Création Demande',
        details: 'Attestation de salaire demandée',
        user: emp1.prenom + ' ' + emp1.nom,
        date: new Date('2026-05-20')
      },
      {
        action: 'Approbation Demande',
        details: 'Attestation de salaire approuvée',
        user: 'Super Admin',
        date: new Date('2026-05-21')
      },
      {
        action: 'Ajout Employé',
        details: 'Nouvel employé ajouté: ' + emp2.nom,
        user: 'Super Admin',
        date: new Date('2026-05-10')
      }
    ]);

    console.log('Attestations and AuditLogs seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedMore();
