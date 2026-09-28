import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeReadiness, skillGap, roleMatch, recommendCareers, nextActions, effectiveLevel, bandFor } from '../src/engine/readiness.js';
import { generateRoadmap, roadmapProgress } from '../src/engine/roadmap.js';
import { analyzeResume } from '../src/engine/resume.js';
import { evaluateAnswer, buildInterview } from '../src/engine/interview.js';
import { localCounselor, isHindi } from '../src/engine/counselor.js';
import { CAREERS } from '../src/data/careers.js';
import { SKILLS } from '../src/data/skills.js';
import { MODULES } from '../src/data/assessments.js';

const base = {
  profile: { name: 'Priya', targetRole: 'data-analyst', education: 'ug', stream: 'engineering', projects: [], internships: [], certifications: [], interests: [] },
  skills: {}, skillBoost: {}, tests: {}, interviews: [], resume: null, settings: { lang: 'en' },
};

test('data integrity: every career skill and module skill exists', () => {
  for (const c of CAREERS) for (const [id, req, w] of c.skills) {
    assert.ok(SKILLS[id], `${c.id} references unknown skill ${id}`);
    assert.ok(req >= 1 && req <= 5 && w >= 1 && w <= 3);
  }
  for (const m of MODULES) for (const q of m.questions) {
    if (m.type === 'likert') assert.match(q.k, /^[RIASEC]$/);
    else if (m.type === 'sjt') assert.equal(q.s.length, q.o.length);
    else assert.ok(q.a >= 0 && q.a < q.o.length, `${m.id}: ${q.q}`);
  }
});

test('empty state has zero readiness and zero coverage beyond experience', () => {
  const r = computeReadiness({ ...base, profile: { ...base.profile, name: '' } });
  assert.equal(r.score, 0);
  assert.equal(r.coverage, 0);
});

test('readiness renormalises over measured dimensions', () => {
  const r = computeReadiness({ ...base, tests: { aptitude: { score: 80 }, communication: { score: 60 } } });
  const apt = r.dims.find((d) => d.id === 'aptitude');
  assert.equal(apt.value, 80);
  assert.ok(r.score > 0 && r.score <= 100);
  assert.ok(r.coverage > 24 && r.coverage < 100);
});

test('test evidence blends with self-rating', () => {
  const s = { ...base, skills: { excel: 5 }, tests: { data: { score: 20 } } };
  assert.equal(effectiveLevel('excel', s), 3); // 0.5*5 + 0.5*1
  assert.equal(effectiveLevel('figma', s), 0);
});

test('skill gap is sorted by priority and role match grows with skills', () => {
  const low = roleMatch('data-analyst', base);
  const s = { ...base, skills: { excel: 4, sql: 4, statistics: 3, powerbi: 3, python: 3, aptitude: 4, communication: 3, presentation: 3, problem: 3 } };
  assert.equal(roleMatch('data-analyst', s), 100);
  assert.ok(low < 10);
  const gaps = skillGap('data-analyst', base);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i - 1].priority >= gaps[i].priority);
});

test('bands', () => {
  assert.equal(bandFor(85).id, 'ready');
  assert.equal(bandFor(60).id, 'almost');
  assert.equal(bandFor(45).id, 'developing');
  assert.equal(bandFor(5).id, 'beginner');
});

test('recommendations respect interest profile', () => {
  const artsy = { ...base, profile: { ...base.profile, stream: 'arts' }, tests: { interest: { riasec: { R: 1, I: 2, A: 15, S: 5, E: 12, C: 1 } } } };
  const top = recommendCareers(artsy, 3).map((c) => c.id);
  assert.ok(top.some((id) => ['ui-ux-designer', 'digital-marketer', 'entrepreneur'].includes(id)), top.join());
});

test('next actions start with missing essentials', () => {
  const ids = nextActions(base).map((a) => a.id);
  assert.ok(ids.includes('t-apt'));
  assert.ok(ids.includes('resume'));
  assert.ok(!ids.includes('goal'));
});

test('roadmap has 12 weeks and tracks progress', () => {
  const rm = generateRoadmap(base);
  const weeks = rm.phases.flatMap((p) => p.weeks);
  assert.equal(weeks.length, 12);
  weeks.forEach((w) => assert.ok(w.tasks.length > 0, `week ${w.week} empty`));
  assert.equal(roadmapProgress(rm).pct, 0);
  weeks[0].tasks.forEach((t) => (t.done = true));
  const p = roadmapProgress(rm);
  assert.ok(p.pct > 0);
  assert.equal(p.currentWeek, 2);
  assert.equal(generateRoadmap({ ...base, profile: { ...base.profile, targetRole: '' } }), null);
});

test('resume analyser rewards structure, verbs and metrics', () => {
  const weak = analyzeResume('I am hard working. Responsible for various tasks etc.', 'data-analyst');
  const strong = analyzeResume(`Priya Sharma | priya@mail.com | 9876543210 | linkedin.com/in/priya | github.com/priya
SUMMARY
Aspiring Data Analyst skilled in Excel, SQL, Python and Power BI.
EDUCATION
B.Tech CSE, RGPV Bhopal (2026) CGPA 8.1
SKILLS
Excel (pivot, vlookup), SQL, Python (pandas), Power BI dashboards, statistics, communication
PROJECTS
- Built a Power BI sales dashboard used by 25 users; reduced reporting time by 40%
- Analysed MP crop production data for 55 districts using Python and SQL
- Created an attendance tracker in Google Sheets for 120 students
EXPERIENCE
- Data Intern, Logistics firm (2 months): automated weekly reports, saved 6 hours per week
- Organised a college data workshop for 80 students
CERTIFICATIONS
- NPTEL Python for Data Science
ACHIEVEMENTS
- Won 2nd prize in college hackathon; led a team of 4 and presented results`, 'data-analyst');
  assert.ok(weak.score < 35, `weak ${weak.score}`);
  assert.ok(strong.score >= 75, `strong ${strong.score}`);
  assert.ok(strong.keywords.found.length > weak.keywords.found.length);
});

test('interview evaluator prefers structured, relevant answers', () => {
  const q = { q: 'Describe a time you worked in a team.', kind: 'Behavioural', k: ['team', 'role', 'task', 'action', 'result', 'challenge'] };
  const poor = evaluateAnswer(q, 'I like teams.');
  const good = evaluateAnswer(q, 'During my final year project, our team of 4 had a challenge: the task was to deliver a dashboard in two weeks. My role was lead. I planned the work, I built the SQL queries and I organised daily check-ins. As a result we delivered on time and improved report speed by 40%. I learned how to delegate.');
  assert.ok(good.score > poor.score + 30, `${good.score} vs ${poor.score}`);
  assert.equal(buildInterview('data-analyst', 'technical').length, 5);
  assert.equal(buildInterview('unknown-role', 'mixed').length, 5);
});

test('offline counsellor answers in Hindi and English', () => {
  assert.ok(isHindi('मुझे आगे क्या करना चाहिए?'));
  assert.ok(isHindi('mujhe naukri chahiye'));
  assert.ok(!isHindi('What should I do next?'));
  assert.match(localCounselor('What should I do next?', base), /next-step plan/);
  assert.match(localCounselor('मुझे आगे क्या करना चाहिए?', base), /अगले कदम/);
  assert.match(localCounselor('salary for data analyst', base), /LPA/);
  assert.match(localCounselor('I feel stressed and want to give up', base), /14416/);
});

import { computeSelfAnalysis } from '../src/engine/selfanalysis.js';
import { recommendBusinesses } from '../src/engine/readiness.js';
import { CAREER_FUTURE, BUSINESSES, DECLINING, futureOf, trendOf, demandSeries } from '../src/data/future.js';

test('every career has future outlook data; businesses reference real skills', () => {
  for (const c of CAREERS) assert.ok(CAREER_FUTURE[c.id], `missing future data for ${c.id}`);
  for (const b of BUSINESSES) for (const s of b.skills) assert.ok(SKILLS[s], `${b.id}: unknown skill ${s}`);
  for (const d of DECLINING) assert.ok(CAREERS.some((c) => c.id === d.switchTo), `${d.title}: bad switchTo`);
});

test('future helpers: series, trend and score ordering', () => {
  const s = demandSeries(0.1);
  assert.equal(s[0].value, 100);
  assert.ok(s[s.length - 1].value > 150);
  assert.equal(trendOf(-0.05).id, 'declining');
  assert.equal(trendOf(0.2).id, 'boom');
  assert.ok(futureOf('ai-ml-engineer').score > futureOf('accountant').score);
});

test('future demand lifts growing careers in recommendations', () => {
  const ids = recommendCareers(base, 18).map((c) => c.id);
  assert.ok(ids.indexOf('ai-ml-engineer') < ids.indexOf('accountant'));
  const biz = recommendBusinesses(base, 13).map((b) => b.id);
  assert.ok(biz.indexOf('solar-business') < biz.indexOf('csc-centre'));
});

test('self analysis splits strengths and weaknesses with action plans', () => {
  const pending = computeSelfAnalysis(base);
  assert.equal(pending.ready, false);
  assert.equal(pending.nextTest, 'interest');
  const s = { ...base, tests: { interest: { riasec: { R: 2, I: 12, A: 4, S: 3, E: 6, C: 9 } }, aptitude: { score: 85 }, communication: { score: 40 }, softskills: { score: 60 } } };
  const a = computeSelfAnalysis(s);
  assert.equal(a.ready, true);
  assert.ok(a.strengths.some((x) => x.id === 'aptitude'));
  const weak = a.weaknesses.find((x) => x.id === 'communication');
  assert.ok(weak && weak.plan.steps.length >= 3 && weak.plan.resource.url.startsWith('https://'));
  assert.ok(a.average.some((x) => x.id === 'softskills'));
  assert.equal(a.interestCode, 'ICE');
  assert.equal(a.careers.length, 5);
  assert.ok(a.careers.every((c) => c.future && c.future.series.length === 6));
  assert.equal(a.businesses.length, 4);
});
