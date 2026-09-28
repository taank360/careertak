import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, ScoreRing, Empty } from '../components/ui.jsx';
import { skillGap, roleMatch } from '../engine/readiness.js';
import { CAREERS, careerById } from '../data/careers.js';
import { SKILLS, SKILL_CATS, LEVELS } from '../data/skills.js';

function GapRow({ g }) {
  const color = g.status === 'strong' ? 'var(--ok)' : g.status === 'close' ? 'var(--brand)' : 'var(--bad)';
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="row between">
        <div className="bold small row" style={{ gap: 6 }}>{g.name}{g.verified && <ShieldCheck size={14} color="var(--ok)" aria-label="Verified by test" />}</div>
        <span className={`badge ${g.status === 'strong' ? 'ok' : g.status === 'close' ? '' : 'bad'}`}>{g.status === 'strong' ? 'Strong' : g.status === 'close' ? 'Almost' : `Gap ${g.gap}`}</span>
      </div>
      <div className="bar mt-8" style={{ position: 'relative', height: 10, overflow: 'visible' }}>
        <span style={{ width: `${(g.current / 5) * 100}%`, background: color }} />
        <i style={{ position: 'absolute', left: `calc(${(g.required / 5) * 100}% - 1px)`, top: -4, bottom: -4, width: 3, borderRadius: 2, background: 'var(--text)' }} title="Required level" />
      </div>
      <div className="row between tiny faint mt-8"><span>You: {g.current}/5</span><span>Weight {'★'.repeat(g.weight)}</span><span>Needed: {g.required}/5</span></div>
    </div>
  );
}

export default function Skills() {
  const { state, update, updateProfile, lang } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState('gap');
  const [role, setRole] = useState(state.profile.targetRole || CAREERS[0].id);
  const career = careerById(role);
  const gaps = useMemo(() => skillGap(role, state), [role, state]);
  const match = roleMatch(role, state);
  const roleSkillIds = career.skills.map(([id]) => id);
  const [showAll, setShowAll] = useState(false);

  const setLevel = (id, l) => update((s) => ({ ...s, skills: { ...s.skills, [id]: l } }));

  const grouped = Object.keys(SKILL_CATS).map((cat) => ({
    cat,
    ids: Object.keys(SKILLS).filter((id) => SKILLS[id].cat === cat && (showAll || roleSkillIds.includes(id) || state.skills[id] != null)),
  })).filter((g) => g.ids.length);

  return (
    <>
      <TopBar title="Skill Gap Analysis" back />
      <div className="page">
        <div className="seg mb-12">
          <button className={tab === 'gap' ? 'active' : ''} onClick={() => setTab('gap')}>Gap analysis</button>
          <button className={tab === 'rate' ? 'active' : ''} onClick={() => setTab('rate')}>Rate my skills</button>
        </div>

        <div className="field">
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Compare against role">
            {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.icon} {lang === 'hi' ? c.hi : c.title}{c.id === state.profile.targetRole ? ' (goal)' : ''}</option>)}
          </select>
        </div>

        {tab === 'gap' ? (
          <>
            <div className="card row" style={{ gap: 16 }}>
              <ScoreRing value={match} size={96} stroke={10} color="#0b7a75" track="var(--surface-2)" label={`${match}%`} />
              <div className="grow">
                <div className="title-md">{career.icon} {lang === 'hi' ? career.hi : career.title}</div>
                <div className="small muted mt-8">
                  {gaps.filter((g) => g.status === 'strong').length} strong · {gaps.filter((g) => g.status === 'close').length} almost · {gaps.filter((g) => g.status === 'gap').length} to build
                </div>
                {role !== state.profile.targetRole && <button className="btn xs soft mt-8" onClick={() => updateProfile({ targetRole: role })}>Set as my goal</button>}
              </div>
            </div>

            {Object.keys(state.skills).length === 0 && Object.keys(state.tests).length === 0 ? (
              <div className="card mt-16"><Empty emoji="📋" title="Rate your skills first" sub="We need to know your current level to find gaps." action={<button className="btn primary" onClick={() => setTab('rate')}>Rate my skills</button>} /></div>
            ) : (
              <div className="card mt-16" style={{ paddingTop: 4, paddingBottom: 4 }}>
                {gaps.map((g) => <GapRow key={g.id} g={g} />)}
              </div>
            )}
            <p className="tiny faint mt-12"><ShieldCheck size={12} style={{ display: 'inline', verticalAlign: -2 }} /> Verified = blended with your test score. Black marker = level employers expect.</p>

            <div className="card mt-16">
              <div className="title-md">Priority to learn</div>
              <div className="small muted mt-8">Ranked by gap × importance for this role.</div>
              <ol className="small mt-8" style={{ paddingLeft: 18, margin: '8px 0 0' }}>
                {gaps.filter((g) => g.status !== 'strong').slice(0, 4).map((g) => <li key={g.id} style={{ marginBottom: 4 }}><b>{g.name}</b> — raise from {g.current} to {g.required}</li>)}
                {gaps.every((g) => g.status === 'strong') && <li>You meet all requirements — time to apply! 🎉</li>}
              </ol>
              <div className="row mt-16">
                <button className="btn soft grow" onClick={() => nav(`/explore/${role}`)}>Courses</button>
                <button className="btn primary grow" onClick={() => { if (role !== state.profile.targetRole) updateProfile({ targetRole: role }); nav('/roadmap'); }}>Build roadmap</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="small muted mb-12">0 = none · 1 beginner · 2 basic · 3 intermediate · 4 advanced · 5 expert</p>
            {grouped.map(({ cat, ids }) => (
              <div key={cat} className="section" style={{ marginTop: 12 }}>
                <div className="section-head"><h2>{SKILL_CATS[cat]}</h2></div>
                <div className="stack">
                  {ids.map((id) => (
                    <div key={id} className="card" style={{ padding: 12 }}>
                      <div className="row between mb-8">
                        <span className="bold small">{lang === 'hi' && SKILLS[id].hi ? SKILLS[id].hi : SKILLS[id].name}{roleSkillIds.includes(id) && <span className="badge" style={{ marginLeft: 6 }}>role</span>}</span>
                        <span className="tiny faint">{state.skills[id] != null ? LEVELS[state.skills[id]] : 'Not rated'}</span>
                      </div>
                      <div className="level-picker">
                        {[0, 1, 2, 3, 4, 5].map((l) => (
                          <button key={l} className={state.skills[id] != null && state.skills[id] >= l ? 'on' : ''} onClick={() => setLevel(id, l)} aria-label={`${SKILLS[id].name} level ${l}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn soft block mt-16" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show only relevant skills' : 'Show all skills'}</button>
            <button className="btn primary block mt-12" onClick={() => setTab('gap')}>See my gaps</button>
          </>
        )}
      </div>
    </>
  );
}
