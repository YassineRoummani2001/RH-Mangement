import express from 'express';
import { sendMail } from '../controllers/mailController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Only logged in users can trigger an email send
router.post('/send', protect, sendMail);

export default router;
