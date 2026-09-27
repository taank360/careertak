import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Download, WifiOff } from 'lucide-react';
import { useApp, levelFromXP } from '../store/AppContext.jsx';
import { Logo, ScoreRing, Bar } from '../components/ui.jsx';
import { computeReadiness, nextActions, recommendCareers, roleMatch } from '../engine/readiness.js';
import { roadmapProgress } from '../engine/roadmap.js';
import { careerById } from '../data/careers.js';

function useInstallPrompt() {
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  return evt;
}

function useOnline() {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true);
    const b = () => setOn(false);
    window.addEventListener('online', a);
    window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);
  return on;
}

export default function Home() {
  const { state, t, lang, snapshot } = useApp();
  const nav = useNavigate();
  const install = useInstallPrompt();
  const online = useOnline();
  const r = useMemo(() => computeReadiness(state), [state]);
  const actions = useMemo(() => nextActions(state).slice(0, 4), [state]);
  const recs = useMemo(() => recommendCareers(state, 4), [state]);
  const career = careerById(state.profile.targetRole);
  const lvl = levelFromXP(state.xp);
  const rp = roadmapProgress(state.roadmap);
  const first = state.profile.name.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greet = lang === 'hi' ? 'नमस्ते' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const testsDone = Object.keys(state.tests).length;

  useEffect(() => { if (r.coverage > 0) snapshot(r.score); }, [r.score, r.coverage, snapshot]);

  const tools = [
    ['📋', t('skillGap'), '/skills', '#6366f1'],
    ['📄', t('resume'), '/resume', '#0ea5e9'],
    ['🎤', t('interview'), '/interview', '#f59e0b'],
    ['🧭', t('explore'), '/explore', '#f43f5e'],
    ['📊', t('report'), '/report', '#10b981'],
    ['🗺️', t('roadmap'), '/roadmap', '#8b5cf6'],
    ['🏛️', t('schemes'), '/jobs?tab=schemes', '#eab308'],
    ['🏫', t('institute'), '/institute', '#14b8a6'],
  ];

  return (
    <>
      <header className="topbar">
        <div className="logo-brand"><Logo /><span className="brand-name">Career<span>Tak</span></span></div>
        <span className="badge warn" title="Daily streak"><Flame size={13} /> {state.streak.count}</span>
        <button className="avatar" onClick={() => nav('/profile')} aria-label="Profile">{first[0]?.toUpperCase()}</button>
      </header>

      <div className="page">
        {!online && <div className="card flat row small mb-12" style={{ padding: 10 }}><WifiOff size={16} /> {t('offline')}</div>}

        <p className="muted small">{greet},</p>
        <h2 className="title-xl mb-12">{first} 👋</h2>

        <Link to="/report" className="card hero tap" style={{ display: 'block' }}>
          <div className="row" style={{ gap: 16 }}>
            <ScoreRing value={r.score} size={116} sub="/ 100" />
            <div className="grow">
              <div className="small" style={{ opacity: 0.85 }}>{t('readinessScore')}</div>
              <div className="title-lg" style={{ color: '#fff' }}>{r.band.emoji} {lang === 'hi' ? r.band.hi : r.band.label}</div>
              <div className="tiny mt-8" style={{ opacity: 0.85 }}>{t('basedOn', { n: r.coverage })}</div>
              <div className="mt-8"><Bar value={r.coverage} thin glass /></div>
              <div className="tiny mt-8 row" style={{ gap: 4, opacity: 0.95 }}>{t('report')} <ChevronRight size={14} /></div>
            </div>
          </div>
        </Link>

        <div className="grid-3 mt-12">
          <div className="stat"><div className="stat-num">{lvl.level}</div><div className="stat-label">{t('level')} · {state.xp} XP</div><div className="mt-8"><Bar value={(lvl.into / lvl.next) * 100} thin /></div></div>
          <div className="stat"><div className="stat-num">{testsDone}<span className="faint small">/9</span></div><div className="stat-label">{t('assessments')}</div></div>
          <div className="stat"><div className="stat-num">{rp.pct}%</div><div className="stat-label">{t('roadmap')}</div></div>
        </div>

        {career ? (
          <Link to="/skills" className="card tap row mt-12" style={{ color: 'var(--text)' }}>
            <div className="li-ico" style={{ fontSize: 24 }}>{career.icon}</div>
            <div className="grow">
              <div className="tiny faint bold">{t('yourGoal').toUpperCase()}</div>
              <div className="li-title">{lang === 'hi' ? career.hi : career.title}</div>
              <div className="mt-8"><Bar value={roleMatch(career.id, state)} thin /></div>
            </div>
            <div className="center"><div className="bold">{roleMatch(career.id, state)}%</div><div className="tiny faint">{t('match')}</div></div>
          </Link>
        ) : (
          <Link to="/explore" className="card tap row mt-12" style={{ color: 'var(--text)' }}>
            <div className="li-ico">🎯</div>
            <div className="grow"><div className="li-title">Set your career goal</div><div className="li-sub">Explore careers matched to you</div></div>
            <ChevronRight size={18} />
          </Link>
        )}

        <div className="section">
          <div className="section-head"><h2>{t('nextSteps')}</h2></div>
          <div className="list">
            {actions.map((a) => (
              <button key={a.id} className="list-item" onClick={() => nav(a.route)}>
                <div className="li-ico">{a.icon}</div>
                <div className="grow"><div className="li-title">{a.title}</div><div className="li-sub">{a.detail}</div></div>
                <span className="badge">+{a.xp}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>{t('quickTools')}</h2></div>
          <div className="grid-4">
            {tools.map(([emoji, label, to, color]) => (
              <button key={to} className="tool" onClick={() => nav(to)}>
                <span className="tool-ico" style={{ background: `${color}1f` }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {state.roadmap && (
          <Link to="/roadmap" className="card tap mt-16" style={{ display: 'block', color: 'var(--text)' }}>
            <div className="row between"><div className="li-title">🗺️ {t('roadmap')} · {t('week')} {rp.currentWeek}/12</div><span className="badge">{rp.done}/{rp.total}</span></div>
            <div className="mt-8"><Bar value={rp.pct} /></div>
          </Link>
        )}

        <div className="section">
          <div className="section-head"><h2>{t('topMatches')}</h2><Link to="/explore">{t('seeAll')}</Link></div>
          <div className="chips" style={{ gap: 10, paddingBottom: 8 }}>
            {recs.map((c) => (
              <Link key={c.id} to={`/explore/${c.id}`} className="card tap" style={{ minWidth: 150, color: 'var(--text)', padding: 14 }}>
                <div style={{ fontSize: 28 }}>{c.icon}</div>
                <div className="bold small mt-8" style={{ lineHeight: 1.3, minHeight: 36 }}>{lang === 'hi' ? c.hi : c.title}</div>
                <div className="row between mt-8"><span className="badge ok">{c.fit}% fit</span><span className="tiny faint">₹{c.salary[1]}L</span></div>
              </Link>
            ))}
          </div>
        </div>

        {install && (
          <div className="card row mt-16">
            <div className="li-ico"><Download size={20} /></div>
            <div className="grow"><div className="li-title">{t('install')}</div><div className="li-sub">{t('installSub')}</div></div>
            <button className="btn sm primary" onClick={() => install.prompt()}>{t('install')}</button>
          </div>
        )}
      </div>
    </>
  );
}
