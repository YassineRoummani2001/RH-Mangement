import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Employe from './src/models/Employe.js';
import ServiceRH from './src/models/ServiceRH.js';
import Absence from './src/models/Absence.js';
import Conge from './src/models/Conge.js';
import Attestation from './src/models/Attestation.js';
import Notification from './src/models/Notification.js';
import Formation from './src/models/Formation.js';
import Affectation from './src/models/Affectation.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhmangement';

const seedDatabase = async () => {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connecté. Purge de la base de données...');

    // Nettoyage
    await Promise.all([
      User.deleteMany(),
      Employe.deleteMany(),
      ServiceRH.deleteMany(),
      Absence.deleteMany(),
      Conge.deleteMany(),
      Attestation.deleteMany(),
      Notification.deleteMany(),
      Formation.deleteMany(),
      Affectation.deleteMany()
    ]);
    console.log('Anciennes données purgées.');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Services
    console.log('Création des services...');
    const srvInfo = await ServiceRH.create({ nom: 'Informatique', description: 'Développement et Systèmes' });
    const srvRH = await ServiceRH.create({ nom: 'Ressources Humaines', description: 'Gestion du personnel' });
    const srvFin = await ServiceRH.create({ nom: 'Finance', description: 'Comptabilité et finances' });
    const srvGen = await ServiceRH.create({ nom: 'Direction Générale', description: 'Direction' });
    const services = [srvInfo, srvRH, srvFin, srvGen];

    console.log('Création des employés et utilisateurs...');
    
    // We want exactly 10 users
    const usersData = [
      { email: 'admin@rh-management.com', roles: ['ROLE_ADMIN_RH', 'ROLE_HR_MANAGER'], nom: 'Roummani', prenom: 'Yassine', poste: 'Directeur RH', service: srvRH._id },
      { email: 'secretaire@rh-management.com', roles: ['ROLE_SECRETARY_GENERAL'], nom: 'Bennani', prenom: 'Salma', poste: 'Secrétaire Générale', service: srvGen._id },
      { email: 'agent@rh-management.com', roles: ['ROLE_AGENT_RH'], nom: 'Alaoui', prenom: 'Mehdi', poste: 'Agent RH', service: srvRH._id },
      { email: 'chef.it@rh-management.com', roles: ['ROLE_DEPARTMENT_MANAGER'], nom: 'Chraibi', prenom: 'Hassan', poste: 'Chef de Département IT', service: srvInfo._id },
      { email: 'dev@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'El Fassi', prenom: 'Omar', poste: 'Senior Dev', service: srvInfo._id },
      { email: 'finance@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'Naciri', prenom: 'Imane', poste: 'Comptable', service: srvFin._id },
      { email: 'user7@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'Tazi', prenom: 'Amina', poste: 'Développeur', service: srvInfo._id },
      { email: 'user8@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'Amrani', prenom: 'Karim', poste: 'Technicien', service: srvInfo._id },
      { email: 'user9@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'Berrada', prenom: 'Sara', poste: 'Assistante RH', service: srvRH._id },
      { email: 'user10@rh-management.com', roles: ['ROLE_EMPLOYE'], nom: 'Mennani', prenom: 'Youssef', poste: 'Contrôleur de gestion', service: srvFin._id }
    ];

    const users = [];
    const employes = [];

    // Create exactly 10 Users and their corresponding 10 Employees
    for (let i = 0; i < 10; i++) {
      const uData = usersData[i];
      const user = await User.create({ email: uData.email, password, roles: uData.roles });
      users.push(user);

      const emp = await Employe.create({
        nom: uData.nom, prenom: uData.prenom, cin: `AB${100000 + i}`, telephone: `060000000${i}`,
        matricule: `EMP00${i+1}`, poste: uData.poste, grade: 'Cadre', dateRecrutement: new Date(`2020-01-${i+1}`),
        statut: 'Actif', salaire: 15000 + (i * 1000), service: uData.service, user: user._id
      });
      employes.push(emp);
      
      user.employe = emp._id;
      await user.save();
    }
    
    // Make chef.it the actual chef
    srvInfo.chefService = employes[3]._id;
    await srvInfo.save();

    // Now create 90 more Employees to reach exactly 100 Employees in total (no users for them)
    console.log('Génération de 90 autres employés pour atteindre 100 au total...');
    for (let i = 11; i <= 100; i++) {
      const randomService = services[Math.floor(Math.random() * services.length)]._id;
      const emp = await Employe.create({
        nom: `Nom${i}`, prenom: `Prenom${i}`, cin: `CD${100000 + i}`, telephone: `0611111${i.toString().padStart(3, '0')}`,
        matricule: `EMP${i.toString().padStart(3, '0')}`, poste: 'Employé standard', statut: 'Actif',
        salaire: 10000 + (i * 10), service: randomService
      });
      employes.push(emp);
    }

    // Generate 100 Absences
    console.log('Création de 100 absences...');
    const absenceTypes = ['maladie', 'retard', 'injustifie', 'autorisee'];
    const absencesData = [];
    for (let i = 0; i < 100; i++) {
      const empId = employes[Math.floor(Math.random() * employes.length)]._id;
      const type = absenceTypes[Math.floor(Math.random() * absenceTypes.length)];
      const d = new Date(Date.now() - Math.random() * 10000000000);
      absencesData.push({
        employe: empId, type, motif: `Motif d'absence ${i}`,
        dateDebut: d, dateFin: new Date(d.getTime() + 86400000), // 1 day later
        statut: Math.random() > 0.5 ? 'justifiée' : 'non justifiée'
      });
    }
    await Absence.insertMany(absencesData);

    // Generate 100 Congés
    console.log('Création de 100 congés...');
    const congeStatus = ['EN_ATTENTE_CHEF', 'APPROUVE', 'REFUSE', 'EN_ATTENTE_RH'];
    const congesData = [];
    for (let i = 0; i < 100; i++) {
      const empId = employes[Math.floor(Math.random() * employes.length)]._id;
      const d = new Date(Date.now() + Math.random() * 5000000000);
      congesData.push({
        employe: empId, dateDebut: d, dateFin: new Date(d.getTime() + 86400000 * 5),
        motif: `Demande de congé ${i}`, statut: congeStatus[Math.floor(Math.random() * congeStatus.length)],
        nombreJours: 5
      });
    }
    await Conge.insertMany(congesData);

    // Generate 100 Attestations
    console.log('Création de 100 attestations...');
    const attTypes = ['Attestation de Travail', 'Attestation de Salaire', 'Bulletin de Paie'];
    const attStatus = ['EN_ATTENTE', 'GENEREE', 'SIGNEE', 'REJETE'];
    const attestationsData = [];
    for (let i = 0; i < 100; i++) {
      const empId = employes[Math.floor(Math.random() * employes.length)]._id;
      attestationsData.push({
        employe: empId, type: attTypes[Math.floor(Math.random() * attTypes.length)],
        statut: attStatus[Math.floor(Math.random() * attStatus.length)],
        dateDemande: new Date(Date.now() - Math.random() * 5000000000)
      });
    }
    await Attestation.insertMany(attestationsData);

    // Generate 100 Notifications
    console.log('Création de 100 notifications...');
    const notifTypes = ['info', 'alert', 'request'];
    const notificationsData = [];
    for (let i = 0; i < 100; i++) {
      // 20% global, 80% targeted
      const empId = Math.random() > 0.8 ? null : employes[Math.floor(Math.random() * employes.length)]._id;
      notificationsData.push({
        employe: empId, titre: `Notification système ${i}`,
        message: `Ceci est le détail de la notification générée aléatoirement n°${i}.`,
        type: notifTypes[Math.floor(Math.random() * notifTypes.length)],
        isRead: Math.random() > 0.5
      });
    }
    await Notification.insertMany(notificationsData);

    // Generate 20 Formations (Trainings)
    console.log('Création de 20 formations...');
    const formationTitles = ['Leadership', 'React & Node.js', 'Sécurité au travail', 'Communication', 'Gestion de projet Agile', 'Excel Avancé', 'Cybersecurité', 'Anglais Professionnel'];
    const formationStatus = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
    const formationsData = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date(Date.now() + (Math.random() - 0.5) * 10000000000); // Past or future dates
      
      // Select 2 to 10 random participants
      const numParticipants = Math.floor(Math.random() * 9) + 2;
      const participants = [];
      for(let p = 0; p < numParticipants; p++) {
        participants.push(employes[Math.floor(Math.random() * employes.length)]._id);
      }
      
      formationsData.push({
        titre: `${formationTitles[Math.floor(Math.random() * formationTitles.length)]} ${i+1}`,
        description: `Description détaillée pour la formation ${i+1}. Amélioration des compétences pour les collaborateurs.`,
        dateDebut: d,
        dateFin: new Date(d.getTime() + 86400000 * (Math.floor(Math.random() * 5) + 1)), // 1 to 5 days
        lieu: Math.random() > 0.5 ? 'En ligne (Teams)' : 'Salle de réunion A',
        capacite: Math.floor(Math.random() * 20) + 10,
        statut: formationStatus[Math.floor(Math.random() * formationStatus.length)],
        participants: [...new Set(participants)] // Unique participants
      });
    }
    await Formation.insertMany(formationsData);

    // Generate 20 Affectations (Assignments)
    console.log('Création de 20 affectations...');
    const affectationsData = [];
    const postes = ['Développeur Full Stack', 'Agent Administratif', 'Chef de Projet', 'Comptable', 'Consultant RH', 'Technicien Support', 'Analyste Financier', 'Designer UI/UX'];
    for (let i = 0; i < 20; i++) {
      const employe = employes[Math.floor(Math.random() * employes.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      affectationsData.push({
        employe: employe._id,
        service: service._id,
        poste: postes[Math.floor(Math.random() * postes.length)],
        dateDebut: new Date(Date.now() - Math.random() * 30000000000), // Random past date
        dateFin: Math.random() > 0.8 ? new Date(Date.now() + Math.random() * 30000000000) : null // 20% have end dates
      });
    }
    await Affectation.insertMany(affectationsData);

    console.log('Base de données remplie avec succès (10 Users, 100 Entités de base, 20 Formations, 20 Affectations) !');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors du peuplement de la BDD:', err);
    process.exit(1);
  }
};

seedDatabase();
