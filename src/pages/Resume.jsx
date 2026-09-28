import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Upload, Sparkles, Printer, Pencil, Wand2 } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, ScoreRing } from '../components/ui.jsx';
import { reviewResume } from '../ai/client.js';
import { resumeFromProfile } from '../engine/resume.js';
import { effectiveLevel } from '../engine/readiness.js';
import { careerById } from '../data/careers.js';
import { SKILLS } from '../data/skills.js';
import { EDUCATION_LEVELS } from '../data/opportunities.js';

function ResumePaper({ profile, skills }) {
  const p = profile;
  const career = careerById(p.targetRole);
  const edu = EDUCATION_LEVELS.find((e) => e.id === p.education)?.label;
  return (
    <div className="resume-paper" id="resume-print">
      <h2>{p.name || 'Your Name'}</h2>
      <div className="rp-contact">{[p.email, p.phone, p.district && `${p.district}, MP`, p.linkedin, p.github].filter(Boolean).join('  •  ')}</div>
      <h3>SUMMARY</h3>
      <p>{p.summary || `${career ? `Aspiring ${career.title}` : 'Motivated graduate'} with hands-on skills in ${skills.slice(0, 4).join(', ') || 'problem solving and communication'}. Quick learner eager to contribute to a growing team.`}</p>
      <h3>EDUCATION</h3>
      <p><b>{p.course || edu || 'Your course'}</b>{p.college && ` — ${p.college}`}{p.gradYear && ` (${p.gradYear})`}{p.cgpa && ` · ${p.cgpa}`}</p>
      {skills.length > 0 && (<><h3>SKILLS</h3><p>{skills.join(' • ')}</p></>)}
      {p.projects.some((x) => x.title) && (
        <><h3>PROJECTS</h3><ul>{p.projects.filter((x) => x.title).map((x, i) => <li key={i}><b>{x.title}</b>{x.desc && ` — ${x.desc}`}{x.link && <span style={{ color: '#075e5a' }}> ({x.link})</span>}</li>)}</ul></>
      )}
      {p.internships.some((x) => x.org) && (
        <><h3>EXPERIENCE</h3><ul>{p.internships.filter((x) => x.org).map((x, i) => <li key={i}><b>{x.role || 'Intern'}</b>, {x.org}{x.months && ` (${x.months} months)`}{x.desc && ` — ${x.desc}`}</li>)}</ul></>
      )}
      {p.certifications.some((x) => x.name) && (
        <><h3>CERTIFICATIONS</h3><ul>{p.certifications.filter((x) => x.name).map((x, i) => <li key={i}>{x.name}{x.issuer && ` — ${x.issuer}`}</li>)}</ul></>
      )}
      {p.achievements && (<><h3>ACHIEVEMENTS & ACTIVITIES</h3><ul>{p.achievements.split('\n').filter(Boolean).map((a, i) => <li key={i}>{a.replace(/^[-•]\s*/, '')}</li>)}</ul></>)}
      {p.languages?.length > 0 && (<><h3>LANGUAGES</h3><p>{p.languages.join(', ')}</p></>)}
    </div>
  );
}

function printResume() {
  document.body.classList.add('print-resume');
  window.print();
  setTimeout(() => document.body.classList.remove('print-resume'), 500);
}

export default function Resume() {
  const { state, update, updateProfile, addXP, notify } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState(state.resume?.analysis ? 'analyze' : 'build');
  const [text, setText] = useState(state.resume?.text || '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const a = state.resume?.analysis;
  const career = careerById(state.profile.targetRole);

  const mySkills = useMemo(() => {
    const ids = new Set([...Object.keys(state.skills), ...(career?.skills.map(([id]) => id) || [])]);
    return [...ids].filter((id) => effectiveLevel(id, state) >= 2).sort((x, y) => effectiveLevel(y, state) - effectiveLevel(x, state)).map((id) => SKILLS[id]?.name).filter(Boolean);
  }, [state, career]);

  const analyze = async (content = text) => {
    if (content.trim().split(/\s+/).length < 30) return notify('Please paste at least 30 words of your resume.');
    setBusy(true);
    const analysis = await reviewResume(content, state.profile.targetRole);
    setBusy(false);
    const first = !state.resume?.analysis;
    update((s) => ({ ...s, resume: { text: content, analysis, date: Date.now() } }));
    setTab('analyze');
    addXP(first ? 40 : 10, 'Resume analysed');
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(txt|md)$/i.test(f.name) && f.type !== 'text/plain') {
      notify('Upload a .txt file, or copy-paste text from your PDF/Word resume.');
      return;
    }
    setText(await f.text());
  };

  return (
    <>
      <TopBar title="Resume" back />
      <div className="page">
        <div className="seg mb-12">
          <button className={tab === 'build' ? 'active' : ''} onClick={() => setTab('build')}>Build</button>
          <button className={tab === 'paste' ? 'active' : ''} onClick={() => setTab('paste')}>Check mine</button>
          <button className={tab === 'analyze' ? 'active' : ''} onClick={() => setTab('analyze')} disabled={!a}>Report</button>
        </div>

        {tab === 'build' && (
          <>
            <div className="card row small mb-12" style={{ padding: 12 }}>
              <Wand2 size={18} color="var(--brand)" />
              <span className="grow">Auto-generated from your profile & verified skills. ATS-friendly single-column layout.</span>
            </div>
            <div className="field">
              <label>Professional summary (optional)</label>
              <textarea className="textarea" style={{ minHeight: 80 }} value={state.profile.summary} onChange={(e) => updateProfile({ summary: e.target.value })} placeholder="Leave empty to auto-generate" />
            </div>
            <ResumePaper profile={state.profile} skills={mySkills} />
            <div className="grid-2 mt-16 no-print">
              <button className="btn" onClick={() => nav('/profile')}><Pencil size={16} /> Edit details</button>
              <button className="btn" onClick={printResume}><Printer size={16} /> Save PDF</button>
            </div>
            <button className="btn primary block mt-12 no-print" disabled={busy} onClick={() => { const txt = resumeFromProfile(state.profile, mySkills); setText(txt); analyze(txt); }}>
              <Sparkles size={16} /> {busy ? 'Analysing…' : 'Score this resume'}
            </button>
          </>
        )}

        {tab === 'paste' && (
          <>
            <p className="small muted mb-12">Paste the text of your existing resume. We check ATS-readiness, structure, impact and keywords for <b>{career?.title || 'your target role'}</b>.</p>
            <textarea className="textarea" style={{ minHeight: 260 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your resume text here…" />
            <div className="row mt-12">
              <input ref={fileRef} type="file" accept=".txt,.md,text/plain" hidden onChange={onFile} />
              <button className="btn" onClick={() => fileRef.current.click()}><Upload size={16} /> .txt</button>
              <button className="btn primary grow" disabled={busy} onClick={() => analyze()}><Sparkles size={16} /> {busy ? 'Analysing…' : 'Analyse resume'}</button>
            </div>
            <p className="tiny faint mt-8">{text.trim() ? text.trim().split(/\s+/).length : 0} words · Your resume is processed privately.</p>
          </>
        )}

        {tab === 'analyze' && a && (
          <>
            <div className="card row" style={{ gap: 16 }}>
              <ScoreRing value={a.score} size={104} stroke={10} color={a.score >= 65 ? '#15803d' : a.score >= 45 ? '#0b7a75' : '#c9382a'} track="var(--surface-2)" sub="ATS" />
              <div className="grow">
                <div className="title-lg">{a.grade}</div>
                <div className="small muted">{a.stats.words} words · {a.stats.verbs} action verbs · {a.stats.numbers} metrics</div>
                <span className="badge mt-8">{a.source === 'claude' ? '✨ AI + rules' : '⚡ On-device analysis'}</span>
              </div>
            </div>

            {a.aiStrengths?.length > 0 && (
              <div className="card mt-12">
                <div className="title-md mb-8">💪 Strengths</div>
                <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{a.aiStrengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}

            <div className="card mt-12">
              <div className="title-md mb-8">Checklist</div>
              {a.checks.map((c, i) => (
                <div key={i} className="row small" style={{ alignItems: 'flex-start', padding: '7px 0', borderBottom: i < a.checks.length - 1 ? '1px solid var(--border)' : 0 }}>
                  {c.ok ? <CheckCircle2 size={18} color="var(--ok)" style={{ flexShrink: 0 }} /> : <XCircle size={18} color="var(--bad)" style={{ flexShrink: 0 }} />}
                  <div className="grow"><div className={c.ok ? '' : 'bold'}>{c.label}</div>{!c.ok && <div className="tiny muted">{c.tip}</div>}</div>
                </div>
              ))}
            </div>

            {(a.keywords.found.length > 0 || a.keywords.missing.length > 0) && (
              <div className="card mt-12">
                <div className="title-md mb-8">Keywords for {career?.title}</div>
                <div className="chips wrap">
                  {a.keywords.found.map((k) => <span key={k} className="badge ok">✓ {k}</span>)}
                  {[...new Set([...a.keywords.missing, ...(a.keywords.aiMissing || [])])].map((k) => <span key={k} className="badge bad">+ {k}</span>)}
                </div>
                <p className="tiny faint mt-8">Only add skills you genuinely have — interviewers will check.</p>
              </div>
            )}

            {a.improvedSummary && (
              <div className="card mt-12">
                <div className="title-md mb-8">✨ Suggested summary</div>
                <p className="small">{a.improvedSummary}</p>
                <button className="btn xs soft mt-8" onClick={() => { updateProfile({ summary: a.improvedSummary }); notify('Summary saved to your profile'); }}>Use this</button>
              </div>
            )}

            {a.bulletRewrites?.length > 0 && (
              <div className="card mt-12">
                <div className="title-md mb-8">✍️ Bullet rewrites</div>
                {a.bulletRewrites.map((b, i) => (
                  <div key={i} className="small mb-12">
                    <div className="faint" style={{ textDecoration: 'line-through' }}>{b.before}</div>
                    <div className="bold" style={{ color: 'var(--ok)' }}>→ {b.after}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="card mt-12">
              <div className="title-md mb-8">Top improvements</div>
              <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>{a.suggestions.slice(0, 6).map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}</ol>
            </div>
            <div className="grid-2 mt-16">
              <button className="btn" onClick={() => setTab('build')}>Open builder</button>
              <button className="btn primary" onClick={() => setTab('paste')}>Re-check</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
