import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  iv: string; // Base64
  salt: string; // Base64
  fileHash: string; // SHA-256 for integrity
  expiresAt: Date;
  downloadCount: number;
  failedAttempts: number;
  maxDownloads: number;
  createdAt: Date;
}

const FileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  iv: { type: String, required: true },
  salt: { type: String, required: true },
  fileHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  downloadCount: { type: Number, default: 0 },
  failedAttempts: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 1 }, // Default: Shred after 1 download
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFile>('File', FileSchema);
