import Attestation from '../models/Attestation.js';
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

    const items = await Attestation.find(query).populate({ path: 'employe', populate: { path: 'service' } });
    res.json({ success: true, message: 'Liste récupérée', data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await Attestation.findById(req.params.id).populate('employe');
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = { ...req.body };
    // Auto-link to logged-in user's employe if not provided
    if (!data.employe && req.user) {
      const emp = await Employe.findOne({ user: req.user._id });
      if (emp) data.employe = emp._id;
    }
    // Set defaults
    if (!data.statut) data.statut = 'EN_ATTENTE';
    if (!data.dateDemande) data.dateDemande = new Date();

    const item = new Attestation(data);
    await item.save();
    res.status(201).json({ success: true, message: 'Créé avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await Attestation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await Attestation.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate: HR moves EN_ATTENTE -> GENEREE
export const generate = async (req, res) => {
  try {
    const item = await Attestation.findByIdAndUpdate(
      req.params.id,
      { statut: 'GENEREE', dateGeneration: new Date(), signatureChef: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Attestation générée', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Sign: Secretary/HR moves GENEREE -> SIGNEE
export const sign = async (req, res) => {
  try {
    const item = await Attestation.findByIdAndUpdate(
      req.params.id,
      { statut: 'SIGNEE', signatureRH: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Attestation signée', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Refuse: reject attestation
export const refuse = async (req, res) => {
  try {
    const item = await Attestation.findByIdAndUpdate(
      req.params.id,
      { statut: 'REFUSEE' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Attestation refusée', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
