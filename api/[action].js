// Vercel serverless entry: /api/health, /api/chat, /api/resume, /api/interview
import { handleApi } from '../server/ai.js';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress;
  const { status, body } = await handleApi(req.query.action, req.method, req.body, ip);
  res.status(status).json(body);
}
