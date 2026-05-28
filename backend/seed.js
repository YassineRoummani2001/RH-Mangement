import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Employe from './src/models/Employe.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhmangement')
  .then(async () => {
    console.log('Connected to DB');
    await User.deleteMany();
    await Employe.deleteMany();

    const emp = await Employe.create({
      nom: 'Admin',
      prenom: 'Super',
      matricule: 'M0001',
      poste: 'Directeur RH'
    });

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    await User.create({
      email: 'admin@rh.com',
      password,
      roles: ['ROLE_ADMIN_RH', 'ROLE_EMPLOYE'],
      employe: emp._id
    });

    console.log('Seeded User: admin@rh.com / admin123');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
