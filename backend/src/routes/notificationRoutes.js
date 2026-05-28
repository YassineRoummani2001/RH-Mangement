import express from 'express';
import { getAll, getById, create, update, remove, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.put('/mark-all-read', protect, markAllRead);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
