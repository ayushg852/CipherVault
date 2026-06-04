import cron from 'node-cron';
import File from '../models/File';
import fs from 'fs';
import path from 'path';

/**
 * Shredder Service: Proactively deletes expired files from Disk and DB.
 * Runs every 10 minutes.
 */
export const initShredder = () => {
  console.log('--- Initializing Automated Shredder Service ---');

  // Schedule task: Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const expiredFiles = await File.find({
        expiresAt: { $lt: new Date() }
      });

      if (expiredFiles.length === 0) return;

      console.log(`[Shredder] Found ${expiredFiles.length} expired files. Initializing purge protocol...`);

      for (const file of expiredFiles) {
        const filePath = path.join(process.cwd(), 'src/uploads/', file.filename);
        
        // 1. Delete Physical Blob
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[Shredder] Deleted physical blob: ${file.filename}`);
        }

        // 2. Delete Database Entry
        await File.deleteOne({ _id: file._id });
        console.log(`[Shredder] Purged metadata for ID: ${file._id}`);
      }

      console.log('[Shredder] Purge complete.');
    } catch (error) {
      console.error('[Shredder] Critical failure during maintenance task:', error);
    }
  });
};
