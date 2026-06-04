import { Request, Response } from 'express';
import File from '../models/File';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { iv, salt, fileHash, originalName, mimeType, maxDownloads, expiryHours } = req.body;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours || '24'));

    const newFile = new File({
      filename: req.file.filename,
      originalName: originalName || req.file.originalname,
      mimeType: mimeType || req.file.mimetype,
      size: req.file.size,
      iv,
      salt,
      fileHash,
      expiresAt,
      maxDownloads: parseInt(maxDownloads || '1'),
    });

    await newFile.save();

    res.status(201).json({
      message: 'File uploaded securely',
      fileId: newFile._id,
      expiresAt: newFile.expiresAt,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check expiry
    if (new Date() > file.expiresAt) {
      await deleteFileData(file);
      res.status(410).json({ error: 'File has expired and been shredded' });
      return;
    }

    // Check failed attempts limit
    if (file.failedAttempts >= 3) {
      await deleteFileData(file);
      res.status(410).json({ error: 'Too many failed decryption attempts. File shredded.' });
      return;
    }

    const filePath = path.join(process.cwd(), 'src/uploads/', file.filename);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File physical blob not found' });
      return;
    }

    // Increment download count (for tracking only)
    file.downloadCount += 1;
    await file.save();

    const fileBuffer = fs.readFileSync(filePath);
    const fileBase64 = fileBuffer.toString('base64');

    res.json({
      blob: fileBase64,
      iv: file.iv,
      salt: file.salt,
      fileHash: file.fileHash,
      originalName: file.originalName,
      mimeType: file.mimeType,
      failedAttempts: file.failedAttempts
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleDecryptionSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);
    if (file) {
      await deleteFileData(file);
      res.json({ message: 'File shredded after successful decryption' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleDecryptionFailure = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    file.failedAttempts += 1;
    
    if (file.failedAttempts >= 3) {
      await deleteFileData(file);
      res.json({ message: 'Max attempts reached. File shredded.', shredded: true, remaining: 0 });
    } else {
      await file.save();
      res.json({ 
        message: 'Failed attempt logged', 
        shredded: false, 
        remaining: 3 - file.failedAttempts 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);
    if (file) {
      await deleteFileData(file);
      res.json({ message: 'File shredded successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await File.find({}, '_id size expiresAt createdAt failedAttempts');
    res.json({
      activeBlobs: files.length,
      files: files.map(f => ({
        id: f._id,
        size: f.size,
        expiresAt: f.expiresAt,
        createdAt: f.createdAt,
        failedAttempts: f.failedAttempts
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper to delete DB entry and physical file
async function deleteFileData(file: any) {
  const filePath = path.join(process.cwd(), 'src/uploads/', file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await File.deleteOne({ _id: file._id });
}
