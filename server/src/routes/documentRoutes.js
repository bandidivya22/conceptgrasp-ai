import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentContent,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id/content', protect, getDocumentContent);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router;
