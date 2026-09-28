// Shared AI handlers used by both the Express server (server/index.js)
// and the Vercel serverless function (api/[action].js).
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = process.env.AI_MODEL || 'claude-opus-5';
export const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
let client = null;
const getClient = () => (client ??= new Anthropic());

// --- Simple per-IP rate limit (30 AI calls / 10 min, per server instance) ---
const hits = new Map();
export function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 30) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
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
  const response = await getClient().beta.messages.create({
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

const bad = (status, error) => ({ status, body: { error } });

function toError(err) {
  console.error('[ai]', err?.status || '', err?.message);
  if (err instanceof Anthropic.RateLimitError) return bad(429, 'AI is busy, please retry shortly.');
  if (err instanceof Anthropic.AuthenticationError) return bad(503, 'AI key invalid — using offline mode.');
  if (err instanceof Anthropic.APIConnectionError) return bad(503, 'AI unreachable — using offline mode.');
  return bad(err?.status && err.status < 600 ? err.status : 500, err?.message || 'AI error');
}

async function chat(body) {
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: str(m.content, 2000) }));
  while (history.length && history[0].role !== 'user') history.shift();
  if (!history.length) return bad(400, 'No message');
  const system = `${COACH_SYSTEM}\n\nSTUDENT CONTEXT:\n${str(body.context, 3000)}`;
  const reply = await ask({ system, messages: history, maxTokens: 1500 });
  return { status: 200, body: { reply } };
}

async function resume(body) {
  const text = str(body.text, 12000);
  const role = str(body.role, 80) || 'an entry-level role';
  if (text.split(/\s+/).length < 30) return bad(400, 'Resume text too short');
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
  return { status: 200, body: parseJson(out) };
}

async function interview(body) {
  const question = str(body.question, 400);
  const answer = str(body.answer, 4000);
  const role = str(body.role, 80);
  const kind = str(body.kind, 30);
  const out = await ask({
    system: 'You are a friendly but rigorous interviewer for Indian fresher hiring. Evaluate answers fairly for a student. Respond with a single JSON object only.',
    messages: [{
      role: 'user',
      content: `Role: ${role}\nQuestion type: ${kind}\nQuestion: ${question}\nCandidate answer (may be speech-to-text, ignore transcription errors): """${answer}"""
Return JSON: {"score": integer 0-100, "strengths": [1-3 short strings], "improve": [2-4 short actionable strings], "modelAnswer": "a concise strong sample answer (80-120 words) a fresher could adapt"}`,
    }],
    maxTokens: 1500,
  });
  return { status: 200, body: parseJson(out) };
}

const ACTIONS = { chat, resume, interview };

/** Route one API call. Returns { status, body }. */
export async function handleApi(action, method, body, ip) {
  if (action === 'health') return { status: 200, body: { ok: true, ai: AI_ENABLED, model: AI_ENABLED ? MODEL : null } };
  const fn = ACTIONS[action];
  if (!fn) return bad(404, 'Not found');
  if (method !== 'POST') return bad(405, 'Use POST');
  if (!AI_ENABLED) return bad(503, 'AI not configured on server — using offline mode.');
  if (rateLimited(ip || 'unknown')) return bad(429, 'Too many requests. Please wait a few minutes.');
  try {
    return await fn(body || {});
  } catch (err) {
    return toError(err);
  }
}
