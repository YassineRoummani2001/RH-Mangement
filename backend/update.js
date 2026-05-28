import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/rhmangement').then(async () => {
  const Employe = mongoose.model('Employe', new mongoose.Schema({}, { strict: false }));
  await Employe.updateMany(
    { dateRecrutement: { $exists: false } }, 
    { $set: { dateRecrutement: new Date('2023-01-15T10:00:00Z'), contrat: 'CDI', localisation: 'Siège Social' } }
  );
  console.log('Employees updated');
  process.exit(0);
});
