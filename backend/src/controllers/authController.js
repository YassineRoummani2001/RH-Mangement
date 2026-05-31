import User from '../models/User.js';
import Employe from '../models/Employe.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

export const login = async (req, res) => {
  try {
    // In symfony it takes username and password usually, we'll check for email/username.
    const username = req.body.username || req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: username }).populate({
      path: 'employe',
      populate: {
        path: 'service'
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Compte inactif' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employe',
      populate: {
        path: 'service'
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    let data = {
      id: user._id,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };

    if (user.employe) {
      const employe = user.employe;
      data.employe = {
        id: employe._id,
        nom: employe.nom,
        prenom: employe.prenom,
        cin: employe.cin,
        telephone: employe.telephone,
        adresse: employe.adresse,
        dateNaissance: employe.dateNaissance ? employe.dateNaissance.toISOString().split('T')[0] : null,
        sexe: employe.sexe,
        situationFamiliale: employe.situationFamiliale,
        conjoint: employe.conjoint,
        nombreEnfants: employe.nombreEnfants,
        matricule: employe.matricule,
        poste: employe.poste,
        grade: employe.grade,
        echelle: employe.echelle,
        dateRecrutement: employe.dateRecrutement ? employe.dateRecrutement.toISOString().split('T')[0] : null,
        statut: employe.statut,
        contrat: employe.contrat,
        localisation: employe.localisation,
        soldeConges: employe.soldeConges ?? 22,
        soldeMaladie: employe.soldeMaladie ?? 8,
        photo: employe.photo,
        service: employe.service ? {
          id: employe.service._id,
          nom: employe.service.nom
        } : null
      };
    }

    res.json({ success: true, message: 'Utilisateur connecté', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Mot de passe mis à jour avec succès', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req, res) => {
  try {
    // Only ROLE_ADMIN_RH can register new users typically, or we skip check for simplicity based on your need
    if (!req.user.roles.includes('ROLE_ADMIN_RH')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { email, roles, isActive, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ success: false, message: 'Données invalides' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(422).json({ success: false, message: 'Validation échouée', data: { email: 'Cet email est déjà utilisé.' } });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      roles: roles || ['ROLE_EMPLOYE'],
      isActive: isActive !== undefined ? isActive : true,
      password: hashedPassword
    });

    res.status(201).json({ success: true, message: 'Utilisateur créé', data: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
