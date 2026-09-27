import { careerById } from '../data/careers.js';
import { SKILLS } from '../data/skills.js';

const ACTION_VERBS = [
  'achieved', 'analysed', 'analyzed', 'built', 'created', 'designed', 'developed', 'implemented', 'improved', 'increased',
  'led', 'managed', 'organised', 'organized', 'reduced', 'launched', 'automated', 'coordinated', 'delivered', 'trained',
  'optimised', 'optimized', 'resolved', 'streamlined', 'won', 'presented', 'researched', 'deployed', 'collaborated', 'mentored',
  'conducted', 'established', 'initiated', 'generated', 'negotiated', 'planned', 'executed', 'volunteered', 'taught', 'sold',
];
const WEAK_PHRASES = ['responsible for', 'worked on', 'helped with', 'duties included', 'hard working', 'hardworking', 'team player', 'go-getter', 'various tasks', 'etc'];
const SECTION_PATTERNS = {
  contact: /(@|\+91|\b\d{10}\b|linkedin|phone|email)/i,
  summary: /\b(summary|objective|profile|about me)\b/i,
  education: /\b(education|academic|qualification|b\.?tech|b\.?sc|b\.?com|b\.?a\b|diploma|iti|12th|10th|cgpa|percentage|university|college)\b/i,
  skills: /\b(skills|technical skills|competencies|tools)\b/i,
  projects: /\b(projects?|portfolio)\b/i,
  experience: /\b(experience|internship|intern|work history|employment|trainee|apprentice)\b/i,
  certifications: /\b(certifications?|certificates?|courses?|nptel|coursera|swayam)\b/i,
  achievements: /\b(achievements?|awards?|accomplishments|hackathon|rank|winner|extra[- ]?curricular|activities)\b/i,
};
const SECTION_LABELS = {
  contact: 'Contact details', summary: 'Summary / Objective', education: 'Education', skills: 'Skills', projects: 'Projects',
  experience: 'Experience / Internships', certifications: 'Certifications', achievements: 'Achievements / Activities',
};
const SECTION_WEIGHTS = { contact: 8, summary: 5, education: 8, skills: 8, projects: 8, experience: 7, certifications: 4, achievements: 4 };

// Extra synonyms so keyword matching is not too literal.
const SKILL_KEYWORDS = {
  programming: ['programming', 'coding', 'c++', 'python', 'java', 'javascript'],
  python: ['python', 'pandas', 'numpy'],
  java: ['java', 'oop', 'spring'],
  dsa: ['data structures', 'algorithms', 'dsa', 'leetcode', 'competitive programming'],
  webdev: ['html', 'css', 'javascript', 'web'],
  react: ['react', 'angular', 'vue', 'next.js'],
  backend: ['node', 'express', 'django', 'flask', 'api', 'backend', 'spring boot'],
  sql: ['sql', 'mysql', 'postgres', 'database', 'mongodb'],
  git: ['git', 'github'],
  excel: ['excel', 'spreadsheet', 'vlookup', 'pivot', 'google sheets'],
  statistics: ['statistics', 'statistical', 'regression', 'hypothesis'],
  powerbi: ['power bi', 'tableau', 'dashboard', 'looker'],
  ml: ['machine learning', 'scikit', 'tensorflow', 'pytorch', 'model', 'deep learning'],
  genai: ['generative ai', 'llm', 'prompt', 'chatgpt', 'claude', 'gen ai'],
  cloud: ['aws', 'azure', 'gcp', 'cloud'],
  networking: ['networking', 'tcp/ip', 'ccna', 'routing'],
  linux: ['linux', 'bash', 'shell'],
  security: ['security', 'cyber', 'vulnerability', 'siem', 'firewall'],
  figma: ['figma', 'adobe xd', 'wireframe', 'prototype'],
  design: ['design', 'ui', 'ux', 'canva', 'photoshop'],
  seo: ['seo', 'keyword research', 'content writing'],
  socialmedia: ['social media', 'instagram', 'facebook', 'content', 'reels'],
  analytics: ['google analytics', 'google ads', 'meta ads', 'ppc', 'campaign'],
  accounting: ['accounting', 'tally', 'bookkeeping', 'ledger', 'journal'],
  gst: ['gst', 'tax', 'tds', 'itr'],
  banking: ['banking', 'finance', 'loan', 'kyc'],
  sales: ['sales', 'target', 'revenue', 'lead', 'closing', 'business development'],
  customer: ['customer', 'client', 'service'],
  hrm: ['recruitment', 'hr', 'onboarding', 'payroll', 'talent'],
  communication: ['communication', 'english', 'presentation', 'speaking'],
  presentation: ['presentation', 'public speaking', 'seminar'],
  teamwork: ['team', 'collaborat'],
  problem: ['problem solving', 'analytical', 'troubleshoot'],
  aptitude: ['analytical', 'quantitative', 'logical'],
  digital: ['ms office', 'computer', 'digital', 'google workspace'],
  gk: ['current affairs', 'general knowledge'],
  mpgk: ['madhya pradesh'],
  pedagogy: ['teaching', 'lesson plan', 'tutor', 'b.ed'],
  subject: ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'hindi', 'subject'],
  manufacturing: ['manufacturing', 'production', 'cnc', 'lathe', 'assembly'],
  quality: ['quality', 'six sigma', '5s', 'kaizen', 'iso'],
  safety: ['safety', 'ppe', 'hse'],
  cad: ['autocad', 'solidworks', 'catia', 'cad'],
  electrical: ['electrical', 'wiring', 'panel', 'motor'],
  solar: ['solar', 'pv', 'inverter'],
  agronomy: ['agronomy', 'crop', 'soil', 'agriculture', 'farming'],
  agritech: ['drone', 'agri-tech', 'precision'],
  entrepreneurship: ['startup', 'founder', 'business', 'entrepreneur'],
  patientcare: ['patient', 'nursing', 'care'],
  firstaid: ['first aid', 'cpr', 'bls', 'hygiene'],
  hospitality: ['hospitality', 'guest', 'hotel'],
};

export function analyzeResume(text, careerId) {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();
  const words = raw.split(/\s+/).filter(Boolean);
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-•*▪●◦]|^\d+[.)]/.test(l)).length;
  const numbers = (raw.match(/\b\d+(\.\d+)?\s?(%|percent|\+|x|k|lakh|crore|users|students|customers|hours|days)\b/gi) || []).length;
  const verbsFound = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(raw));
  const weakFound = WEAK_PHRASES.filter((p) => lower.includes(p));
  const pronouns = (raw.match(/\b(I|me|my)\b/g) || []).length;
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(raw);
  const phone = /(\+91[\s-]?)?[6-9]\d{9}\b/.test(raw.replace(/[\s-]/g, (m) => (m === '-' ? '' : m)));
  const linkedin = /linkedin\.com/i.test(raw);
  const github = /github\.com|behance|portfolio|\.dev\b|\.me\b/i.test(raw);

  const sections = {};
  for (const [k, re] of Object.entries(SECTION_PATTERNS)) sections[k] = re.test(raw);

  // Keyword match against the target role.
  const career = careerById(careerId);
  const found = [];
  const missing = [];
  if (career) {
    for (const [id] of career.skills) {
      const kws = SKILL_KEYWORDS[id] || [SKILLS[id]?.name.toLowerCase()];
      (kws.some((k) => lower.includes(k)) ? found : missing).push(SKILLS[id]?.name || id);
    }
  }
  const kwScore = career ? found.length / (found.length + missing.length) : 0.6;

  // Scoring (100): sections 52, content quality 30, keywords 18.
  let score = 0;
  for (const [k, w] of Object.entries(SECTION_WEIGHTS)) if (sections[k]) score += w;
  score += Math.min(8, verbsFound.length * 1.5);
  score += Math.min(8, numbers * 2);
  score += words.length >= 250 && words.length <= 800 ? 6 : words.length >= 150 ? 3 : 0;
  score += bullets >= 5 ? 4 : bullets >= 2 ? 2 : 0;
  score += (linkedin ? 2 : 0) + (github ? 2 : 0);
  score -= Math.min(6, weakFound.length * 2);
  score -= pronouns > 8 ? 3 : 0;
  score += Math.round(kwScore * 18);
  if (words.length < 60) score = Math.min(score, 30);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const checks = [
    { ok: email && phone, label: 'Email & phone number present', tip: 'Add a professional email and a 10-digit mobile number at the top.' },
    { ok: linkedin, label: 'LinkedIn profile link', tip: 'Add your LinkedIn URL — most recruiters check it.' },
    { ok: sections.summary, label: 'Professional summary', tip: 'Add a 2–3 line summary: target role + top skills + one achievement.' },
    { ok: sections.skills, label: 'Dedicated skills section', tip: 'List role-relevant hard skills in a separate “Skills” section.' },
    { ok: sections.projects, label: 'Projects section', tip: 'Add 2–3 projects with what you built, tools used and outcome.' },
    { ok: sections.experience, label: 'Internship / experience', tip: 'Add internships, apprenticeships, freelance or volunteer work.' },
    { ok: verbsFound.length >= 5, label: `Strong action verbs (${verbsFound.length} found)`, tip: 'Start bullets with verbs like Built, Led, Improved, Analysed.' },
    { ok: numbers >= 3, label: `Quantified achievements (${numbers} found)`, tip: 'Add numbers: “Improved load time by 40%”, “Trained 25 students”.' },
    { ok: weakFound.length === 0, label: 'No weak / cliché phrases', tip: `Replace phrases like “${weakFound[0] || 'responsible for'}” with specific actions and results.` },
    { ok: words.length >= 250 && words.length <= 800, label: `Ideal length (${words.length} words)`, tip: words.length < 250 ? 'Too short — add projects, skills and achievements (aim 300–600 words).' : 'Too long — keep it to 1 page for freshers.' },
    { ok: pronouns <= 8, label: 'Minimal first-person pronouns', tip: 'Avoid “I / my” in bullets; write “Built X” instead of “I built X”.' },
  ];
  if (career) checks.push({ ok: kwScore >= 0.6, label: `Keywords for ${career.title} (${found.length}/${found.length + missing.length})`, tip: `Add relevant skills you genuinely have: ${missing.slice(0, 4).join(', ')}.` });

  const suggestions = checks.filter((c) => !c.ok).map((c) => c.tip);
  return {
    score,
    grade: score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Needs work' : 'Weak',
    sections,
    sectionLabels: SECTION_LABELS,
    checks,
    suggestions,
    keywords: { found, missing },
    stats: { words: words.length, bullets, numbers, verbs: verbsFound.length, weak: weakFound },
    source: 'local',
  };
}

/** Builds plain-text resume content from the profile (used by builder + analyzer). */
export function resumeFromProfile(profile, skillsList = []) {
  const p = profile || {};
  const career = careerById(p.targetRole);
  const L = [];
  L.push(p.name || 'Your Name');
  L.push([p.email, p.phone, p.district ? `${p.district}, Madhya Pradesh` : '', p.linkedin, p.github].filter(Boolean).join(' | '));
  L.push('');
  L.push('SUMMARY');
  L.push(p.summary || `${career ? `Aspiring ${career.title}` : 'Motivated graduate'} with skills in ${skillsList.slice(0, 4).join(', ') || 'problem solving and communication'}. Eager to learn and contribute to a growing team.`);
  L.push('');
  L.push('EDUCATION');
  L.push(`${p.course || p.education || ''} — ${p.college || ''} ${p.gradYear ? `(${p.gradYear})` : ''} ${p.cgpa ? `· CGPA/%: ${p.cgpa}` : ''}`.trim());
  L.push('');
  L.push('SKILLS');
  L.push(skillsList.join(', '));
  if ((p.projects || []).some((x) => x.title)) {
    L.push('');
    L.push('PROJECTS');
    p.projects.filter((x) => x.title).forEach((x) => L.push(`- ${x.title}${x.desc ? `: ${x.desc}` : ''}${x.link ? ` (${x.link})` : ''}`));
  }
  if ((p.internships || []).some((x) => x.org)) {
    L.push('');
    L.push('EXPERIENCE');
    p.internships.filter((x) => x.org).forEach((x) => L.push(`- ${x.role || 'Intern'}, ${x.org}${x.months ? ` (${x.months} months)` : ''}${x.desc ? ` — ${x.desc}` : ''}`));
  }
  if ((p.certifications || []).some((x) => x.name)) {
    L.push('');
    L.push('CERTIFICATIONS');
    p.certifications.filter((x) => x.name).forEach((x) => L.push(`- ${x.name}${x.issuer ? ` — ${x.issuer}` : ''}`));
  }
  if (p.achievements) {
    L.push('');
    L.push('ACHIEVEMENTS & ACTIVITIES');
    p.achievements.split('\n').filter(Boolean).forEach((a) => L.push(`- ${a.replace(/^[-•]\s*/, '')}`));
  }
  if ((p.languages || []).length) {
    L.push('');
    L.push(`LANGUAGES: ${p.languages.join(', ')}`);
  }
  return L.join('\n');
}
