import { experienceScore, riasecProfile, recommendCareers, recommendBusinesses } from './readiness.js';
import { RIASEC } from '../data/careers.js';

// Areas the student can be measured on, each backed by an assessment (or the profile).
export const AREAS = [
  { id: 'aptitude', test: 'aptitude', label: 'Aptitude & Reasoning', hi: 'योग्यता व तर्क', icon: '🧮', core: true },
  { id: 'communication', test: 'communication', label: 'English Communication', hi: 'अंग्रेज़ी संवाद', icon: '🗣️', core: true },
  { id: 'softskills', test: 'softskills', label: 'Workplace Behaviour', hi: 'कार्यस्थल व्यवहार', icon: '🤝', core: true },
  { id: 'digital', test: 'digital', label: 'Digital Literacy', hi: 'डिजिटल साक्षरता', icon: '📱', core: true },
  { id: 'programming', test: 'programming', label: 'Programming', hi: 'प्रोग्रामिंग', icon: '👨‍💻' },
  { id: 'data', test: 'data', label: 'Data & Excel', hi: 'डेटा व एक्सेल', icon: '📈' },
  { id: 'finance', test: 'finance', label: 'Finance & Banking', hi: 'वित्त व बैंकिंग', icon: '💰' },
  { id: 'marketing', test: 'marketing', label: 'Digital Marketing', hi: 'डिजिटल मार्केटिंग', icon: '📣' },
  { id: 'experience', label: 'Practical Experience', hi: 'व्यावहारिक अनुभव', icon: '🛠️', core: true },
];

// Guided order for the self-analysis journey.
export const JOURNEY = ['interest', 'aptitude', 'communication', 'softskills', 'digital'];

// How to fix each weakness: why it matters + concrete steps + a free resource.
export const IMPROVE = {
  aptitude: {
    why: 'Almost every company and government exam starts with an aptitude round.',
    steps: ['Practise 20 questions daily: percentages, ratio, time & work, profit-loss', 'Learn shortcuts for number series, coding-decoding and directions', 'Take one timed mock test every week and review mistakes'],
    resource: { name: 'Khan Academy – Arithmetic & Pre-algebra', url: 'https://www.khanacademy.org/math' },
  },
  communication: {
    why: 'Interviews, emails and client calls all depend on clear English.',
    steps: ['Read an English newspaper article aloud for 15 minutes daily', 'Speak with the AI Coach or a friend in English for 10 minutes a day', 'Write 5 sentences about your day and check grammar'],
    resource: { name: 'British Council – LearnEnglish (free)', url: 'https://learnenglish.britishcouncil.org' },
  },
  softskills: {
    why: 'Employers hire for attitude: ownership, teamwork and handling pressure.',
    steps: ['Join a team activity: NSS, club, hackathon or college fest', 'Practise giving and asking for feedback politely', 'Prepare 3 STAR stories of teamwork, a challenge and a mistake you fixed'],
    resource: { name: 'Skill India Digital Hub – Employability Skills', url: 'https://www.skillindiadigital.gov.in' },
  },
  digital: {
    why: 'Every job now uses email, spreadsheets, online forms and cyber-safety basics.',
    steps: ['Learn MS Excel / Google Sheets basics: SUM, sort, filter, charts', 'Create a professional email and a DigiLocker account', 'Learn to spot phishing and set up 2-factor login'],
    resource: { name: 'Microsoft Learn – Digital literacy', url: 'https://learn.microsoft.com/training/' },
  },
  programming: {
    why: 'Coding logic is the base for software, data and AI careers.',
    steps: ['Learn Python basics: variables, loops, functions (30 min/day)', 'Solve 3 easy problems daily on a coding practice site', 'Build one small project and put it on GitHub'],
    resource: { name: 'NPTEL – Programming in Python', url: 'https://nptel.ac.in' },
  },
  data: {
    why: 'Data skills are needed in almost every office role and are growing fast.',
    steps: ['Master VLOOKUP/XLOOKUP, Pivot Tables and charts in Excel', 'Learn basic SQL: SELECT, WHERE, GROUP BY, JOIN', 'Analyse one public dataset and present 3 insights'],
    resource: { name: 'Kaggle Learn – Intro to SQL', url: 'https://www.kaggle.com/learn' },
  },
  finance: {
    why: 'Banking, accounts and business roles need finance basics.',
    steps: ['Revise journal entries, ledgers and trial balance', 'Learn GST basics: CGST, SGST, IGST and returns', 'Read one banking/economy news item daily'],
    resource: { name: 'SWAYAM – Financial Accounting', url: 'https://swayam.gov.in' },
  },
  marketing: {
    why: 'Every business needs to find customers online.',
    steps: ['Run an Instagram page for a local shop for 30 days', 'Learn SEO basics and Google Business Profile', 'Complete a free Google Ads or HubSpot certification'],
    resource: { name: 'Google Skillshop', url: 'https://skillshop.withgoogle.com' },
  },
  experience: {
    why: 'Freshers with projects or internships get shortlisted far more often.',
    steps: ['Build 2 projects related to your target field and document them', 'Apply for an internship or apprenticeship (PM Internship, NATS)', 'Earn one recognised certificate (NPTEL / Skill India)'],
    resource: { name: 'PM Internship Scheme', url: 'https://pminternship.mca.gov.in' },
  },
};

export const statusOf = (v) => (v == null ? 'pending' : v >= 70 ? 'strong' : v >= 50 ? 'average' : 'weak');

/** Full self-analysis from the student's assessments and profile. */
export function computeSelfAnalysis(state) {
  const tests = state.tests || {};
  const areas = AREAS.map((a) => {
    let value = null;
    if (a.test) value = tests[a.test]?.score ?? null;
    else if (a.id === 'experience') value = state.profile?.name ? experienceScore(state.profile) : null;
    return { ...a, value, status: statusOf(value) };
  }).filter((a) => a.core || a.value != null);

  const measured = areas.filter((a) => a.value != null);
  const strengths = measured.filter((a) => a.status === 'strong').sort((x, y) => y.value - x.value);
  const average = measured.filter((a) => a.status === 'average').sort((x, y) => y.value - x.value);
  const weaknesses = measured.filter((a) => a.status === 'weak').sort((x, y) => x.value - y.value).map((a) => ({ ...a, plan: IMPROVE[a.id] }));

  const journeyDone = JOURNEY.filter((id) => tests[id]).length;
  const nextTest = JOURNEY.find((id) => !tests[id]) || null;
  const interest = riasecProfile(state);
  const personality = interest
    ? interest.code.split('').map((k) => ({ key: k, ...RIASEC[k], value: Math.round(interest.norm[k] * 100) }))
    : null;

  const overall = measured.length ? Math.round(measured.reduce((s, a) => s + a.value, 0) / measured.length) : null;
  const ready = journeyDone >= 3;

  return {
    areas,
    strengths,
    average,
    weaknesses,
    personality,
    interestCode: interest?.code || null,
    overall,
    journeyDone,
    journeyTotal: JOURNEY.length,
    nextTest,
    ready,
    careers: recommendCareers(state, 5),
    businesses: recommendBusinesses(state, 4),
  };
}
