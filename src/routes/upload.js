import path from 'node:path';
import express from 'express';
import multer from 'multer';
import File from '../models/File.js';

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${unique}-${safeOriginal}`);
  },
});

const upload = multer({ storage });

router.post('/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file uploaded' });
    const publicUrl = `/uploads/${req.file.filename}`;
    const saved = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: publicUrl,
      uploadedBy: req.user._id,
    });
    res.json({ file: saved });
  } catch (err) {
    res.status(500).json({ error: 'upload failed' });
  }
});

router.get('/files', ensureAuthenticated, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'failed to list files' });
  }
});

export default router;


