import Employe from '../models/Employe.js';

export const getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && !req.user.roles.includes('ROLE_AGENT_RH') && !req.user.roles.includes('ROLE_ADMIN_RH') && false) {
      const employe = await Employe.findOne({ user: req.user._id });
      if (employe) {
        query.employe = employe._id;
      } else {
        return res.json({ success: true, message: 'Liste vide', data: [] });
      }
    }

    const items = await Employe.find(query).populate('service').populate('user');
    res.json({ success: true, message: 'Liste récupérée', data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await Employe.findById(req.params.id).populate('service').populate('user');
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = { ...req.body };
    // Map service_id to service for Mongoose
    if (data.service_id) {
      data.service = data.service_id;
      delete data.service_id;
    }
    // Auto-generate matricule if missing
    if (!data.matricule) {
      data.matricule = `EMP${Date.now()}`;
    }
    // Set default dateRecrutement to today if not provided
    if (!data.dateRecrutement) {
      data.dateRecrutement = new Date();
    }
    const item = new Employe(data);
    await item.save();
    res.status(201).json({ success: true, message: 'Créé avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await Employe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await Employe.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
