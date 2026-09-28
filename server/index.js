// CareerTak server: serves the built PWA from /dist and the /api/* endpoints.
// For serverless hosting (Vercel) the same handlers run from api/[action].js.
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Minimal .env loader (avoids an extra dependency). Must run before ai.js reads process.env.
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const { handleApi, AI_ENABLED, MODEL } = await import('./ai.js');

const PORT = Number(process.env.PORT) || 8787;
const app = express();
app.use(express.json({ limit: '200kb' }));

app.all('/api/:action', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const { status, body } = await handleApi(req.params.action, req.method, req.body, ip);
  res.status(status).json(body);
});

// --- Static PWA ---
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`CareerTak server on http://localhost:${PORT}  (AI: ${AI_ENABLED ? MODEL : 'offline engine only'})`);
});
