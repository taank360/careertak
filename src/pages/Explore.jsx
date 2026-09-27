import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar } from '../components/ui.jsx';
import { recommendCareers } from '../engine/readiness.js';
import { CAREERS } from '../data/careers.js';

export default function Explore() {
  const { state, lang, t } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('All');
  const ranked = useMemo(() => recommendCareers(state, CAREERS.length), [state]);
  const sectors = ['All', ...new Set(CAREERS.map((c) => c.sector))];
  const list = ranked.filter((c) => (sector === 'All' || c.sector === sector) && (!q || `${c.title} ${c.hi} ${c.sector}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <TopBar title={t('explore')} back />
      <div className="page">
        {!state.tests.interest && (
          <button className="card tap row mb-12" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('/assess/interest')}>
            <div className="li-ico">🧭</div>
            <div className="grow"><div className="li-title">Not sure? Take the interest test</div><div className="li-sub">5 minutes · improves your fit scores</div></div>
          </button>
        )}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-3)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder="Search careers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips mt-12">{sectors.map((s) => <button key={s} className={`chip${sector === s ? ' active' : ''}`} onClick={() => setSector(s)}>{s}</button>)}</div>
        <div className="list mt-8">
          {list.map((c) => (
            <button key={c.id} className="list-item" onClick={() => nav(`/explore/${c.id}`)}>
              <div className="li-ico" style={{ fontSize: 22 }}>{c.icon}</div>
              <div className="grow">
                <div className="li-title">{lang === 'hi' ? c.hi : c.title} {c.id === state.profile.targetRole && <span className="badge">Goal</span>}</div>
                <div className="li-sub">{c.sector} · ₹{c.salary[0]}–{c.salary[1]} LPA · {c.demand}</div>
              </div>
              <div className="center"><div className="bold" style={{ color: c.fit >= 70 ? 'var(--ok)' : 'var(--brand)' }}>{c.fit}%</div><div className="tiny faint">fit</div></div>
            </button>
          ))}
        </div>
        <p className="tiny faint mt-12">Fit = 45% interests (RIASEC) + 30% current skills + 25% stream eligibility.</p>
      </div>
    </>
  );
}
