import express from 'express';
import { login, me, changePassword, register } from '../controllers/authController.js';
import { protect, adminRH } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, me);
router.post('/change-password', protect, changePassword);
router.post('/register', protect, adminRH, register);

export default router;
