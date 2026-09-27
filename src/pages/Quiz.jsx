import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, Bar, ScoreRing } from '../components/ui.jsx';
import { moduleById, LIKERT } from '../data/assessments.js';
import { RIASEC } from '../data/careers.js';
import { recommendCareers } from '../engine/readiness.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Keyed by module id so switching tests resets all quiz state.
export default function Quiz() {
  const { id } = useParams();
  return <QuizRun key={id} id={id} />;
}

function QuizRun({ id }) {
  const mod = moduleById(id);
  const { state, update, addXP, lang } = useApp();
  const nav = useNavigate();
  const [phase, setPhase] = useState('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [left, setLeft] = useState((mod?.minutes || 5) * 60);
  const [result, setResult] = useState(null);
  const started = useRef(0);
  const timed = mod && mod.type !== 'likert';

  useEffect(() => {
    if (phase !== 'run' || !timed) return undefined;
    const iv = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(iv);
  }, [phase, timed]);

  useEffect(() => {
    if (phase === 'run' && timed && left <= 0) submit(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const recs = useMemo(() => (result?.riasec ? recommendCareers({ ...state, tests: { ...state.tests, interest: result } }, 4) : []), [result, state]);

  if (!mod) return <Navigate to="/assess" replace />;
  const prev = state.tests[mod.id];
  const q = mod.questions[i];
  const total = mod.questions.length;

  function submit(ans) {
    const seconds = Math.round((Date.now() - started.current) / 1000);
    let res;
    if (mod.type === 'likert') {
      const riasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      mod.questions.forEach((qq, k) => { riasec[qq.k] += (ans[k] ?? 2) + 1; });
      const code = Object.entries(riasec).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join('');
      res = { score: 100, riasec, code, total, date: Date.now(), seconds };
    } else if (mod.type === 'sjt') {
      const pts = mod.questions.reduce((s, qq, k) => s + (ans[k] != null ? qq.s[ans[k]] : 0), 0);
      res = { score: Math.round((pts / (total * 3)) * 100), correct: pts, total: total * 3, date: Date.now(), seconds, answers: ans };
    } else {
      const correct = mod.questions.reduce((s, qq, k) => s + (ans[k] === qq.a ? 1 : 0), 0);
      res = { score: Math.round((correct / total) * 100), correct, total, date: Date.now(), seconds, answers: ans };
    }
    setResult(res);
    setPhase('done');
    update((s) => ({ ...s, tests: { ...s.tests, [mod.id]: { ...res, best: Math.max(res.score, s.tests[mod.id]?.best || 0), attempts: (s.tests[mod.id]?.attempts || 0) + 1 } } }));
    addXP(prev ? 20 : 50, `${mod.title} completed`);
  }

  const choose = (k) => {
    const next = [...answers];
    next[i] = k;
    setAnswers(next);
    if (mod.type === 'likert') {
      setTimeout(() => (i + 1 < total ? setI(i + 1) : submit(next)), 180);
    }
  };

  if (phase === 'intro') {
    return (
      <>
        <TopBar title="" back />
        <div className="page no-nav">
          <div className="center">
            <div style={{ fontSize: 64 }}>{mod.icon}</div>
            <h1 className="title-xl mt-12">{lang === 'hi' ? mod.hi : mod.title}</h1>
            <p className="muted mt-8">{mod.desc}</p>
          </div>
          <div className="grid-3 mt-24">
            <div className="stat center"><div className="stat-num">{total}</div><div className="stat-label">Questions</div></div>
            <div className="stat center"><div className="stat-num">{mod.type === 'likert' ? '—' : mod.minutes}</div><div className="stat-label">Minutes</div></div>
            <div className="stat center"><div className="stat-num">{prev ? (mod.type === 'likert' ? prev.code : `${prev.score}%`) : '—'}</div><div className="stat-label">Last result</div></div>
          </div>
          <div className="card mt-16 small muted stack">
            {mod.type === 'likert' ? (
              <>
                <div>• Answer how much each statement sounds like you.</div>
                <div>• There are no right or wrong answers — be honest.</div>
              </>
            ) : (
              <>
                <div>• Choose one answer per question. You can go back before submitting.</div>
                <div>• The timer auto-submits when it reaches zero.</div>
                <div>• You’ll see explanations after you finish.</div>
              </>
            )}
          </div>
          <button className="btn primary block mt-24" onClick={() => { started.current = Date.now(); setAnswers([]); setI(0); setLeft(mod.minutes * 60); setPhase('run'); }}>
            {prev ? 'Retake test' : 'Start test'}
          </button>
        </div>
      </>
    );
  }

  if (phase === 'run') {
    const opts = mod.type === 'likert' ? LIKERT : q.o;
    return (
      <>
        <TopBar title={`${i + 1} / ${total}`} back onBack={() => { if (confirm('Quit this test? Progress will be lost.')) nav('/assess'); }}
          right={timed && <span className={`badge ${left < 60 ? 'bad' : ''}`}><Clock size={12} /> {fmt(Math.max(0, left))}</span>} />
        <div className="page no-nav">
          <Bar value={((i + (answers[i] != null ? 1 : 0)) / total) * 100} thin />
          <h2 className="title-md mt-24" style={{ fontSize: 18, lineHeight: 1.45 }}>{q.q}</h2>
          <div className="mt-24">
            {opts.map((o, k) => (
              <button key={k} className={`option${answers[i] === k ? ' selected' : ''}`} onClick={() => choose(k)}>
                <span className="opt-key">{mod.type === 'likert' ? k + 1 : String.fromCharCode(65 + k)}</span>
                <span className="grow">{o}</span>
              </button>
            ))}
          </div>
          {mod.type !== 'likert' && (
            <div className="row mt-24">
              <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
              {i + 1 < total ? (
                <button className="btn primary grow" disabled={answers[i] == null} onClick={() => setI(i + 1)}>Next</button>
              ) : (
                <button className="btn primary grow" disabled={answers[i] == null} onClick={() => submit(answers)}>Submit</button>
              )}
            </div>
          )}
          {mod.type === 'likert' && i > 0 && <button className="btn ghost block mt-16" onClick={() => setI(i - 1)}>Previous statement</button>}
        </div>
      </>
    );
  }

  // Results
  if (mod.type === 'likert') {
    const max = Math.max(...Object.values(result.riasec));
    return (
      <>
        <TopBar title="Your interest profile" back onBack={() => nav('/assess')} />
        <div className="page no-nav">
          <div className="card hero center">
            <div className="small" style={{ opacity: 0.85 }}>Your Holland Code</div>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 6 }}>{result.code}</div>
            <div className="small">{result.code.split('').map((k) => (lang === 'hi' ? RIASEC[k].hi : RIASEC[k].name)).join(' · ')}</div>
          </div>
          <div className="card mt-16 stack">
            {Object.entries(result.riasec).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k}>
                <div className="row between small"><b>{RIASEC[k].name}</b><span className="faint">{Math.round((v / max) * 100)}</span></div>
                <div className="tiny muted mb-8">{RIASEC[k].desc}</div>
                <Bar value={(v / max) * 100} thin />
              </div>
            ))}
          </div>
          <div className="section">
            <div className="section-head"><h2>Careers that fit you</h2></div>
            <div className="list">
              {recs.map((c) => (
                <button key={c.id} className="list-item" onClick={() => nav(`/explore/${c.id}`)}>
                  <div className="li-ico" style={{ fontSize: 22 }}>{c.icon}</div>
                  <div className="grow"><div className="li-title">{lang === 'hi' ? c.hi : c.title}</div><div className="li-sub">₹{c.salary[0]}–{c.salary[1]} LPA · {c.demand} demand</div></div>
                  <span className="badge ok">{c.fit}%</span>
                </button>
              ))}
            </div>
          </div>
          <button className="btn primary block mt-16" onClick={() => nav('/explore')}>Explore & set my goal</button>
        </div>
      </>
    );
  }

  const good = result.score >= 70;
  return (
    <>
      <TopBar title="Result" back onBack={() => nav('/assess')} />
      <div className="page no-nav">
        <div className="card hero center">
          <div style={{ display: 'grid', placeItems: 'center' }}><ScoreRing value={result.score} size={130} sub="score" /></div>
          <div className="title-md mt-12" style={{ color: '#fff' }}>{good ? '🎉 Great job!' : result.score >= 45 ? '👍 Good effort — keep practising' : '🌱 Let’s build this skill'}</div>
          <div className="small mt-8" style={{ opacity: 0.85 }}>
            {mod.type === 'sjt' ? `${result.correct}/${result.total} points` : `${result.correct}/${result.total} correct`} · {fmt(result.seconds)} min
            {prev && ` · previous ${prev.score}%`}
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Review answers</h2></div>
          <div className="stack">
            {mod.questions.map((qq, k) => {
              const a = result.answers[k];
              if (mod.type === 'sjt') {
                const best = qq.s.indexOf(3);
                return (
                  <div key={k} className="card flat small">
                    <div className="bold">{k + 1}. {qq.q}</div>
                    <div className="mt-8 row" style={{ alignItems: 'flex-start', gap: 6 }}>{a === best ? <CheckCircle2 size={16} color="var(--ok)" /> : <XCircle size={16} color="var(--warn)" />} <span>You: {a != null ? qq.o[a] : '—'}</span></div>
                    {a !== best && <div className="mt-8 muted">Best: {qq.o[best]}</div>}
                  </div>
                );
              }
              const ok = a === qq.a;
              return (
                <div key={k} className="card flat small">
                  <div className="bold">{k + 1}. {qq.q}</div>
                  <div className="mt-8 row" style={{ alignItems: 'flex-start', gap: 6 }}>{ok ? <CheckCircle2 size={16} color="var(--ok)" /> : <XCircle size={16} color="var(--bad)" />}<span>{a != null ? qq.o[a] : 'Not answered'}</span></div>
                  {!ok && <div className="mt-8" style={{ color: 'var(--ok)' }}>Correct: {qq.o[qq.a]}</div>}
                  {qq.e && <div className="mt-8 muted">💡 {qq.e}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="row mt-16">
          <button className="btn" onClick={() => setPhase('intro')}><RotateCcw size={16} /> Retake</button>
          <button className="btn primary grow" onClick={() => nav('/')}>See my readiness</button>
        </div>
      </div>
    </>
  );
}
