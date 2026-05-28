import User from '../models/User.js';
import Employe from '../models/Employe.js';
import bcrypt from 'bcryptjs';

export const getAll = async (req, res) => {
  try {
    const items = await User.find().populate({
      path: 'employe',
      populate: { path: 'service' }
    });
    // We should map them to return standard formatting expected by the frontend
    const mapped = items.map(u => {
      const emp = u.employe || {};
      const prenom = emp.prenom || 'User';
      const nom = emp.nom || 'Unknown';
      const name = `${prenom} ${nom}`;
      return {
        id: u._id,
        name: name,
        email: u.email,
        role: u.roles[0],
        department: emp.service?.nom || '-',
        phone: emp.telephone || '-',
        jobTitle: emp.poste || '',
        status: u.isActive ? 'Actif' : 'Inactif',
        isActive: u.isActive,
        lastLogin: u.updatedAt ? new Date(u.updatedAt).toLocaleString('fr-FR') : 'Jamais',
        initials: (prenom.substring(0, 1) + nom.substring(0, 1)).toUpperCase(),
        bg: u.isActive ? '#2563EB' : '#94A3B8',
        hireDate: emp.dateRecrutement ? new Date(emp.dateRecrutement).toLocaleDateString('fr-FR') : '-',
        contractType: emp.contrat || 'CDI',
        location: emp.localisation || 'Siège Social'
      };
    });
    res.json({ success: true, message: 'Liste récupérée', data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await User.findById(req.params.id).populate({
      path: 'employe',
      populate: { path: 'service' }
    });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { email, password, role, jobTitle, phone, hireDate, contractType, location, name } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const item = new User({
      email,
      password: hashedPassword,
      roles: [role],
      isActive: true
    });
    
    const nameParts = name ? name.split(' ') : ['User', 'Unknown'];
    const prenom = nameParts[0];
    const nom = nameParts.slice(1).join(' ') || 'Unknown';

    const emp = new Employe({
      user: item._id,
      prenom: prenom,
      nom: nom,
      matricule: `MAT-${Math.floor(Math.random() * 10000)}`,
      poste: jobTitle || '',
      telephone: phone || '',
      dateRecrutement: hireDate ? new Date(hireDate) : new Date(),
      contrat: contractType || 'CDI',
      localisation: location || 'Siège Social'
    });
    
    await emp.save();
    
    item.employe = emp._id;
    await item.save();

    res.status(201).json({ success: true, message: 'Créé avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { email, role, jobTitle, phone, hireDate, contractType, location } = req.body;
    let updateData = {};
    if (email) updateData.email = email;
    if (role) updateData.roles = [role];

    const item = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });

    let emp;
    if (item.employe) {
      emp = await Employe.findById(item.employe);
    } else {
      emp = await Employe.findOne({ user: item._id });
    }
    if (emp) {
      if (jobTitle !== undefined) emp.poste = jobTitle;
      if (phone !== undefined) emp.telephone = phone;
      if (hireDate) emp.dateRecrutement = new Date(hireDate);
      if (contractType) emp.contrat = contractType;
      if (location) emp.localisation = location;
      await emp.save();
    }

    res.json({ success: true, message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await User.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Introuvable' });
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ success: true, message: 'Statut mis à jour', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
