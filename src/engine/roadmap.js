import { careerById } from '../data/careers.js';
import { skillGap } from './readiness.js';

const PHASES = [
  { name: 'Foundation', hi: 'नींव', weeks: [1, 2, 3], goal: 'Close your biggest skill gaps' },
  { name: 'Build', hi: 'निर्माण', weeks: [4, 5, 6], goal: 'Apply skills in real projects' },
  { name: 'Prove', hi: 'प्रमाण', weeks: [7, 8, 9], goal: 'Certify, polish resume & portfolio' },
  { name: 'Launch', hi: 'लॉन्च', weeks: [10, 11, 12], goal: 'Interview, apply and get hired' },
];

/**
 * Generates a personalised 12-week roadmap from the student's skill gaps.
 * Deterministic so it works offline; the AI backend (if configured) can enrich task text.
 */
export function generateRoadmap(state) {
  const career = careerById(state.profile?.targetRole);
  if (!career) return null;
  const gaps = skillGap(career.id, state);
  const weak = gaps.filter((g) => g.status !== 'strong');
  const focus = (weak.length ? weak : gaps).slice(0, 6);
  const hours = state.profile?.hoursPerWeek || 10;
  let n = 0;
  const task = (t) => ({ id: `t${++n}`, done: false, xp: 20, ...t });

  const weeks = {};
  for (let w = 1; w <= 12; w++) weeks[w] = [];

  // Foundation: learn top gap skills, one or two per week.
  focus.slice(0, 3).forEach((g, i) => {
    const c = career.courses[i % career.courses.length];
    weeks[i + 1].push(task({ type: 'learn', skill: g.id, title: `Learn ${g.name}`, detail: `${c.title} — ${c.provider}. Target level ${g.required}/5 (now ${g.current}).`, link: c.url }));
    weeks[i + 1].push(task({ type: 'practice', skill: g.id, title: `Practise ${g.name} daily (${Math.max(3, Math.round(hours / 3))} hrs/week)`, detail: 'Notes + 20 practice problems / exercises. Log what you learned.' }));
  });
  focus.slice(3, 6).forEach((g, i) => {
    const c = career.courses[(i + 3) % career.courses.length];
    weeks[i + 4].push(task({ type: 'learn', skill: g.id, title: `Level up: ${g.name}`, detail: `${c.title} — ${c.provider}`, link: c.url }));
  });
  weeks[1].push(task({ type: 'test', title: 'Take the Aptitude test (baseline)', route: '/assess/aptitude', xp: 30 }));
  weeks[2].push(task({ type: 'test', title: 'Take the Communication test', route: '/assess/communication', xp: 30 }));
  weeks[3].push(task({ type: 'practice', skill: 'communication', title: 'Speak English 15 min/day', detail: 'Read aloud, record yourself, or talk to the AI Coach.', route: '/chat' }));

  // Build: projects.
  career.projects.forEach((p, i) => {
    weeks[4 + i]?.push(task({ type: 'build', title: `Project: ${p}`, detail: 'Publish it (GitHub / Drive / portfolio) and add it to your profile.', xp: 50, route: '/profile' }));
  });
  weeks[6].push(task({ type: 'practice', skill: 'teamwork', title: 'Join a club, hackathon or NSS activity', detail: 'Team experience gives you STAR stories for interviews.' }));

  // Prove: certs, resume, portfolio.
  const cert = career.certs.find((c) => c !== '—');
  if (cert) weeks[7].push(task({ type: 'learn', title: `Earn a certificate: ${cert}`, detail: 'Certificates boost resume shortlisting.', xp: 60 }));
  weeks[7].push(task({ type: 'test', title: 'Retake the Aptitude test — aim for +15%', route: '/assess/aptitude', xp: 30 }));
  weeks[8].push(task({ type: 'build', title: 'Build an ATS-friendly resume', detail: 'Use the Resume Builder, then score it — target 75+.', route: '/resume', xp: 40 }));
  weeks[8].push(task({ type: 'build', title: 'Create / update your LinkedIn profile', detail: 'Headline with target role, photo, projects and skills.', link: 'https://www.linkedin.com' }));
  weeks[9].push(task({ type: 'practice', title: 'AI Mock Interview — HR round', route: '/interview', xp: 40 }));
  weeks[9].push(task({ type: 'practice', title: `AI Mock Interview — ${career.title} technical`, route: '/interview', xp: 40 }));

  // Launch: apply.
  weeks[10].push(task({ type: 'apply', title: 'Register on MP Rojgar Portal & NCS', link: 'https://mprojgar.gov.in', xp: 30 }));
  weeks[10].push(task({ type: 'apply', title: 'Apply to 5 matching opportunities', route: '/jobs', xp: 50 }));
  weeks[11].push(task({ type: 'apply', title: 'Apply to PM Internship / apprenticeship', link: 'https://pminternship.mca.gov.in', xp: 40 }));
  weeks[11].push(task({ type: 'practice', title: 'Two more mock interviews — target 75+', route: '/interview', xp: 40 }));
  weeks[12].push(task({ type: 'apply', title: 'Attend a Rojgar Mela / campus drive', detail: 'Check district job fairs on MP Rojgar Portal.', xp: 50 }));
  weeks[12].push(task({ type: 'test', title: 'Re-check your Readiness Score', route: '/report', xp: 30 }));

  return {
    role: career.id,
    title: career.title,
    generatedAt: Date.now(),
    hoursPerWeek: hours,
    phases: PHASES.map((p) => ({
      ...p,
      weeks: p.weeks.map((w) => ({ week: w, tasks: weeks[w] })),
    })),
  };
}

export function roadmapProgress(roadmap) {
  if (!roadmap) return { done: 0, total: 0, pct: 0, currentWeek: 1 };
  const all = roadmap.phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks));
  const done = all.filter((t) => t.done).length;
  let currentWeek = 12;
  for (const p of roadmap.phases) {
    for (const w of p.weeks) {
      if (w.tasks.some((t) => !t.done)) {
        currentWeek = Math.min(currentWeek, w.week);
      }
    }
  }
  return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0, currentWeek };
}

