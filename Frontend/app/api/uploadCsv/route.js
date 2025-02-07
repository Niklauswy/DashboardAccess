import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('csv'), async (req, res) => {
  try {
    const csvPath = req.file.path;
    const fs = await import('node:fs/promises');
    const fileBuffer = await fs.readFile(csvPath);

    // Parse CSV data
    const records = parse(fileBuffer, { columns: true, trim: true });

    // Example: create each user using an internal helper or a direct EBox call
    for (const row of records) {
      // ...create user logic...
    }

    // Clean up temp file
    await fs.unlink(csvPath);

    return res.status(200).json({ message: 'CSV processed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'CSV processing error', error: error.message });
  }
});

export default router;