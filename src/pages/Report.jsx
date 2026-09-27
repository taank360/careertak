import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Printer } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, ScoreRing, Radar, Bar, scoreColor, Logo } from '../components/ui.jsx';
import { insights, skillGap, recommendCareers } from '../engine/readiness.js';
import { careerById } from '../data/careers.js';

export default function Report() {
  const { state, lang, notify } = useApp();
  const nav = useNavigate();
  const { readiness: r, strengths, focus, missing } = useMemo(() => insights(state), [state]);
  const career = careerById(state.profile.targetRole);
  const gaps = career ? skillGap(career.id, state).filter((g) => g.status !== 'strong').slice(0, 5) : [];
  const recs = useMemo(() => recommendCareers(state, 3), [state]);
  const hist = state.history.slice(-10);

  const share = async () => {
    const text = `My CareerTak Readiness Score is ${r.score}/100 (${r.band.label})${career ? ` for ${career.title}` : ''}. Checking where I stand and what to do next! 🚀`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Career Readiness', text });
      else {
        await navigator.clipboard.writeText(text);
        notify('Copied to clipboard');
      }
    } catch { /* user cancelled */ }
  };

  return (
    <>
      <TopBar title={lang === 'hi' ? 'रिपोर्ट कार्ड' : 'Readiness Report'} back
        right={<><button className="icon-btn" onClick={share} aria-label="Share"><Share2 size={19} /></button><button className="icon-btn" onClick={() => window.print()} aria-label="Print"><Printer size={19} /></button></>} />
      <div className="page">
        <div className="print-only" style={{ marginBottom: 12 }}>
          <div className="row"><Logo /><b>CareerTak – Career Readiness Report</b></div>
        </div>

        <div className="card hero">
          <div className="row" style={{ gap: 16 }}>
            <ScoreRing value={r.score} size={120} sub="/ 100" />
            <div className="grow">
              <div className="small" style={{ opacity: 0.85 }}>{state.profile.name}</div>
              <div className="title-lg" style={{ color: '#fff' }}>{r.band.emoji} {lang === 'hi' ? r.band.hi : r.band.label}</div>
              {career && <div className="small mt-8">Goal: {career.icon} {career.title}</div>}
              <div className="tiny mt-8" style={{ opacity: 0.85 }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {r.coverage}% assessed</div>
            </div>
          </div>
        </div>

        <div className="card mt-16">
          <div className="title-md">Readiness profile</div>
          <Radar data={r.dims.map((d) => ({ label: lang === 'hi' ? d.hi : d.label, value: d.value }))} size={280} />
        </div>

        <div className="card mt-16">
          <div className="title-md mb-8">Breakdown</div>
          {r.dims.map((d) => (
            <button key={d.id} className="list-item" style={{ padding: '10px 0' }} onClick={() => nav(d.route)}>
              <div className="grow">
                <div className="row between small"><span className="bold">{lang === 'hi' ? d.hi : d.label} <span className="faint tiny">({d.weight}%)</span></span><span className="bold" style={{ color: scoreColor(d.value) }}>{d.value ?? '—'}</span></div>
                <div className="mt-8"><Bar value={d.value ?? 0} thin color={d.value == null ? 'var(--border)' : undefined} /></div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid-2 mt-16">
          <div className="card">
            <div className="bold small" style={{ color: 'var(--ok)' }}>💪 Strengths</div>
            <div className="small mt-8">{strengths.length ? strengths.join(', ') : 'Complete more assessments to discover.'}</div>
          </div>
          <div className="card">
            <div className="bold small" style={{ color: 'var(--bad)' }}>🎯 Focus areas</div>
            <div className="small mt-8">{focus.length ? focus.join(', ') : 'No weak areas measured yet.'}</div>
          </div>
        </div>
        {missing.length > 0 && <div className="card flat mt-12 small muted">Not yet assessed: {missing.join(', ')}</div>}

        {gaps.length > 0 && (
          <div className="card mt-16">
            <div className="title-md mb-8">Top skill gaps for {career.title}</div>
            {gaps.map((g) => (
              <div key={g.id} className="row between small" style={{ padding: '6px 0' }}><span>{g.name}</span><span className="badge bad">{g.current} → {g.required}</span></div>
            ))}
          </div>
        )}

        {hist.length > 1 && (
          <div className="card mt-16">
            <div className="title-md mb-12">Progress over time</div>
            <div className="bars" style={{ marginTop: 20 }}>
              {hist.map((h) => <div key={h.date} className="b" style={{ height: `${Math.max(4, h.score)}%` }} title={h.date}><small>{h.score}</small></div>)}
            </div>
            <div className="row between tiny faint mt-8"><span>{hist[0].date}</span><span>{hist[hist.length - 1].date}</span></div>
          </div>
        )}

        <div className="card mt-16">
          <div className="title-md mb-8">Recommended careers</div>
          {recs.map((c) => (
            <div key={c.id} className="row between small" style={{ padding: '6px 0' }}><span>{c.icon} {c.title}</span><span className="badge ok">{c.fit}% fit</span></div>
          ))}
        </div>

        <div className="row mt-16 no-print">
          <button className="btn grow" onClick={share}><Share2 size={16} /> Share</button>
          <button className="btn primary grow" onClick={() => window.print()}><Printer size={16} /> Download PDF</button>
        </div>
      </div>
    </>
  );
}
