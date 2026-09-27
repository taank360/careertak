import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ExternalLink, TrendingUp, IndianRupee, Flame } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, ScoreRing } from '../components/ui.jsx';
import { careerById, RIASEC } from '../data/careers.js';
import { roleMatch, skillGap } from '../engine/readiness.js';
import { OPPORTUNITIES } from '../data/opportunities.js';

export default function CareerDetail() {
  const { id } = useParams();
  const c = careerById(id);
  const { state, updateProfile, addXP, notify, lang } = useApp();
  const nav = useNavigate();
  if (!c) return <Navigate to="/explore" replace />;
  const isGoal = state.profile.targetRole === c.id;
  const match = roleMatch(c.id, state);
  const gaps = skillGap(c.id, state);
  const opps = OPPORTUNITIES.filter((o) => o.career === c.id);

  const setGoal = () => {
    const first = !state.profile.targetRole;
    updateProfile({ targetRole: c.id });
    if (first) addXP(30, 'Career goal set');
    else notify(`Goal set: ${c.title}`);
  };

  return (
    <>
      <TopBar title="" back />
      <div className="page">
        <div className="center">
          <div style={{ fontSize: 56 }}>{c.icon}</div>
          <h1 className="title-xl mt-8">{lang === 'hi' ? c.hi : c.title}</h1>
          <div className="small muted">{c.sector} · {c.riasec.split('').map((k) => RIASEC[k].name).join(' / ')}</div>
        </div>
        <div className="grid-3 mt-16">
          <div className="stat center"><IndianRupee size={16} style={{ margin: '0 auto' }} /><div className="bold mt-8">{c.salary[0]}–{c.salary[1]}L</div><div className="stat-label">Entry salary</div></div>
          <div className="stat center"><Flame size={16} style={{ margin: '0 auto' }} /><div className="bold mt-8">{c.demand}</div><div className="stat-label">Demand</div></div>
          <div className="stat center"><TrendingUp size={16} style={{ margin: '0 auto' }} /><div className="bold mt-8">+{c.growth}%</div><div className="stat-label">Growth</div></div>
        </div>
        <div className="card mt-16"><p className="small">{c.about}</p></div>

        <div className="card mt-16 row" style={{ gap: 16 }}>
          <ScoreRing value={match} size={84} stroke={9} color="#6366f1" track="var(--surface-2)" label={`${match}%`} />
          <div className="grow">
            <div className="title-md">Your skill match</div>
            <div className="small muted">{gaps.filter((g) => g.status !== 'strong').length} skills to build</div>
            <button className="btn xs soft mt-8" onClick={() => nav('/skills')}>See gap analysis</button>
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Skills employers want</h2></div>
          <div className="chips wrap">
            {gaps.map((g) => <span key={g.id} className={`badge ${g.status === 'strong' ? 'ok' : g.status === 'gap' ? 'bad' : ''}`}>{g.name} · {g.required}/5</span>)}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Free & recommended courses</h2></div>
          <div className="list">
            {c.courses.map((k) => (
              <a key={k.title} className="list-item" href={k.url} target="_blank" rel="noreferrer">
                <div className="li-ico">📘</div>
                <div className="grow"><div className="li-title">{k.title}</div><div className="li-sub">{k.provider} · ~{k.hours} hrs · {k.free ? 'Free' : 'Paid / low-cost'}</div></div>
                <ExternalLink size={16} className="faint" />
              </a>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Portfolio projects</h2></div>
          <div className="card stack small">{c.projects.map((p) => <div key={p}>🛠️ {p}</div>)}</div>
        </div>

        {c.certs.some((x) => x !== '—') && (
          <div className="section">
            <div className="section-head"><h2>Valued certifications</h2></div>
            <div className="chips wrap">{c.certs.filter((x) => x !== '—').map((x) => <span key={x} className="badge">{x}</span>)}</div>
          </div>
        )}

        {opps.length > 0 && (
          <div className="section">
            <div className="section-head"><h2>Open opportunities</h2></div>
            <div className="list">
              {opps.map((o) => (
                <button key={o.id} className="list-item" onClick={() => nav('/jobs')}>
                  <div className="li-ico">💼</div>
                  <div className="grow"><div className="li-title">{o.title}</div><div className="li-sub">{o.city} · {o.stipend}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sticky-cta">
          {isGoal ? (
            <button className="btn primary block" onClick={() => nav('/roadmap')}>View my roadmap</button>
          ) : (
            <button className="btn primary block" onClick={setGoal}>🎯 Set as my career goal</button>
          )}
        </div>
      </div>
    </>
  );
}
