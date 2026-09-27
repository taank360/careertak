// Frontend AI gateway. Tries the Claude-backed server API first and silently
// falls back to the on-device engine so the app always works (even offline).
import { localCounselor } from '../engine/counselor.js';
import { analyzeResume } from '../engine/resume.js';
import { evaluateAnswer } from '../engine/interview.js';
import { computeReadiness, skillGap } from '../engine/readiness.js';
import { careerById } from '../data/careers.js';

const API = (import.meta.env.VITE_API_BASE || '') + '/api';
let health = null;

export async function aiStatus() {
  if (health) return health;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${API}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    health = res.ok ? await res.json() : { ai: false };
  } catch {
    health = { ai: false };
  }
  return health;
}

async function post(path, body, timeout = 45000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** Compact student summary sent as context to the AI coach. */
export function studentContext(state) {
  const p = state.profile || {};
  const r = computeReadiness(state);
  const career = careerById(p.targetRole);
  const gaps = career ? skillGap(career.id, state).filter((g) => g.status !== 'strong').slice(0, 5) : [];
  return [
    `Name: ${p.name || 'Student'}; District: ${p.district || 'unknown'}; Education: ${p.education || '?'} ${p.course || ''} (${p.stream || ''}), grad year ${p.gradYear || '?'}`,
    `Target role: ${career?.title || 'not decided'}`,
    `Readiness score: ${r.score}/100 (${r.band.label}), assessed coverage ${r.coverage}%`,
    `Dimensions: ${r.dims.map((d) => `${d.label}=${d.value ?? 'not assessed'}`).join(', ')}`,
    gaps.length ? `Top skill gaps: ${gaps.map((g) => `${g.name} ${g.current}/${g.required}`).join(', ')}` : '',
    state.tests?.interest?.riasec ? `Interest code: ${Object.entries(state.tests.interest.riasec).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join('')}` : '',
    `Projects: ${(p.projects || []).filter((x) => x.title).length}, internships: ${(p.internships || []).filter((x) => x.org).length}, certifications: ${(p.certifications || []).filter((x) => x.name).length}`,
    `Preferred language: ${state.settings?.lang === 'hi' ? 'Hindi' : 'English'}`,
  ].filter(Boolean).join('\n');
}

export async function chat(messages, state) {
  const last = messages[messages.length - 1]?.content || '';
  const { ai } = await aiStatus();
  if (ai && navigator.onLine) {
    try {
      const { reply } = await post('/chat', { messages, context: studentContext(state) });
      if (reply) return { text: reply, source: 'claude' };
    } catch (e) {
      console.warn('AI chat fallback:', e.message);
    }
  }
  await new Promise((r) => setTimeout(r, 450)); // natural typing feel
  return { text: localCounselor(last, state), source: 'local' };
}

export async function reviewResume(text, careerId) {
  const local = analyzeResume(text, careerId);
  const { ai } = await aiStatus();
  if (!ai || !navigator.onLine) return local;
  try {
    const r = await post('/resume', { text, role: careerById(careerId)?.title });
    // Blend: keep the transparent local checklist; take AI score/insights.
    return {
      ...local,
      score: Math.round(0.5 * local.score + 0.5 * (Number(r.score) || local.score)),
      grade: r.grade || local.grade,
      aiStrengths: r.strengths || [],
      suggestions: [...(r.suggestions || []), ...local.suggestions].slice(0, 8),
      keywords: { ...local.keywords, aiMissing: r.missingKeywords || [] },
      improvedSummary: r.improvedSummary,
      bulletRewrites: r.bulletRewrites || [],
      source: 'claude',
    };
  } catch (e) {
    console.warn('AI resume fallback:', e.message);
    return local;
  }
}

export async function evaluateInterviewAnswer(question, answer, seconds, careerId) {
  const local = evaluateAnswer(question, answer, seconds);
  const { ai } = await aiStatus();
  if (!ai || !navigator.onLine || local.wordCount < 5) return local;
  try {
    const r = await post('/interview', { question: question.q, answer, kind: question.kind, role: careerById(careerId)?.title });
    return {
      ...local,
      score: Math.round(0.4 * local.score + 0.6 * (Number(r.score) || local.score)),
      strengths: r.strengths?.length ? r.strengths : local.strengths,
      improve: r.improve?.length ? r.improve : local.improve,
      modelAnswer: r.modelAnswer,
      source: 'claude',
    };
  } catch (e) {
    console.warn('AI interview fallback:', e.message);
    return local;
  }
}
