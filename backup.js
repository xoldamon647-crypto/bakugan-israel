#!/usr/bin/env node
// Run manually or via cron: node backup.js
// On Railway: set up a cron job or run from Railway's cron service

const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './bakugan.db';
const backupDir = process.env.BACKUP_DIR || path.join(path.dirname(dbPath), 'backups');

if (!fs.existsSync(dbPath)) {
  console.error(`DB not found at ${dbPath}`);
  process.exit(1);
}

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const dest = path.join(backupDir, `bakugan-${ts}.db`);
fs.copyFileSync(dbPath, dest);
console.log(`✅ Backup saved: ${dest}`);

// Keep only last 14 backups
const files = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('bakugan-') && f.endsWith('.db'))
  .sort();

while (files.length > 14) {
  const old = path.join(backupDir, files.shift());
  fs.unlinkSync(old);
  console.log(`🗑️  Removed old backup: ${old}`);
}
