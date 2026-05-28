import express from 'express';
import { getAll, getById, create, update, remove, generate, sign, refuse } from '../controllers/attestationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.post('/:id/generate', protect, generate);
router.post('/:id/sign', protect, sign);
router.post('/:id/refuse', protect, refuse);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
