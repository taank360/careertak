// CareerTak API server.
// - Serves the built PWA from /dist
// - Exposes /api/* endpoints backed by Claude when ANTHROPIC_API_KEY is set.
//   The frontend automatically falls back to its offline engine when AI is unavailable.
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Minimal .env loader (avoids an extra dependency).
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const PORT = Number(process.env.PORT) || 8787;
const MODEL = process.env.AI_MODEL || 'claude-opus-5';
const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = AI_ENABLED ? new Anthropic() : null;

const app = express();
app.use(express.json({ limit: '200kb' }));

// --- Simple per-IP rate limit (30 AI calls / 10 min) ---
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 30) return res.status(429).json({ error: 'Too many requests. Please wait a few minutes.' });
  list.push(now);
  hits.set(ip, list);
  next();
}

const COACH_SYSTEM = `You are "CareerTak Coach", an AI career counsellor for college, ITI and polytechnic students in Madhya Pradesh, India.
Your job: help each student understand where they stand today and what to do next to become employable.
Guidelines:
- Be warm, encouraging and practical. Keep answers short for a mobile screen (under ~180 words) using short bullets.
- Personalise using the STUDENT CONTEXT (readiness score, gaps, goal, district). Refer to concrete next steps inside the app (Assess, Skills, Roadmap, Resume, Mock Interview, Jobs).
- Prefer free, credible Indian resources (SWAYAM, NPTEL, Skill India Digital Hub, NCS, MP Rojgar Portal, PM Internship Scheme, Apprenticeship India) and relevant MP context (Indore/Bhopal IT, Pithampur/Mandideep industry, agriculture, solar).
- If the student writes in Hindi or Hinglish, reply in the same language and script.
- Never invent specific job openings, deadlines or exact scheme amounts; tell them to verify on official portals.
- If a student expresses distress, respond with empathy and mention Tele-MANAS helpline 14416.
- Use **bold** for emphasis and "- " for bullets. No tables or headings.`;

async function ask({ system, messages, maxTokens = 1500, effort = 'low' }) {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (response.stop_reason === 'refusal') {
    throw Object.assign(new Error('The AI declined this request.'), { status: 422 });
  }
  return response.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

function parseJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON in model output');
  return JSON.parse(text.slice(start, end + 1));
}

const str = (v, max) => String(v ?? '').slice(0, max);

function handleError(res, err) {
  console.error('[ai]', err?.status || '', err?.message);
  if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'AI is busy, please retry shortly.' });
  if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'AI key invalid — using offline mode.' });
  if (err instanceof Anthropic.APIConnectionError) return res.status(503).json({ error: 'AI unreachable — using offline mode.' });
  return res.status(err?.status && err.status < 600 ? err.status : 500).json({ error: err?.message || 'AI error' });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: AI_ENABLED, model: AI_ENABLED ? MODEL : null }));

app.use('/api', (req, res, next) => {
  if (req.method === 'GET') return next();
  if (!AI_ENABLED) return res.status(503).json({ error: 'AI not configured on server — using offline mode.' });
  return rateLimit(req, res, next);
});

app.post('/api/chat', async (req, res) => {
  try {
    const history = (Array.isArray(req.body.messages) ? req.body.messages : [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-12)
      .map((m) => ({ role: m.role, content: str(m.content, 2000) }));
    while (history.length && history[0].role !== 'user') history.shift();
    if (!history.length) return res.status(400).json({ error: 'No message' });
    const system = `${COACH_SYSTEM}\n\nSTUDENT CONTEXT:\n${str(req.body.context, 3000)}`;
    const reply = await ask({ system, messages: history, maxTokens: 1500 });
    res.json({ reply });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/resume', async (req, res) => {
  try {
    const text = str(req.body.text, 12000);
    const role = str(req.body.role, 80) || 'an entry-level role';
    if (text.split(/\s+/).length < 30) return res.status(400).json({ error: 'Resume text too short' });
    const out = await ask({
      system: 'You are an expert Indian campus-recruitment resume reviewer and ATS specialist. Respond with a single JSON object only, no prose.',
      messages: [{
        role: 'user',
        content: `Review this fresher resume for the target role "${role}".
Return JSON with exactly these keys:
{"score": integer 0-100 (ATS + recruiter readiness), "grade": "Excellent"|"Good"|"Needs work"|"Weak",
 "strengths": [3 short strings], "suggestions": [4-6 specific, actionable strings],
 "missingKeywords": [up to 8 role keywords missing], "improvedSummary": "a 2-3 line professional summary the student could use, based only on facts in the resume",
 "bulletRewrites": [{"before": "weak bullet from resume", "after": "stronger version with action verb and impact (do not invent numbers; use [X] placeholders)"}] (max 3)}

RESUME:
"""${text}"""`,
      }],
      maxTokens: 2500,
    });
    res.json(parseJson(out));
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/interview', async (req, res) => {
  try {
    const question = str(req.body.question, 400);
    const answer = str(req.body.answer, 4000);
    const role = str(req.body.role, 80);
    const kind = str(req.body.kind, 30);
    const out = await ask({
      system: 'You are a friendly but rigorous interviewer for Indian fresher hiring. Evaluate answers fairly for a student. Respond with a single JSON object only.',
      messages: [{
        role: 'user',
        content: `Role: ${role}\nQuestion type: ${kind}\nQuestion: ${question}\nCandidate answer (may be speech-to-text, ignore transcription errors): """${answer}"""
Return JSON: {"score": integer 0-100, "strengths": [1-3 short strings], "improve": [2-4 short actionable strings], "modelAnswer": "a concise strong sample answer (80-120 words) a fresher could adapt"}`,
      }],
      maxTokens: 1500,
    });
    res.json(parseJson(out));
  } catch (err) {
    handleError(res, err);
  }
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
