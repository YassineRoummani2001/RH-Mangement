
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Employe from './src/models/Employe.js';
import Formation from './src/models/Formation.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  await connectDB();
  const emps = await Employe.find({});
  const forms = await Formation.find({});
  
  const data = JSON.parse(JSON.stringify(emps));
  const formations = JSON.parse(JSON.stringify(forms));
  
  const nonCompliant = [];
  let counter = 0;

  data.forEach((emp) => {
    const missedFormations = formations.filter(f => {
      if (!f.participants) return true;
      return !f.participants.some(p => {
        const pid = typeof p === 'object' ? p._id : p;
        return (pid === emp._id || pid === emp.id);
      });
    });

    if (formations.length === 0) {
      nonCompliant.push({ dummy: true });
    } else if (missedFormations.length > 0) {
      nonCompliant.push({ missed: missedFormations[0].titre });
    }
  });

  console.log("Non Compliant count:", nonCompliant.length);
  process.exit(0);
}
test();
