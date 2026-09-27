import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, ChevronRight, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, Bar, Empty } from '../components/ui.jsx';
import { generateRoadmap, roadmapProgress } from '../engine/roadmap.js';
import { careerById } from '../data/careers.js';

const TYPE = { learn: ['📘', 'Learn'], practice: ['🏋️', 'Practice'], build: ['🛠️', 'Build'], apply: ['📨', 'Apply'], test: ['📝', 'Test'] };

export default function Roadmap() {
  const { state, update, updateProfile, addXP, notify, t, lang } = useApp();
  const nav = useNavigate();
  const career = careerById(state.profile.targetRole);
  const rm = state.roadmap;
  const stale = rm && career && rm.role !== career.id;
  const prog = roadmapProgress(rm);
  const [openWeek, setOpenWeek] = useState(prog.currentWeek);
  const [hours, setHours] = useState(state.profile.hoursPerWeek || 10);

  const generate = () => {
    updateProfile({ hoursPerWeek: hours });
    const r = generateRoadmap({ ...state, profile: { ...state.profile, hoursPerWeek: hours } });
    update((s) => ({ ...s, roadmap: r }));
    setOpenWeek(1);
    addXP(rm ? 0 : 30, rm ? null : 'Roadmap created');
    if (rm) notify('Roadmap regenerated');
  };

  const toggle = (taskId) => {
    const task = rm.phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks)).find((tk) => tk.id === taskId);
    if (!task) return;
    const done = !task.done;
    update((s) => {
      const phases = s.roadmap.phases.map((p) => ({
        ...p,
        weeks: p.weeks.map((w) => ({ ...w, tasks: w.tasks.map((tk) => (tk.id === taskId ? { ...tk, done } : tk)) })),
      }));
      const boost = { ...s.skillBoost };
      if (task.skill && (task.type === 'learn' || task.type === 'practice')) {
        boost[task.skill] = Math.max(0, Math.min(2, (boost[task.skill] || 0) + (done ? 0.5 : -0.5)));
      }
      return { ...s, roadmap: { ...s.roadmap, phases }, skillBoost: boost, xp: Math.max(0, s.xp + (done ? task.xp : -task.xp)) };
    });
    if (done) notify(`+${task.xp} XP · Task done`, 'xp');
  };

  if (!career) {
    return (
      <>
        <TopBar title={t('roadmap')} />
        <div className="page"><div className="card"><Empty emoji="🧭" title="Pick a career goal first" sub="Your roadmap is built from the gap between your skills and your target role." action={<button className="btn primary" onClick={() => nav('/explore')}>Explore careers</button>} /></div></div>
      </>
    );
  }

  if (!rm || stale) {
    return (
      <>
        <TopBar title={t('roadmap')} />
        <div className="page">
          <div className="card hero">
            <div style={{ fontSize: 40 }}>🗺️</div>
            <div className="title-lg mt-8" style={{ color: '#fff' }}>12-week plan to become a {lang === 'hi' ? career.hi : career.title}</div>
            <p className="small mt-8" style={{ opacity: 0.9 }}>AI builds a week-by-week plan from your skill gaps with free courses, projects, tests, mock interviews and applications.</p>
          </div>
          {stale && <div className="card mt-12 small">Your goal changed from <b>{careerById(rm.role)?.title}</b>. Generate a new roadmap for your new goal.</div>}
          <div className="card mt-16">
            <div className="title-md">How many hours per week can you give?</div>
            <div className="chips wrap mt-12">
              {[5, 10, 15, 20, 30].map((h) => <button key={h} className={`chip brand${hours === h ? ' active' : ''}`} onClick={() => setHours(h)}>{h} hrs</button>)}
            </div>
            <button className="btn primary block mt-16" onClick={generate}>{t('generate')}</button>
          </div>
          <div className="grid-2 mt-16">
            {[['Foundation', 'Weeks 1–3', '🧱'], ['Build', 'Weeks 4–6', '🛠️'], ['Prove', 'Weeks 7–9', '🏅'], ['Launch', 'Weeks 10–12', '🚀']].map(([a, b, e]) => (
              <div key={a} className="stat"><div style={{ fontSize: 22 }}>{e}</div><div className="bold mt-8">{a}</div><div className="tiny faint">{b}</div></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t('roadmap')} right={<button className="icon-btn" aria-label="Regenerate" onClick={() => confirm('Regenerate roadmap? Task progress will reset.') && generate()}><RefreshCw size={19} /></button>} />
      <div className="page">
        <div className="card hero">
          <div className="row between">
            <div>
              <div className="small" style={{ opacity: 0.85 }}>{career.icon} {lang === 'hi' ? career.hi : rm.title}</div>
              <div className="title-lg" style={{ color: '#fff' }}>{t('week')} {prog.currentWeek} of 12</div>
            </div>
            <div className="center"><div className="title-lg" style={{ color: '#fff' }}>{prog.pct}%</div><div className="tiny" style={{ opacity: 0.85 }}>{prog.done}/{prog.total} tasks</div></div>
          </div>
          <div className="mt-12"><Bar value={prog.pct} glass /></div>
          <div className="tiny mt-8" style={{ opacity: 0.85 }}>~{rm.hoursPerWeek} hrs/week · completing learn/practice tasks raises your skill levels</div>
        </div>

        {rm.phases.map((p) => {
          const pt = p.weeks.flatMap((w) => w.tasks);
          const pd = pt.filter((x) => x.done).length;
          return (
            <div key={p.name} className="section">
              <div className="section-head">
                <h2>{lang === 'hi' ? p.hi : p.name} <span className="faint small" style={{ fontWeight: 500 }}>· {p.goal}</span></h2>
                <span className="badge">{pd}/{pt.length}</span>
              </div>
              <div className="list">
                {p.weeks.map((w) => {
                  const wd = w.tasks.filter((x) => x.done).length;
                  const open = openWeek === w.week;
                  return (
                    <div key={w.week} style={{ borderBottom: '1px solid var(--border)' }}>
                      <button className="list-item" style={{ borderBottom: 0 }} onClick={() => setOpenWeek(open ? 0 : w.week)}>
                        <div className="li-ico" style={wd === w.tasks.length && w.tasks.length ? { background: 'var(--ok)', color: '#fff' } : {}}>
                          {wd === w.tasks.length && w.tasks.length ? <Check size={20} /> : <b>{w.week}</b>}
                        </div>
                        <div className="grow">
                          <div className="li-title">{t('week')} {w.week}</div>
                          <div className="li-sub ellipsis">{w.tasks.map((x) => x.title).join(' · ')}</div>
                        </div>
                        <span className="tiny faint">{wd}/{w.tasks.length}</span>
                        <ChevronRight size={18} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                      </button>
                      {open && (
                        <div style={{ padding: '0 16px 8px' }}>
                          {w.tasks.map((tk) => (
                            <div key={tk.id} className={`task${tk.done ? ' done' : ''}`}>
                              <button className={`check${tk.done ? ' on' : ''}`} onClick={() => toggle(tk.id)} aria-label={tk.done ? 'Mark not done' : 'Mark done'}>{tk.done && <Check size={16} />}</button>
                              <div className="grow">
                                <div className="task-title">{TYPE[tk.type]?.[0]} {tk.title}</div>
                                {tk.detail && <div className="tiny muted mt-8" style={{ marginTop: 2 }}>{tk.detail}</div>}
                                <div className="row mt-8" style={{ gap: 6 }}>
                                  <span className="badge">{TYPE[tk.type]?.[1]}</span>
                                  <span className="badge warn">+{tk.xp} XP</span>
                                  {tk.link && <a className="btn xs soft" href={tk.link} target="_blank" rel="noreferrer">Open <ExternalLink size={12} /></a>}
                                  {tk.route && <button className="btn xs soft" onClick={() => nav(tk.route)}>Go <ChevronRight size={12} /></button>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
