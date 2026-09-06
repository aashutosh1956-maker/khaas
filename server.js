require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { router: authRouter } = require('./src/auth');
const catalogRouter = require('./src/catalog');
const { router: streamRouter } = require('./src/stream');

const app = express();
const PORT = process.env.PORT || 4000;

// make sure the data files exist so a fresh checkout doesn't crash on first run
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const usersFile = path.join(DATA_DIR, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
const catalogFile = path.join(DATA_DIR, 'catalog.json');
if (!fs.existsSync(catalogFile)) fs.writeFileSync(catalogFile, '[]');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);

// Video playback goes through here — protected by a real auth check,
// not just hidden behind UI (see src/stream.js).
app.use('/api/stream', streamRouter);

// Poster/thumbnail images — public on purpose, so browsing works
// before signing in. Video files are NOT under here; they live in
// /media, which nothing ever statically mounts.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// the frontend itself
app.use(express.static(path.join(__dirname, 'public')));

// JSON error responses instead of Express's default HTML error page
// (this is what catches multer's "only video files" / file-too-large errors)
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Something went wrong.' });
  next();
});

app.listen(PORT, () => {
  console.log(`KHAAS backend running at http://localhost:${PORT}`);
});
