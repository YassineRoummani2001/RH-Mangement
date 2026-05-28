import Conge from '../models/Conge.js';
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

    const items = await Conge.find(query).populate({
      path: 'employe',
      populate: { path: 'service' }
    });
    res.json({ success: true, message: 'Liste récupérée', data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await Conge.findById(req.params.id).populate({
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
    const data = { ...req.body };
    // Auto-link to logged-in user's employe
    if (!data.employe && req.user) {
      const emp = await Employe.findOne({ user: req.user._id });
      if (emp) data.employe = emp._id;
    }
    // Default statut
    if (!data.statut) data.statut = 'EN_ATTENTE';
    // Auto-calculate nombreJours if dates provided
    if (data.dateDebut && data.dateFin && !data.nombreJours) {
      const d1 = new Date(data.dateDebut);
      const d2 = new Date(data.dateFin);
      const diffTime = Math.abs(d2 - d1);
      data.nombreJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const item = new Conge(data);
    await item.save();
    res.status(201).json({ success: true, message: 'Créé avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await Conge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await Conge.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req, res) => {
  try {
    const item = await Conge.findByIdAndUpdate(
      req.params.id,
      { statut: 'APPROUVE', signatureRH: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Congé approuvé', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reject = async (req, res) => {
  try {
    const item = await Conge.findByIdAndUpdate(
      req.params.id,
      { statut: 'REFUSE', motifRefus: req.body.motifRefus || 'Refusé' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Congé refusé', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
