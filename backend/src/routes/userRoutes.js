import express from 'express';
import { getAll, getById, create, update, remove, toggleStatus } from '../controllers/userController.js';
import { protect, adminRH } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(adminRH);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/toggle-status', toggleStatus);

export default router;
