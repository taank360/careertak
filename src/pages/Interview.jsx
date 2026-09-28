import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Lightbulb, ChevronRight, Keyboard } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, ScoreRing, Bar, scoreColor } from '../components/ui.jsx';
import { buildInterview, interviewSummary } from '../engine/interview.js';
import { evaluateInterviewAnswer } from '../ai/client.js';
import { CAREERS, careerById } from '../data/careers.js';

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

function speak(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export default function Interview() {
  const { state, update, addXP, lang, ask } = useApp();
  const nav = useNavigate();
  const [phase, setPhase] = useState('setup');
  const [role, setRole] = useState(state.profile.targetRole || 'software-developer');
  const [round, setRound] = useState('mixed');
  const [voice, setVoice] = useState(!!SR);
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [rec, setRec] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [evalRes, setEvalRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [secs, setSecs] = useState(0);
  const recRef = useRef(null);
  const baseRef = useRef('');

  useEffect(() => {
    if (phase !== 'run' || evalRes) return undefined;
    const iv = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase, evalRes, i]);

  useEffect(() => () => { recRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  const start = () => {
    const set = buildInterview(role, round);
    setQs(set);
    setI(0);
    setResults([]);
    setAnswer('');
    setEvalRes(null);
    setSecs(0);
    setPhase('run');
    setTimeout(() => speak(set[0].q, 'en'), 300);
  };

  const toggleMic = () => {
    if (!SR) return;
    if (rec) {
      recRef.current?.stop();
      setRec(false);
      return;
    }
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.continuous = true;
    r.interimResults = true;
    baseRef.current = answer ? `${answer.trim()} ` : '';
    r.onresult = (e) => {
      let finalTxt = '';
      let interim = '';
      for (let k = 0; k < e.results.length; k++) {
        if (e.results[k].isFinal) finalTxt += e.results[k][0].transcript + ' ';
        else interim += e.results[k][0].transcript;
      }
      setAnswer(baseRef.current + finalTxt + interim);
    };
    r.onend = () => setRec(false);
    r.onerror = () => setRec(false);
    recRef.current = r;
    r.start();
    setRec(true);
  };

  const submit = async (text = answer) => {
    recRef.current?.stop();
    setRec(false);
    setBusy(true);
    const res = await evaluateInterviewAnswer(qs[i], text, secs, role);
    setBusy(false);
    setEvalRes(res);
    setResults((r) => [...r, { q: qs[i].q, kind: qs[i].kind, answer: text, eval: res }]);
  };

  const next = () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setAnswer('');
      setEvalRes(null);
      setShowTip(false);
      setSecs(0);
      setTimeout(() => speak(qs[i + 1].q, 'en'), 200);
    } else {
      const sum = interviewSummary(results);
      const first = !state.interviews.length;
      update((s) => ({ ...s, interviews: [...s.interviews, { date: Date.now(), role, round, score: sum.score, items: results.map((r) => ({ q: r.q, score: r.eval.score })) }].slice(-20) }));
      addXP(first ? 60 : 30, 'Mock interview completed');
      setPhase('done');
    }
  };

  if (phase === 'setup') {
    const past = state.interviews.slice(-3).reverse();
    return (
      <>
        <TopBar title="AI Mock Interview" back />
        <div className="page no-nav">
          <div className="card hero">
            <div style={{ fontSize: 40 }}>🎤</div>
            <div className="title-lg mt-8" style={{ color: '#fff' }}>Practise like it’s real</div>
            <p className="small mt-8" style={{ opacity: 0.9 }}>5 questions · speak or type your answers · instant AI feedback on content, structure (STAR) and clarity.</p>
          </div>
          <div className="field mt-16">
            <label>Role</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Round</label>
            <div className="seg">
              {[['mixed', 'Mixed'], ['hr', 'HR + Behavioural'], ['technical', 'Technical']].map(([k, l]) => <button key={k} className={round === k ? 'active' : ''} onClick={() => setRound(k)}>{l}</button>)}
            </div>
          </div>
          <div className="field">
            <label>Answer mode</label>
            <div className="seg">
              <button className={voice ? 'active' : ''} onClick={() => SR && setVoice(true)} disabled={!SR}>🎙️ Voice</button>
              <button className={!voice ? 'active' : ''} onClick={() => setVoice(false)}>⌨️ Type</button>
            </div>
            {!SR && <span className="tiny faint">Voice input needs Chrome / Edge on Android or desktop.</span>}
          </div>
          <button className="btn primary block mt-8" onClick={start}>Start interview</button>

          {past.length > 0 && (
            <div className="section">
              <div className="section-head"><h2>Recent attempts</h2></div>
              <div className="list">
                {past.map((p) => (
                  <div key={p.date} className="list-item" style={{ cursor: 'default' }}>
                    <div className="li-ico">{careerById(p.role)?.icon}</div>
                    <div className="grow"><div className="li-title">{careerById(p.role)?.title}</div><div className="li-sub">{new Date(p.date).toLocaleDateString()} · {p.round}</div></div>
                    <b style={{ color: scoreColor(p.score) }}>{p.score}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (phase === 'done') {
    const sum = interviewSummary(results);
    return (
      <>
        <TopBar title="Interview report" back onBack={() => nav('/')} />
        <div className="page no-nav">
          <div className="card hero center">
            <div style={{ display: 'grid', placeItems: 'center' }}><ScoreRing value={sum.score} size={130} sub="overall" /></div>
            <div className="title-md mt-12" style={{ color: '#fff' }}>{sum.verdict}</div>
          </div>
          <div className="section">
            <div className="section-head"><h2>Question-wise</h2></div>
            <div className="stack">
              {results.map((r, k) => (
                <div key={k} className="card">
                  <div className="row between"><span className="badge">{r.kind}</span><b style={{ color: scoreColor(r.eval.score) }}>{r.eval.score}/100</b></div>
                  <div className="bold small mt-8">{r.q}</div>
                  <div className="tiny muted mt-8">{r.eval.improve[0] || r.eval.strengths[0]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="row mt-16">
            <button className="btn" onClick={() => setPhase('setup')}>New interview</button>
            <button className="btn primary grow" onClick={() => nav('/')}>Done</button>
          </div>
        </div>
      </>
    );
  }

  const q = qs[i];
  const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  return (
    <>
      <TopBar title={`Question ${i + 1} of ${qs.length}`} back onBack={async () => { if (await ask('End this interview? Answers so far will not be saved.', 'End')) setPhase('setup'); }}
        right={<span className="badge">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>} />
      <div className="page no-nav">
        <Bar value={((i + (evalRes ? 1 : 0)) / qs.length) * 100} thin />
        <div className="card mt-16">
          <div className="row between"><span className="badge">{q.kind}</span>
            <button className="icon-btn" onClick={() => speak(q.q, 'en')} aria-label="Read question aloud"><Volume2 size={20} /></button>
          </div>
          <h2 className="title-md mt-8" style={{ fontSize: 18, lineHeight: 1.45 }}>{q.q}</h2>
          <button className="link-btn mt-8 row" style={{ gap: 4 }} onClick={() => setShowTip(!showTip)}><Lightbulb size={14} /> {showTip ? 'Hide tip' : 'Show tip'}</button>
          {showTip && <p className="small muted mt-8">{q.tip}</p>}
        </div>

        {!evalRes ? (
          <>
            {voice && (
              <div className="center mt-24">
                <button className={`mic-btn${rec ? ' rec' : ''}`} onClick={toggleMic} aria-label={rec ? 'Stop recording' : 'Start recording'} style={{ margin: '0 auto' }}>
                  {rec ? <MicOff size={30} /> : <Mic size={30} />}
                </button>
                <div className="small muted mt-12">{rec ? 'Listening… tap to stop' : 'Tap to speak your answer'}</div>
              </div>
            )}
            <div className="field mt-16">
              <label className="row" style={{ gap: 6 }}>{voice ? <>Transcript <span className="faint">(you can edit)</span></> : <><Keyboard size={14} /> Your answer</>}</label>
              <textarea className="textarea" style={{ minHeight: voice ? 110 : 180 }} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={voice ? 'Your spoken answer appears here…' : 'Type your answer… (aim for 60–150 words)'} />
              <span className="tiny faint">{wc} words {wc > 0 && wc < 40 && '· try to say a bit more'}</span>
            </div>
            <button className="btn primary block" disabled={busy || wc < 3} onClick={() => submit()}>{busy ? 'Evaluating…' : 'Submit answer'}</button>
            <button className="btn ghost block mt-8" onClick={() => { setAnswer(''); submit(''); }} disabled={busy}>Skip question</button>
          </>
        ) : (
          <div className="mt-16">
            <div className="card row" style={{ gap: 14 }}>
              <ScoreRing value={evalRes.score} size={84} stroke={9} color={evalRes.score >= 65 ? '#15803d' : evalRes.score >= 45 ? '#0b7a75' : '#c9382a'} track="var(--surface-2)" />
              <div className="grow small">
                <div className="row between"><span>Relevance</span><b>{evalRes.relevance}</b></div>
                <div className="row between"><span>Structure</span><b>{evalRes.structure}</b></div>
                <div className="row between"><span>Clarity</span><b>{evalRes.clarity}</b></div>
                <div className="tiny faint mt-8">{evalRes.source === 'claude' ? '✨ AI evaluated' : '⚡ On-device evaluation'}</div>
              </div>
            </div>
            {evalRes.strengths.length > 0 && (
              <div className="card mt-12"><div className="bold small mb-8" style={{ color: 'var(--ok)' }}>✓ What went well</div><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{evalRes.strengths.map((s, k) => <li key={k}>{s}</li>)}</ul></div>
            )}
            {evalRes.improve.length > 0 && (
              <div className="card mt-12"><div className="bold small mb-8" style={{ color: 'var(--warn)' }}>↗ Improve</div><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{evalRes.improve.map((s, k) => <li key={k}>{s}</li>)}</ul></div>
            )}
            {evalRes.modelAnswer && (
              <div className="card mt-12"><div className="bold small mb-8">💡 Sample strong answer</div><p className="small muted">{evalRes.modelAnswer}</p></div>
            )}
            <button className="btn primary block mt-16" onClick={next}>{i + 1 < qs.length ? <>Next question <ChevronRight size={16} /></> : 'See final report'}</button>
          </div>
        )}
      </div>
    </>
  );
}
