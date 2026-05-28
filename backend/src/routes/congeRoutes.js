import express from 'express';
import { getAll, getById, create, update, remove, approve, reject } from '../controllers/congeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.put('/:id/approve', protect, approve);
router.put('/:id/reject', protect, reject);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
