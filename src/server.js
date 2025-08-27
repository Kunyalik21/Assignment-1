import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';

import './config/passport.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Basic security and parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup (support comma-separated origins)
const corsOriginsEnv = process.env.CORS_ORIGIN || '';
const allowedOrigins = corsOriginsEnv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: true, // Allow all origins for now
    credentials: true,
  })
);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sessions
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('Missing SESSION_SECRET in environment.');
  process.exit(1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for now to debug
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: MongoStore.create({ mongoUrl: mongoUri, ttl: 60 * 60 * 24 * 7 }),
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static frontend
app.use(express.static(path.join(process.cwd(), 'public')));
// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routers
app.use('/api/auth', authRouter);
app.use('/api', uploadRouter);

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


