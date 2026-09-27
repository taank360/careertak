import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, Bar, scoreColor } from '../components/ui.jsx';
import { computeReadiness, bandFor, BANDS } from '../engine/readiness.js';

// Deterministic PRNG so the demo cohort is stable between visits.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const DEPTS = [
  { id: 'CSE', base: 58 }, { id: 'ECE', base: 52 }, { id: 'ME', base: 47 }, { id: 'B.Com', base: 50 },
  { id: 'BBA', base: 54 }, { id: 'B.Sc', base: 49 }, { id: 'BA', base: 43 }, { id: 'ITI', base: 45 },
];
const GAP_SKILLS = ['English Communication', 'Aptitude', 'Interview Skills', 'Resume Quality', 'Excel / Digital', 'Projects & Internships', 'SQL / Data', 'Programming'];
const FIRST = ['Aarav', 'Priya', 'Rohit', 'Sneha', 'Aman', 'Kavya', 'Vikas', 'Pooja', 'Rahul', 'Neha', 'Arjun', 'Isha', 'Deepak', 'Anjali', 'Sachin', 'Riya'];
const LAST = ['Sharma', 'Verma', 'Patel', 'Yadav', 'Tiwari', 'Singh', 'Chouhan', 'Mishra', 'Rajput', 'Jain', 'Dubey', 'Gupta'];

function makeCohort() {
  const r = rng(2026);
  const out = [];
  for (let i = 0; i < 240; i++) {
    const d = DEPTS[Math.floor(r() * DEPTS.length)];
    const score = Math.max(12, Math.min(96, Math.round(d.base + (r() - 0.5) * 50)));
    const gaps = GAP_SKILLS.filter(() => r() < 0.28 + (60 - score) / 150);
    out.push({ id: i, name: `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`, dept: d.id, score, gaps, tests: Math.floor(r() * 9) + 1 });
  }
  return out;
}

export default function Institute() {
  const { state } = useApp();
  const [dept, setDept] = useState('All');
  const me = computeReadiness(state);
  const cohort = useMemo(makeCohort, []);
  const rows = dept === 'All' ? cohort : cohort.filter((s) => s.dept === dept);
  const avg = Math.round(rows.reduce((s, x) => s + x.score, 0) / rows.length);
  const ready = Math.round((rows.filter((x) => x.score >= 60).length / rows.length) * 100);
  const bands = BANDS.map((b) => ({ ...b, n: rows.filter((x) => bandFor(x.score).id === b.id).length })).reverse();
  const deptAvg = DEPTS.map((d) => {
    const s = cohort.filter((x) => x.dept === d.id);
    return { ...d, avg: Math.round(s.reduce((a, x) => a + x.score, 0) / s.length), n: s.length };
  });
  const gapFreq = GAP_SKILLS.map((g) => ({ g, pct: Math.round((rows.filter((x) => x.gaps.includes(g)).length / rows.length) * 100) })).sort((a, b) => b.pct - a.pct);
  const atRisk = [...rows].sort((a, b) => a.score - b.score).slice(0, 5);
  const percentile = Math.round((cohort.filter((x) => x.score < me.score).length / cohort.length) * 100);

  return (
    <>
      <TopBar title="Placement Cell Dashboard" back />
      <div className="page">
        <div className="card flat small muted mb-12" style={{ padding: 10 }}>
          🏫 Institution view (demo data for 240 students). Colleges & TPOs use this to spot skill gaps across batches and plan training — aligned with the “help institutions improve employability” goal.
        </div>

        <div className="chips">{['All', ...DEPTS.map((d) => d.id)].map((d) => <button key={d} className={`chip${dept === d ? ' active' : ''}`} onClick={() => setDept(d)}>{d}</button>)}</div>

        <div className="grid-2 mt-12">
          <div className="stat"><div className="stat-num">{rows.length}</div><div className="stat-label">Students</div></div>
          <div className="stat"><div className="stat-num" style={{ color: scoreColor(avg) }}>{avg}</div><div className="stat-label">Avg readiness</div></div>
          <div className="stat"><div className="stat-num">{ready}%</div><div className="stat-label">Almost / job ready</div></div>
          <div className="stat"><div className="stat-num">{Math.round(rows.reduce((s, x) => s + x.tests, 0) / rows.length * 10) / 10}</div><div className="stat-label">Avg tests taken</div></div>
        </div>

        {me.coverage > 0 && (
          <div className="card hero mt-16">
            <div className="small" style={{ opacity: 0.85 }}>You vs. this cohort</div>
            <div className="title-lg" style={{ color: '#fff' }}>Top {Math.max(1, 100 - percentile)}% · score {me.score}</div>
            <div className="mt-8"><Bar value={percentile} glass /></div>
          </div>
        )}

        <div className="card mt-16">
          <div className="title-md mb-12">Readiness distribution</div>
          <div className="bars" style={{ height: 130, marginTop: 20 }}>
            {bands.map((b) => (
              <div key={b.id} className="b" style={{ height: `${Math.min(100, (b.n / rows.length) * 180)}%`, background: b.color }}><small>{b.n}</small></div>
            ))}
          </div>
          <div className="row tiny faint mt-8" style={{ gap: 6 }}>{bands.map((b) => <span key={b.id} className="grow center">{b.label}</span>)}</div>
        </div>

        <div className="card mt-16">
          <div className="title-md mb-8">Department-wise average</div>
          {deptAvg.map((d) => (
            <div key={d.id} style={{ padding: '6px 0' }}>
              <div className="row between small"><span className="bold">{d.id} <span className="faint tiny">({d.n})</span></span><span style={{ color: scoreColor(d.avg) }} className="bold">{d.avg}</span></div>
              <Bar value={d.avg} thin />
            </div>
          ))}
        </div>

        <div className="card mt-16">
          <div className="title-md mb-8">Most common skill gaps</div>
          <p className="tiny muted mb-8">Plan targeted training & workshops for these.</p>
          {gapFreq.map(({ g, pct }) => (
            <div key={g} style={{ padding: '6px 0' }}>
              <div className="row between small"><span>{g}</span><b>{pct}%</b></div>
              <Bar value={pct} thin color="linear-gradient(90deg,#f59e0b,#f43f5e)" />
            </div>
          ))}
        </div>

        <div className="card mt-16">
          <div className="title-md mb-8">Students needing support</div>
          {atRisk.map((s) => (
            <div key={s.id} className="row between small" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div><div className="bold">{s.name}</div><div className="tiny faint">{s.dept} · gaps: {s.gaps.slice(0, 2).join(', ') || '—'}</div></div>
              <span className="badge bad">{s.score}</span>
            </div>
          ))}
          <p className="tiny faint mt-8">Mentors can be assigned and nudges sent (production feature).</p>
        </div>
      </div>
    </>
  );
}
