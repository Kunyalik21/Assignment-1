import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'login after register failed' });
      const { passwordHash: _, ...safeUser } = user.toObject();
      res.json({ user: safeUser });
    });
  } catch (err) {
    res.status(500).json({ error: 'registration failed' });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'invalid credentials' });
    req.login(user, (err2) => {
      if (err2) return next(err2);
      const { passwordHash: _, ...safeUser } = user.toObject();
      return res.json({ user: safeUser });
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'logout failed' });
    req.session?.destroy(() => {
      res.json({ ok: true });
    });
  });
});

router.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user });
});

export default router;


