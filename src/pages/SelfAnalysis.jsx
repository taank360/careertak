import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ExternalLink, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, Bar, ScoreRing, TrendBadge, DemandChart } from '../components/ui.jsx';
import { computeSelfAnalysis, JOURNEY } from '../engine/selfanalysis.js';
import { moduleById } from '../data/assessments.js';
import { DECLINING } from '../data/future.js';

const STATUS = {
  strong: { label: 'Strong', hi: 'मज़बूत', cls: 'ok' },
  average: { label: 'Average', hi: 'औसत', cls: 'accent' },
  weak: { label: 'Weak', hi: 'कमज़ोर', cls: 'bad' },
  pending: { label: 'Not tested', hi: 'बाकी', cls: 'plain' },
};

function Suggestion({ item, lang, onOpen }) {
  const f = item.future;
  return (
    <button className="card tap" style={{ width: '100%', textAlign: 'left', display: 'block' }} onClick={onOpen}>
      <div className="row top">
        <div className="li-ico" style={{ fontSize: 22 }}>{item.icon}</div>
        <div className="grow">
          <div className="li-title">{lang === 'hi' ? item.hi : item.title}</div>
          <div className="li-sub">{item.kind === 'business' ? `Investment ₹${item.invest[0]}–${item.invest[1]} lakh` : `₹${item.salary[0]}–${item.salary[1]} LPA`}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="bold num" style={{ fontSize: 18, color: 'var(--brand)' }}>{item.fit}%</div>
          <div className="tiny faint">match</div>
        </div>
      </div>
      <div className="row mt-8" style={{ gap: 8 }}>
        <div className="grow"><DemandChart series={f.series} height={40} compact /></div>
        <div style={{ textAlign: 'right' }}>
          <TrendBadge trend={f.trend} lang={lang} />
          <div className="tiny faint mt-8">+{f.growth2030}% demand by 2030</div>
        </div>
      </div>
      <div className="tiny muted mt-8">
        {item.strengths.length > 0
          ? <>✓ Uses your strengths: <b>{item.strengths.slice(0, 3).join(', ')}</b></>
          : <>Interest match {item.interestFit}% · skills can be learned in the roadmap</>}
      </div>
    </button>
  );
}

export default function SelfAnalysis() {
  const { state, lang, updateProfile, notify } = useApp();
  const nav = useNavigate();
  const a = useMemo(() => computeSelfAnalysis(state), [state]);
  const hi = lang === 'hi';
  const pct = Math.round((a.journeyDone / a.journeyTotal) * 100);
  const next = a.nextTest ? moduleById(a.nextTest) : null;

  return (
    <>
      <TopBar title={hi ? 'स्व-विश्लेषण' : 'Self Analysis'} />
      <div className="page">
        {/* Journey / progress */}
        <div className="card hero">
          <div className="row" style={{ gap: 16 }}>
            {a.overall != null && a.ready
              ? <ScoreRing value={a.overall} size={100} stroke={10} color="#f2a516" sub="overall" />
              : <ScoreRing value={pct} size={100} stroke={10} color="#f2a516" label={`${a.journeyDone}/${a.journeyTotal}`} sub="steps" />}
            <div className="grow">
              <div className="eyebrow">{hi ? 'खुद को जानिए' : 'Know yourself'}</div>
              <div className="title-lg" style={{ color: '#fff' }}>
                {a.ready ? (hi ? 'आपकी रिपोर्ट तैयार है' : 'Your analysis is ready') : (hi ? '5 छोटे टेस्ट दें' : 'Take 5 short tests')}
              </div>
              <div className="small mt-8" style={{ opacity: 0.9 }}>
                {a.ready
                  ? `${a.strengths.length} strong · ${a.average.length} average · ${a.weaknesses.length} weak areas`
                  : 'Find your strengths, weak areas and the jobs or businesses that suit you.'}
              </div>
            </div>
          </div>
          {next && (
            <button className="btn accent block mt-16" onClick={() => nav(`/assess/${next.id}`)}>
              {a.journeyDone === 0 ? 'Start self-analysis' : `Next: ${next.title}`} <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="section">
          <div className="section-head"><h2>{hi ? 'आकलन यात्रा' : 'Assessment journey'}</h2><span className="tiny faint">~35 min total</span></div>
          <div className="list">
            {JOURNEY.map((id, i) => {
              const m = moduleById(id);
              const r = state.tests[id];
              return (
                <button key={id} className="list-item" onClick={() => nav(`/assess/${id}`)}>
                  <div className="li-ico" style={r ? { background: 'var(--ok)', color: '#fff' } : undefined}>{r ? <Check size={20} /> : <b>{i + 1}</b>}</div>
                  <div className="grow">
                    <div className="li-title">{hi ? m.hi : m.title}</div>
                    <div className="li-sub">{m.questions.length} questions · {m.minutes} min</div>
                  </div>
                  {r ? <span className="badge ok">{m.type === 'likert' ? r.code : `${r.score}%`}</span> : <ChevronRight size={18} className="faint" />}
                </button>
              );
            })}
          </div>
          <button className="link-btn mt-12" style={{ display: 'block', textAlign: 'center', width: '100%', lineHeight: 1.4 }} onClick={() => nav('/assess')}>+ Optional domain tests: Programming, Data, Finance, Marketing</button>
        </div>

        {!a.ready ? (
          <div className="card flat mt-16 small muted center">
            Complete at least <b>3 steps</b> to unlock your strengths, weaknesses and job & business suggestions.
          </div>
        ) : (
          <>
            {a.personality && (
              <div className="section">
                <div className="section-head"><h2>{hi ? 'आपकी रुचि व व्यक्तित्व' : 'Your interest personality'}</h2><span className="badge accent">{a.interestCode}</span></div>
                <div className="card stack">
                  {a.personality.map((p) => (
                    <div key={p.key}>
                      <div className="row between small"><b>{hi ? p.hi : p.name}</b><span className="faint num">{p.value}</span></div>
                      <div className="tiny muted mb-8">{p.desc}</div>
                      <Bar value={p.value} thin />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section">
              <div className="section-head"><h2>{hi ? 'क्षेत्रवार परिणाम' : 'Area-wise result'}</h2></div>
              {a.areas.map((ar) => {
                const st = STATUS[ar.status];
                return (
                  <div key={ar.id} className={`area ${ar.status}`}>
                    <span style={{ fontSize: 22 }}>{ar.icon}</span>
                    <div className="grow">
                      <div className="bold small">{hi ? ar.hi : ar.label}</div>
                      <div className="mt-8"><Bar value={ar.value ?? 0} thin color={ar.status === 'strong' ? 'var(--ok)' : ar.status === 'average' ? 'var(--accent)' : ar.status === 'weak' ? 'var(--bad)' : 'var(--border)'} /></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="area-score">{ar.value ?? '—'}</div>
                      <span className={`badge ${st.cls}`}>{hi ? st.hi : st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section">
              <div className="section-head"><h2 style={{ color: 'var(--ok)' }}>💪 {hi ? 'आपकी ताकत' : 'Your strengths'}</h2></div>
              <div className="card">
                {a.strengths.length ? (
                  <ul className="steps small">
                    {a.strengths.map((s) => <li key={s.id}><b>{hi ? s.hi : s.label}</b> ({s.value}) — use this in interviews and choose roles that need it.</li>)}
                  </ul>
                ) : (
                  <p className="small muted">No area is above 70 yet. Your best area is <b>{a.average[0]?.label || a.areas.find((x) => x.value != null)?.label}</b> — build on it first.</p>
                )}
              </div>
            </div>

            <div className="section">
              <div className="section-head"><h2 style={{ color: 'var(--bad)' }}>🎯 {hi ? 'कमज़ोरियाँ कैसे दूर करें' : 'Weaknesses to remove'}</h2></div>
              {a.weaknesses.length === 0 && <div className="card small muted">No weak areas right now. Keep practising your average areas to reach 70+.</div>}
              <div className="cards">
                {a.weaknesses.map((w) => (
                  <div key={w.id} className="card">
                    <div className="row between">
                      <div className="bold">{w.icon} {hi ? w.hi : w.label}</div>
                      <span className="badge bad">{w.value}/100</span>
                    </div>
                    <p className="small muted mt-8">{w.plan.why}</p>
                    <div className="eyebrow mt-12">Your plan</div>
                    <ol className="steps small">{w.plan.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                    <div className="row wrap mt-8" style={{ gap: 8 }}>
                      <a className="btn xs soft" href={w.plan.resource.url} target="_blank" rel="noreferrer">{w.plan.resource.name} <ExternalLink size={12} /></a>
                      {w.test && <button className="btn xs" onClick={() => nav(`/assess/${w.test}`)}><RotateCcw size={12} /> Retest</button>}
                      {w.id === 'experience' && <button className="btn xs" onClick={() => nav('/profile')}>Add experience</button>}
                    </div>
                  </div>
                ))}
              </div>
              {a.average.length > 0 && (
                <p className="tiny muted mt-12">Average areas to push above 70: {a.average.map((x) => `${hi ? x.hi : x.label} (${x.value})`).join(', ')}.</p>
              )}
            </div>

            <div className="section">
              <div className="section-head"><h2>💼 {hi ? 'आपके लिए सबसे अच्छी नौकरियाँ' : 'Best jobs for you'}</h2><button className="link-btn" onClick={() => nav('/future')}>All</button></div>
              <p className="tiny muted mb-8">Matched on your interests + strengths, and ranked higher when future demand is growing.</p>
              <div className="cards">
                {a.careers.map((c) => <Suggestion key={c.id} item={c} lang={lang} onOpen={() => nav(`/explore/${c.id}`)} />)}
              </div>
            </div>

            <div className="section">
              <div className="section-head"><h2>🚀 {hi ? 'आपके लिए व्यवसाय' : 'Business ideas for you'}</h2><button className="link-btn" onClick={() => nav('/future?tab=business')}>All</button></div>
              <div className="cards">
                {a.businesses.map((b) => <Suggestion key={b.id} item={b} lang={lang} onOpen={() => nav('/future?tab=business')} />)}
              </div>
            </div>

            <div className="section">
              <div className="section-head"><h2>⚠️ {hi ? 'इन करियर से बचें' : 'Careers to avoid'}</h2><button className="link-btn" onClick={() => nav('/future?tab=risk')}>Why?</button></div>
              <div className="card small">
                {DECLINING.slice(0, 4).map((d) => (
                  <div key={d.title} className="row between" style={{ padding: '6px 0' }}>
                    <span>{d.icon} {hi ? d.hi : d.title}</span>
                    <span className="badge bad">▼ declining</span>
                  </div>
                ))}
              </div>
            </div>

            {!state.profile.targetRole && a.careers[0] && (
              <div className="card soft mt-16">
                <div className="row"><Sparkles size={20} color="var(--brand)" /><div className="grow small">Your top match is <b>{a.careers[0].title}</b>. Set it as your goal to get a 12-week plan.</div></div>
                <button className="btn primary block mt-12" onClick={() => { updateProfile({ targetRole: a.careers[0].id }); notify(`Goal set: ${a.careers[0].title}`); nav('/roadmap'); }}>Set goal & build roadmap</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
