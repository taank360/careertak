import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Download, WifiOff } from 'lucide-react';
import { useApp, levelFromXP } from '../store/AppContext.jsx';
import { Logo, ScoreRing, Bar, DemandChart } from '../components/ui.jsx';
import { computeReadiness, nextActions, roleMatch } from '../engine/readiness.js';
import { computeSelfAnalysis } from '../engine/selfanalysis.js';
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
  const sa = useMemo(() => computeSelfAnalysis(state), [state]);
  const actions = useMemo(() => nextActions(state).slice(0, 3), [state]);
  const career = careerById(state.profile.targetRole);
  const lvl = levelFromXP(state.xp);
  const rp = roadmapProgress(state.roadmap);
  const first = state.profile.name.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const hi = lang === 'hi';
  const greet = hi ? 'नमस्ते' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { if (r.coverage > 0) snapshot(r.score); }, [r.score, r.coverage, snapshot]);

  const tools = [
    ['📝', t('assessments'), '/assess'],
    ['📋', t('skillGap'), '/skills'],
    ['🗺️', t('roadmap'), '/roadmap'],
    ['📄', t('resume'), '/resume'],
    ['🎤', t('interview'), '/interview'],
    ['📊', t('report'), '/report'],
    ['🏛️', t('schemes'), '/jobs?tab=schemes'],
    ['🏫', t('institute'), '/institute'],
  ];

  return (
    <>
      <header className="topbar">
        <div className="logo-brand"><Logo /><span className="brand-name">Career<span>Tak</span></span></div>
        <span className="badge accent" title="Daily streak"><Flame size={13} /> {state.streak.count}</span>
        <button className="avatar" onClick={() => nav('/profile')} aria-label="Profile">{first[0]?.toUpperCase()}</button>
      </header>

      <div className="page">
        {!online && <div className="card flat row small mb-12" style={{ padding: 10 }}><WifiOff size={16} /> {t('offline')}</div>}

        <div className="row between mb-12" style={{ alignItems: 'flex-end' }}>
          <div>
            <p className="muted small">{greet},</p>
            <h2 className="title-xl">{first} 👋</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow">{t('level')} {lvl.level}</div>
            <div className="small bold num" style={{ color: 'var(--brand)' }}>{state.xp} XP</div>
          </div>
        </div>

        {/* 1. Self analysis — the entry point of the journey */}
        <button className="card hero tap" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => nav('/analysis')}>
          <div className="eyebrow">{hi ? 'चरण 1 · स्व-विश्लेषण' : 'Step 1 · Self analysis'}</div>
          {sa.ready ? (
            <>
              <div className="title-lg mt-8" style={{ color: '#fff' }}>{hi ? 'आपकी ताकत और कमज़ोरियाँ' : 'Your strengths & weak areas'}</div>
              <div className="chips wrap mt-12">
                {sa.strengths.slice(0, 2).map((x) => <span key={x.id} className="badge ok">💪 {hi ? x.hi : x.label}</span>)}
                {sa.weaknesses.slice(0, 2).map((x) => <span key={x.id} className="badge bad">🎯 {hi ? x.hi : x.label}</span>)}
                {sa.strengths.length + sa.weaknesses.length === 0 && <span className="badge glass">All areas average — see report</span>}
              </div>
            </>
          ) : (
            <>
              <div className="title-lg mt-8" style={{ color: '#fff' }}>{hi ? 'जानिए आप किसमें अच्छे हैं' : 'Discover what you are good at'}</div>
              <p className="small mt-8" style={{ opacity: 0.9 }}>{hi ? '5 छोटे टेस्ट → ताकत, कमज़ोरियाँ और आपके लिए सही करियर' : '5 short tests → your strengths, weak areas and the careers that suit you.'}</p>
              <div className="row mt-12" style={{ gap: 10 }}>
                <div className="grow"><Bar value={(sa.journeyDone / sa.journeyTotal) * 100} glass /></div>
                <span className="small bold num">{sa.journeyDone}/{sa.journeyTotal}</span>
              </div>
            </>
          )}
          <div className="row mt-12 small bold" style={{ gap: 4, color: 'var(--accent)' }}>{sa.ready ? (hi ? 'पूरी रिपोर्ट देखें' : 'Open full analysis') : sa.journeyDone ? (hi ? 'जारी रखें' : 'Continue') : (hi ? 'शुरू करें' : 'Start now')} <ChevronRight size={16} /></div>
        </button>

        {/* 2. Future-proof matches */}
        <div className="section">
          <div className="section-head">
            <h2>{hi ? 'चरण 2 · भविष्य के लिए सही करियर' : 'Step 2 · Future-ready matches'}</h2>
            <Link to="/future">{t('seeAll')}</Link>
          </div>
          <div className="chips" style={{ gap: 10, paddingBottom: 8 }}>
            {[...sa.careers.slice(0, 3), ...sa.businesses.slice(0, 2)].map((c) => (
              <button key={c.id} className="card tap" style={{ minWidth: 168, maxWidth: 168, textAlign: 'left', padding: 14 }} onClick={() => nav(c.kind === 'business' ? '/future?tab=business' : `/explore/${c.id}`)}>
                <div className="row between"><span style={{ fontSize: 26 }}>{c.icon}</span><span className="badge plain">{c.kind === 'business' ? 'Business' : 'Job'}</span></div>
                <div className="bold small mt-8" style={{ lineHeight: 1.3, minHeight: 36, whiteSpace: 'normal' }}>{hi ? c.hi : c.title}</div>
                <DemandChart series={c.future.series} height={34} compact />
                <div className="row between mt-8"><span className="badge accent">{c.fit}% fit</span><span className="tiny bold" style={{ color: 'var(--ok)' }}>▲ {c.future.growth2030}%</span></div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Readiness */}
        <div className="section">
          <div className="section-head"><h2>{hi ? 'चरण 3 · नौकरी की तैयारी' : 'Step 3 · Job readiness'}</h2><Link to="/report">{t('report')}</Link></div>
          <Link to="/report" className="card tap row" style={{ gap: 16, color: 'var(--text)' }}>
            <ScoreRing value={r.score} size={92} stroke={9} color="#0b7a75" track="#e2ece9" sub="/100" />
            <div className="grow">
              <div className="title-md" style={{ color: r.band.color }}>{r.band.emoji} {hi ? r.band.hi : r.band.label}</div>
              <div className="tiny muted mt-8">{t('basedOn', { n: r.coverage })}</div>
              {career && (
                <div className="mt-8">
                  <div className="row between tiny"><span className="bold">{career.icon} {hi ? career.hi : career.title}</span><span className="num">{roleMatch(career.id, state)}%</span></div>
                  <div className="mt-8"><Bar value={roleMatch(career.id, state)} thin /></div>
                </div>
              )}
            </div>
          </Link>
          {state.roadmap && (
            <Link to="/roadmap" className="card tap mt-12" style={{ display: 'block', color: 'var(--text)' }}>
              <div className="row between"><div className="li-title">🗺️ {t('roadmap')} · {t('week')} {rp.currentWeek}/12</div><span className="badge">{rp.done}/{rp.total}</span></div>
              <div className="mt-8"><Bar value={rp.pct} /></div>
            </Link>
          )}
        </div>

        <div className="section">
          <div className="section-head"><h2>{t('nextSteps')}</h2></div>
          <div className="list">
            {actions.map((a) => (
              <button key={a.id} className="list-item" onClick={() => nav(a.route)}>
                <div className="li-ico">{a.icon}</div>
                <div className="grow"><div className="li-title">{a.title}</div><div className="li-sub">{a.detail}</div></div>
                <span className="badge accent">+{a.xp}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>{t('quickTools')}</h2></div>
          <div className="grid-4">
            {tools.map(([emoji, label, to]) => (
              <button key={to} className="tool" onClick={() => nav(to)}>
                <span className="tool-ico" style={{ background: 'var(--brand-soft)' }}>{emoji}</span>
                {label}
              </button>
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
