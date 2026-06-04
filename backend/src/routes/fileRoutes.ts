import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile, getFile, deleteFile, handleDecryptionSuccess, handleDecryptionFailure, getStats } from '../controllers/fileController';

const router = Router();

// Multer Config for Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'src/uploads/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ROUTE ORDER MATTERS: /stats must come before /download/:id
router.get('/stats', getStats); 

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', getFile);
router.post('/:id/shred', handleDecryptionSuccess);
router.post('/:id/fail', handleDecryptionFailure);
router.delete('/:id', deleteFile);

export default router;
