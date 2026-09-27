import { HR_QUESTIONS, BEHAVIORAL_QUESTIONS, TECH_QUESTIONS, FILLERS, STAR_WORDS } from '../data/interview.js';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/** Builds a 5-question interview set for the chosen round. */
export function buildInterview(careerId, round = 'mixed') {
  const tech = (TECH_QUESTIONS[careerId] || TECH_QUESTIONS['software-developer']).map((q) => ({ ...q, kind: 'Technical', tip: q.tip || 'Explain the concept, then give a concrete example from your work or studies.' }));
  const hr = HR_QUESTIONS.map((q) => ({ ...q, kind: 'HR' }));
  const beh = BEHAVIORAL_QUESTIONS.map((q) => ({ ...q, kind: 'Behavioural' }));
  if (round === 'hr') return [hr[0], ...shuffle(hr.slice(1)).slice(0, 2), ...shuffle(beh).slice(0, 2)];
  if (round === 'technical') return [hr[0], ...shuffle(tech).slice(0, 4)];
  return [hr[0], ...shuffle(tech).slice(0, 2), shuffle(beh)[0], shuffle(hr.slice(1))[0]];
}

/** Heuristic answer evaluation (offline). Returns 0-100 plus feedback. */
export function evaluateAnswer(question, answer, seconds = 0) {
  const text = (answer || '').trim();
  const lower = ` ${text.toLowerCase()} `;
  const words = text.split(/\s+/).filter(Boolean);
  const wc = words.length;

  const kws = question.k || [];
  const hits = kws.filter((k) => lower.includes(k.toLowerCase()));
  const relevance = kws.length ? Math.min(1, hits.length / Math.max(2, Math.ceil(kws.length * 0.5))) : 0.6;

  const star = Object.fromEntries(Object.entries(STAR_WORDS).map(([k, list]) => [k, list.some((w) => lower.includes(w))]));
  const starCount = Object.values(star).filter(Boolean).length;
  const needsStar = question.kind === 'Behavioural';

  const fillerCount = FILLERS.reduce((s, f) => s + (lower.match(new RegExp(`\\b${f}\\b`, 'g')) || []).length, 0);
  const hasExample = /\b(for example|for instance|e\.g\.|once|in my project|during my|at my internship|when i)\b/i.test(text);
  const hasNumbers = /\d/.test(text);
  const sentences = text.split(/[.!?।]+/).filter((s) => s.trim().split(/\s+/).length > 2).length;

  const lengthScore = wc < 15 ? 0.15 : wc < 40 ? 0.5 : wc <= 220 ? 1 : 0.75;
  const structure = needsStar ? starCount / 4 : Math.min(1, (sentences >= 3 ? 0.6 : 0.3) + (hasExample ? 0.4 : 0));
  const clarity = Math.max(0, 1 - fillerCount * 0.08) * (sentences > 0 ? 1 : 0.5);

  let score = 100 * (0.35 * relevance + 0.25 * structure + 0.2 * lengthScore + 0.1 * clarity + 0.1 * ((hasExample ? 0.6 : 0) + (hasNumbers ? 0.4 : 0)));
  if (wc < 5) score = Math.min(score, 10);
  score = Math.round(Math.max(0, Math.min(100, score)));

  const strengths = [];
  const improve = [];
  if (relevance >= 0.7) strengths.push('Covered the key points the interviewer is looking for.');
  else improve.push(`Address the core of the question — consider mentioning: ${kws.filter((k) => !hits.includes(k)).slice(0, 4).join(', ')}.`);
  if (wc >= 40 && wc <= 220) strengths.push('Good answer length — detailed but concise.');
  else if (wc < 40) improve.push('Answer is too short. Aim for 60–150 words (about 45–90 seconds when spoken).');
  else improve.push('Answer is long. Keep it under 2 minutes and focus on the most relevant points.');
  if (needsStar) {
    if (starCount >= 3) strengths.push('Nice STAR structure (Situation, Task, Action, Result).');
    else improve.push(`Use the STAR method — missing: ${Object.entries(star).filter(([, v]) => !v).map(([k]) => ({ S: 'Situation', T: 'Task', A: 'your Action', R: 'Result' }[k])).join(', ')}.`);
  }
  if (hasExample) strengths.push('Backed up with a real example.');
  else improve.push('Add a specific example from your project, internship or college life.');
  if (hasNumbers) strengths.push('Used numbers to show impact.');
  else if (question.kind !== 'Technical') improve.push('Quantify results where possible (e.g. “team of 5”, “improved by 20%”).');
  if (fillerCount > 2) improve.push(`Reduce filler words (${fillerCount} found like “um”, “basically”, “like”).`);

  return {
    score,
    relevance: Math.round(relevance * 100),
    structure: Math.round(structure * 100),
    clarity: Math.round(clarity * 100),
    wordCount: wc,
    seconds,
    fillerCount,
    hits,
    strengths,
    improve,
    source: 'local',
  };
}

export function interviewSummary(results) {
  if (!results.length) return { score: 0, verdict: '' };
  const score = Math.round(results.reduce((s, r) => s + r.eval.score, 0) / results.length);
  const verdict = score >= 80 ? 'Excellent — you are interview-ready!' : score >= 65 ? 'Good — polish a few answers and you are ready.' : score >= 45 ? 'Fair — practise structure and examples.' : 'Needs practice — focus on longer, structured answers.';
  return { score, verdict };
}
