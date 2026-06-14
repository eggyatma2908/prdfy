import { Router } from 'express';
import { PRDController } from '../controllers/prdController';
import { UserController } from '../controllers/userController';
import { requireAuth } from '../middlewares/auth';
import {
  validateCreateDocument,
  validateUpdateDocument,
  validateGeneratePRD,
  validateChat
} from '../middlewares/validate';

const router = Router();
const prdController = new PRDController();
const userController = new UserController();

// Public webhook callback for Midtrans payment notifications
router.post('/payment/notification', userController.handlePaymentNotification);

// Expose creator email dynamically for frontend checks
router.get('/config', (req, res) => {
  const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
  const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
  res.json({ creatorEmail });
});

// Log visitor entry (Public)
router.post('/visitor/log', prdController.logVisitor);

// Apply auth middleware to all routes below
router.use(requireAuth);

// Admin stats and metrics dashboard (Admin only)
router.get('/admin/stats', prdController.getAdminStats);

// Documents CRUD
router.get('/documents', prdController.getDocuments);
router.get('/documents/:id', prdController.getDocumentDetail);
router.post('/documents', validateCreateDocument, prdController.createDocument);
router.put('/documents/:id', validateUpdateDocument, prdController.updateDocument);
router.delete('/documents/:id', prdController.deleteDocument);

// Version history Snapshots
router.get('/documents/:id/versions', prdController.getVersions);
router.post('/documents/:id/versions', prdController.saveVersion);

// AI features
router.post('/generate', validateGeneratePRD, prdController.generatePRD);
router.post('/chat', validateChat, prdController.chatRevision);

// User settings
router.post('/user/subscribe', userController.upgradeSubscription);
router.post('/user/feedback', userController.submitFeedback);

export default router;
