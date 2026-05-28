const fs = require('fs');
const path = require('path');

const modelsDir = 'd:/SupMti/PFC/RH-Mangement/backend/src/models';
const controllersDir = 'd:/SupMti/PFC/RH-Mangement/backend/src/controllers';
const routesDir = 'd:/SupMti/PFC/RH-Mangement/backend/src/routes';

const models = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

let indexRoutes = `import express from 'express';\nimport authRoutes from './authRoutes.js';\n`;
let indexRouterApp = `const router = express.Router();\nrouter.use('/auth', authRoutes);\n`;

models.forEach(file => {
    const modelName = file.replace('.js', '');
    if (modelName === 'User') return;

    const lowerName = modelName.toLowerCase();
    const routeName = lowerName + 's';

    // Generate Controller
    const controllerCode = `import ${modelName} from '../models/${modelName}.js';
import Employe from '../models/Employe.js';

export const getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && !req.user.roles.includes('ROLE_AGENT_RH') && !req.user.roles.includes('ROLE_ADMIN_RH') && ${modelName !== 'Employe' && modelName !== 'ServiceRH' ? 'true' : 'false'}) {
      const employe = await Employe.findOne({ user: req.user._id });
      if (employe) {
        query.employe = employe._id;
      } else {
        return res.json({ success: true, message: 'Liste vide', data: [] });
      }
    }

    const items = await ${modelName}.find(query).populate('employe');
    res.json({ success: true, message: 'Liste r\u00e9cup\u00e9r\u00e9e', data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await ${modelName}.findById(req.params.id).populate('employe');
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const item = new ${modelName}(req.body);
    await item.save();
    res.status(201).json({ success: true, message: 'Cr\u00e9\u00e9 avec succ\u00e8s', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await ${modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Mis \u00e0 jour avec succ\u00e8s', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const item = await ${modelName}.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Supprim\u00e9 avec succ\u00e8s' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
    fs.writeFileSync(path.join(controllersDir, `${lowerName}Controller.js`), controllerCode);

    // Generate Route
    const routeCode = `import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/${lowerName}Controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
`;
    fs.writeFileSync(path.join(routesDir, `${lowerName}Routes.js`), routeCode);

    indexRoutes += `import ${lowerName}Routes from './${lowerName}Routes.js';\n`;
    indexRouterApp += `router.use('/${routeName}', ${lowerName}Routes);\n`;
});

indexRouterApp += `export default router;\n`;
fs.writeFileSync(path.join(routesDir, 'index.js'), indexRoutes + '\n' + indexRouterApp);

console.log("Controllers and routes generated.");
