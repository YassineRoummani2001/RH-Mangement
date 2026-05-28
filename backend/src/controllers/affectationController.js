import Affectation from '../models/Affectation.js';
import Employe from '../models/Employe.js';

export const getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && !req.user.roles.includes('ROLE_AGENT_RH') && !req.user.roles.includes('ROLE_ADMIN_RH') && true) {
      const employe = await Employe.findOne({ user: req.user._id });
      if (employe) {
        query.employe = employe._id;
      } else {
        return res.json({ success: true, message: 'Liste vide', data: [] });
      }
    }

    const items = await Affectation.find(query).populate('employe').populate('service');
    res.json({ success: true, message: 'Liste récupérée', data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await Affectation.findById(req.params.id).populate('employe').populate('service');
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const item = new Affectation(req.body);
    await item.save();
    res.status(201).json({ success: true, message: 'Créé avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await Affectation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await Affectation.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
