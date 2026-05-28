import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Employe from './src/models/Employe.js';
import Formation from './src/models/Formation.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await connectDB();
  const emps = await Employe.find({});
  const forms = await Formation.find({});
  console.log("Employees count:", emps.length);
  console.log("Formations count:", forms.length);
  if (forms.length > 0) {
    console.log("First formation participants:", forms[0].participants);
  }
  process.exit(0);
}
check();
