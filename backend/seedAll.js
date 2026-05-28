import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Employe from './src/models/Employe.js';
import ServiceRH from './src/models/ServiceRH.js';
import Absence from './src/models/Absence.js';
import Conge from './src/models/Conge.js';
import Formation from './src/models/Formation.js';
import Document from './src/models/Document.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhmangement';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Clear existing data
    await User.deleteMany();
    await Employe.deleteMany();
    await ServiceRH.deleteMany();
    await Absence.deleteMany();
    await Conge.deleteMany();
    await Formation.deleteMany();
    await Document.deleteMany();

    console.log('Old data cleared.');

    // 1. Create Services
    const rhService = await ServiceRH.create({ nom: 'Ressources Humaines', description: 'Gestion du personnel et paie' });
    const itService = await ServiceRH.create({ nom: 'Informatique', description: 'Développement et support IT' });
    const commercialService = await ServiceRH.create({ nom: 'Commercial', description: 'Ventes et relation client' });

    // 2. Create Employés
    const empAdmin = await Employe.create({
      nom: 'Admin',
      prenom: 'Super',
      matricule: 'MAT0001',
      poste: 'Directeur RH',
      grade: 'Directeur',
      echelle: '12',
      cin: 'AB123456',
      telephone: '0600000000',
      adresse: '123 Rue de la Paix, Casablanca',
      sexe: 'Homme',
      situationFamiliale: 'Marié',
      nombreEnfants: 2,
      salaire: 25000,
      service: rhService._id,
      dateRecrutement: new Date('2020-01-15'),
      statut: 'Actif'
    });

    const empAgent = await Employe.create({
      nom: 'Agent',
      prenom: 'RH',
      matricule: 'MAT0002',
      poste: 'Agent Administratif',
      grade: 'Cadre',
      echelle: '10',
      cin: 'AB654321',
      telephone: '0611111111',
      adresse: '456 Boulevard Hassan II, Rabat',
      sexe: 'Femme',
      situationFamiliale: 'Célibataire',
      salaire: 12000,
      service: rhService._id,
      dateRecrutement: new Date('2022-03-01'),
      statut: 'Actif'
    });

    const empDev = await Employe.create({
      nom: 'Dev',
      prenom: 'Senior',
      matricule: 'MAT0003',
      poste: 'Ingénieur Logiciel',
      grade: 'Ingénieur',
      echelle: '11',
      cin: 'CD987654',
      telephone: '0622222222',
      adresse: '789 Avenue Mohammed V, Tanger',
      sexe: 'Homme',
      situationFamiliale: 'Célibataire',
      salaire: 18000,
      service: itService._id,
      dateRecrutement: new Date('2021-06-15'),
      statut: 'Actif'
    });

    // Update service chefs
    await ServiceRH.findByIdAndUpdate(rhService._id, { chefService: empAdmin._id });
    await ServiceRH.findByIdAndUpdate(itService._id, { chefService: empDev._id });

    // 3. Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    await User.create({
      email: 'admin@rh.ma',
      password,
      roles: ['ROLE_ADMIN_RH', 'ROLE_EMPLOYE'],
      employe: empAdmin._id
    });

    await User.create({
      email: 'agent@rh.ma',
      password,
      roles: ['ROLE_AGENT_RH', 'ROLE_EMPLOYE'],
      employe: empAgent._id
    });

    await User.create({
      email: 'dev@it.ma',
      password,
      roles: ['ROLE_EMPLOYE'],
      employe: empDev._id
    });

    // 4. Create Absences
    await Absence.create({
      employe: empDev._id,
      dateDebut: new Date('2026-05-10'),
      dateFin: new Date('2026-05-12'),
      motif: 'Maladie',
      type: 'Justifiée',
      statut: 'Approuvée'
    });
    
    await Absence.create({
      employe: empAgent._id,
      dateDebut: new Date('2026-06-01'),
      dateFin: new Date('2026-06-02'),
      motif: 'Raison personnelle',
      type: 'Non justifiée',
      statut: 'En attente'
    });

    // 5. Create Congés
    await Conge.create({
      employe: empDev._id,
      dateDebut: new Date('2026-07-15'),
      dateFin: new Date('2026-07-30'),
      type: 'Congé annuel',
      statut: 'Approuvée'
    });

    // 6. Create Formations
    await Formation.create({
      titre: 'Formation React Avancé',
      description: 'Maîtrise des hooks, context, et Redux',
      dateDebut: new Date('2026-08-01'),
      dateFin: new Date('2026-08-05'),
      lieu: 'Salle de conférence A',
      capacite: 20,
      statut: 'Planifiée',
      participants: [empDev._id]
    });

    // 7. Create Documents
    await Document.create({
      titre: 'Contrat de travail',
      type: 'Contrat',
      fichier: 'contrat_dev.pdf',
      employe: empDev._id
    });

    console.log('Database seeded successfully with all entities!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
