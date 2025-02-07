import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('csv'), (req, res) => {
  const csvPath = req.file.path;
  let output = '';
  let errorOutput = '';

  const process = spawn('/usr/bin/perl', [
    '/home/klaus/repos/DashboardAccess/Backend/scripts/addUsersCSV.pl',
    csvPath
  ]);

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  process.on('close', (code) => {
    if (code === 0) {
      res.status(200).json({ message: 'CSV processed', output });
    } else {
      res.status(500).json({ message: 'CSV processing error', errorOutput });
    }
  });
});

export default router;