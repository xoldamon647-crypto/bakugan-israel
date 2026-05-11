const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const https = require('https');
const { initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Trust Railway's reverse proxy so req.ip is real client IP
app.set('trust proxy', 1);
app.set('json replacer', (key, value) => typeof value === 'bigint' ? Number(value) : value);

// ─── Image proxy – bypasses bakugan.wiki hotlink protection ───
app.get('/bkimg', (req, res) => {
  const p = req.query.p;
  if (!p || p.includes('..') || p.includes('//') || p.includes('\0')) return res.status(400).end();
  const url = `https://bakugan.wiki/images/${p}`;
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BakuganIsrael/1.0)', 'Accept': 'image/*' }
  };
  https.get(url, options, (r) => {
    if (r.statusCode !== 200) { r.resume(); return res.status(r.statusCode).end(); }
    const ct = r.headers['content-type'] || '';
    if (!ct.startsWith('image/')) { r.resume(); return res.status(400).end(); }
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    r.pipe(res);
  }).on('error', () => res.status(502).end());
});

// ─── Security & compression ───
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());

// ─── Rate limiting ───
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'יותר מדי ניסיונות, נסה שוב בעוד 15 דקות' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'יותר מדי בקשות, נסה שוב עוד רגע' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '1d' : 0,
}));

// ─── Health check for Railway ───
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

initDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/forums', require('./routes/forums'));
app.use('/api/events', require('./routes/events'));
app.use('/api/wiki', require('./routes/wiki'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/messages', require('./routes/messages'));

const pages = ['forums', 'events', 'wiki', 'rules', 'episodes', 'login', 'register', 'profile', 'admin', 'thread', 'messages', 'forgot-password', 'reset-password', 'store'];
for (const page of pages) {
  app.get(`/${page}`, (_, res) => res.sendFile(path.join(__dirname, 'public', `${page}.html`)));
}

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => {
  if (isProd) {
    res.status(500).json({ error: 'שגיאת שרת פנימית' });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🌀 Bakugan Israel running at http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
});

// ─── Graceful shutdown for Railway deploys ───
function shutdown() {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
