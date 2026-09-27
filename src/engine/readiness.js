import { CAREERS, careerById } from '../data/careers.js';
import { SKILLS } from '../data/skills.js';

// Weights of each readiness dimension (sum = 100).
export const DIMENSIONS = [
  { id: 'skills', label: 'Role Skills', hi: 'भूमिका कौशल', weight: 25, route: '/skills' },
  { id: 'interview', label: 'Interview', hi: 'इंटरव्यू', weight: 15, route: '/interview' },
  { id: 'resume', label: 'Resume', hi: 'रिज़्यूमे', weight: 13, route: '/resume' },
  { id: 'aptitude', label: 'Aptitude', hi: 'योग्यता', weight: 12, route: '/assess/aptitude' },
  { id: 'communication', label: 'Communication', hi: 'संवाद', weight: 12, route: '/assess/communication' },
  { id: 'experience', label: 'Experience', hi: 'अनुभव', weight: 10, route: '/profile' },
  { id: 'softskills', label: 'Workplace Skills', hi: 'कार्यस्थल कौशल', weight: 8, route: '/assess/softskills' },
  { id: 'digital', label: 'Digital Literacy', hi: 'डिजिटल साक्षरता', weight: 5, route: '/assess/digital' },
];

export const BANDS = [
  { min: 80, id: 'ready', label: 'Job Ready', hi: 'नौकरी के लिए तैयार', color: '#10b981', emoji: '🚀' },
  { min: 60, id: 'almost', label: 'Almost Ready', hi: 'लगभग तैयार', color: '#6366f1', emoji: '💪' },
  { min: 40, id: 'developing', label: 'Developing', hi: 'विकासशील', color: '#f59e0b', emoji: '🌱' },
  { min: 0, id: 'beginner', label: 'Getting Started', hi: 'शुरुआत', color: '#f43f5e', emoji: '🧭' },
];

export const bandFor = (score) => BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** Effective 0-5 level for a skill: blends self-rating, assessment evidence and roadmap practice. */
export function effectiveLevel(skillId, state) {
  const self = state.skills?.[skillId];
  const testId = SKILLS[skillId]?.test;
  const test = testId ? state.tests?.[testId] : null;
  const boost = state.skillBoost?.[skillId] || 0;
  let level;
  if (test && self != null) level = 0.5 * self + 0.5 * (test.score / 20);
  else if (test) level = test.score / 20;
  else if (self != null) level = self;
  else level = 0;
  return Math.min(5, Math.round((level + boost) * 10) / 10);
}

/** Skill-gap analysis for a target career. */
export function skillGap(careerId, state) {
  const career = careerById(careerId);
  if (!career) return [];
  return career.skills
    .map(([id, required, weight]) => {
      const current = effectiveLevel(id, state);
      const gap = Math.max(0, required - current);
      const status = gap <= 0 ? 'strong' : gap <= 1 ? 'close' : 'gap';
      return {
        id,
        name: SKILLS[id]?.name || id,
        hi: SKILLS[id]?.hi,
        required,
        current,
        gap: Math.round(gap * 10) / 10,
        weight,
        priority: Math.round(gap * weight * 10) / 10,
        status,
        verified: !!(SKILLS[id]?.test && state.tests?.[SKILLS[id].test]),
      };
    })
    .sort((a, b) => b.priority - a.priority || b.weight - a.weight);
}

export function roleMatch(careerId, state) {
  const career = careerById(careerId);
  if (!career) return 0;
  let num = 0;
  let den = 0;
  for (const [id, required, weight] of career.skills) {
    num += weight * Math.min(1, effectiveLevel(id, state) / required);
    den += weight;
  }
  return den ? Math.round((num / den) * 100) : 0;
}

export function experienceScore(profile = {}) {
  const projects = (profile.projects || []).filter((p) => p.title).length;
  const internships = (profile.internships || []).filter((p) => p.org || p.role).length;
  const certs = (profile.certifications || []).filter((c) => c.name).length;
  const extras = (profile.achievements || '').trim().length > 10 ? 10 : 0;
  const links = (profile.github ? 5 : 0) + (profile.linkedin ? 5 : 0);
  return clamp(Math.min(45, projects * 15) + Math.min(50, internships * 25) + Math.min(30, certs * 10) + extras + links);
}

function interviewScore(interviews = []) {
  if (!interviews.length) return null;
  const recent = interviews.slice(-3);
  return Math.round(recent.reduce((s, i) => s + i.score, 0) / recent.length);
}

/** Full readiness computation. Returns score, coverage, per-dimension values and band. */
export function computeReadiness(state) {
  const { profile = {}, tests = {} } = state;
  const hasSkillData = Object.keys(state.skills || {}).length > 0 || Object.keys(tests).length > 0;
  const values = {
    skills: profile.targetRole && hasSkillData ? roleMatch(profile.targetRole, state) : null,
    interview: interviewScore(state.interviews),
    resume: state.resume?.analysis?.score ?? null,
    aptitude: tests.aptitude?.score ?? null,
    communication: tests.communication?.score ?? null,
    experience: profile.name ? experienceScore(profile) : null,
    softskills: tests.softskills?.score ?? null,
    digital: tests.digital?.score ?? null,
  };
  let num = 0;
  let wAvail = 0;
  const dims = DIMENSIONS.map((d) => {
    const v = values[d.id];
    if (v != null) {
      num += d.weight * v;
      wAvail += d.weight;
    }
    return { ...d, value: v };
  });
  const score = wAvail ? Math.round(num / wAvail) : 0;
  const coverage = Math.round(wAvail);
  return { score, coverage, dims, band: bandFor(score), absolute: Math.round(num / 100) };
}

/** Interest (RIASEC) scores normalised 0-1. */
export function riasecProfile(state) {
  const r = state.tests?.interest?.riasec;
  if (!r) return null;
  const max = Math.max(...Object.values(r), 1);
  const norm = {};
  for (const k of 'RIASEC') norm[k] = (r[k] || 0) / max;
  const code = Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join('');
  return { raw: r, norm, code };
}

const STREAM_FIT = { iti: ['iti'], diploma: ['diploma', 'engineering'], '10th': ['iti'], '12th': [] };

/** Rank careers for this student by interest fit, current skill match and stream eligibility. */
export function recommendCareers(state, limit = 5) {
  const { profile = {} } = state;
  const interest = riasecProfile(state);
  const streams = new Set([profile.stream, ...(STREAM_FIT[profile.education] || [])].filter(Boolean));
  return CAREERS.map((c) => {
    const skill = roleMatch(c.id, state);
    let interestFit = 0.5;
    if (interest) {
      const w = [3, 2, 1];
      interestFit = c.riasec.split('').reduce((s, k, i) => s + w[i] * interest.norm[k], 0) / 6;
    }
    const streamFit = streams.size === 0 ? 0.6 : c.streams.some((s) => streams.has(s)) ? 1 : 0.25;
    const interestBonus = (profile.interests || []).includes(c.sector) ? 0.1 : 0;
    const fit = Math.round(clamp((0.45 * interestFit + 0.3 * (skill / 100) + 0.25 * streamFit + interestBonus) * 100));
    return { ...c, fit, skill, interestFit: Math.round(interestFit * 100) };
  })
    .sort((a, b) => b.fit - a.fit)
    .slice(0, limit);
}

/** Prioritised "what to do next" list. */
export function nextActions(state) {
  const { profile = {}, tests = {} } = state;
  const actions = [];
  const career = careerById(profile.targetRole);

  if (!profile.targetRole) {
    actions.push({ id: 'goal', icon: '🎯', title: 'Choose your career goal', detail: 'Take the interest profiler and pick a target role.', route: tests.interest ? '/explore' : '/assess/interest', xp: 30 });
  }
  if (!tests.aptitude) actions.push({ id: 't-apt', icon: '🧮', title: 'Take the Aptitude test', detail: '12 questions · 12 min — asked by most recruiters', route: '/assess/aptitude', xp: 50 });
  if (!tests.communication) actions.push({ id: 't-com', icon: '🗣️', title: 'Check your English communication', detail: '10 questions · 8 min', route: '/assess/communication', xp: 50 });
  if (Object.keys(state.skills || {}).length === 0) actions.push({ id: 'skills', icon: '📋', title: 'Rate your skills', detail: 'Tell us what you know to find your gaps', route: '/skills', xp: 30 });
  if (!state.resume?.analysis) actions.push({ id: 'resume', icon: '📄', title: 'Get your resume scored', detail: 'AI checks ATS-readiness & keywords', route: '/resume', xp: 40 });
  if (!(state.interviews || []).length) actions.push({ id: 'interview', icon: '🎤', title: 'Try an AI mock interview', detail: '5 questions with instant feedback', route: '/interview', xp: 60 });
  if (!tests.softskills) actions.push({ id: 't-sjt', icon: '🤝', title: 'Workplace situations test', detail: '6 real-life scenarios', route: '/assess/softskills', xp: 40 });

  if (career) {
    const gaps = skillGap(career.id, state).filter((g) => g.status !== 'strong').slice(0, 2);
    for (const g of gaps) {
      actions.push({ id: `gap-${g.id}`, icon: '📚', title: `Improve ${g.name}`, detail: `You: ${g.current}/5 · Needed: ${g.required}/5`, route: '/roadmap', xp: 20 });
    }
    if (!state.roadmap || state.roadmap.role !== career.id) {
      actions.push({ id: 'roadmap', icon: '🗺️', title: 'Generate your 12-week roadmap', detail: `Personalised plan to become a ${career.title}`, route: '/roadmap', xp: 30 });
    }
  }
  if (experienceScore(profile) < 40) actions.push({ id: 'exp', icon: '🛠️', title: 'Add a project or internship', detail: 'Experience is 10% of your score', route: '/profile', xp: 25 });
  if (!tests.digital) actions.push({ id: 't-dig', icon: '📱', title: 'Digital literacy check', detail: '8 questions · 6 min', route: '/assess/digital', xp: 30 });
  actions.push({ id: 'jobs', icon: '💼', title: 'Explore matching opportunities', detail: 'Jobs, internships & apprenticeships in MP', route: '/jobs', xp: 10 });
  return actions;
}

/** Strengths and focus areas in plain language. */
export function insights(state) {
  const r = computeReadiness(state);
  const measured = r.dims.filter((d) => d.value != null);
  const strengths = measured.filter((d) => d.value >= 70).map((d) => d.label);
  const focus = measured.filter((d) => d.value < 55).sort((a, b) => a.value - b.value).map((d) => d.label);
  const missing = r.dims.filter((d) => d.value == null).map((d) => d.label);
  return { strengths, focus, missing, readiness: r };
}
