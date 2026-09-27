import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Moon, Sun, Monitor, Download, RotateCcw, ChevronRight } from 'lucide-react';
import { useApp, levelFromXP } from '../store/AppContext.jsx';
import { TopBar, Bar } from '../components/ui.jsx';
import { CAREERS } from '../data/careers.js';
import { MP_DISTRICTS, EDUCATION_LEVELS, STREAMS } from '../data/opportunities.js';
import { experienceScore } from '../engine/readiness.js';

function ListEditor({ title, items, fields, onChange, empty }) {
  const add = () => onChange([...items, Object.fromEntries(fields.map((f) => [f.key, '']))]);
  const set = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const del = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div className="section">
      <div className="section-head"><h2>{title}</h2><button className="link-btn row" style={{ gap: 4 }} onClick={add}><Plus size={14} /> Add</button></div>
      {items.length === 0 && <div className="card flat small muted">{empty}</div>}
      <div className="stack">
        {items.map((it, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            {fields.map((f) => (
              <input key={f.key} className="input mb-8" style={{ minHeight: 42 }} placeholder={f.label} value={it[f.key] || ''} onChange={(e) => set(i, f.key, e.target.value)} />
            ))}
            <button className="btn xs danger" onClick={() => del(i)}><Trash2 size={13} /> Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { state, update, updateProfile, reset, lang } = useApp();
  const nav = useNavigate();
  const p = state.profile;
  const [tab, setTab] = useState('profile');
  const lvl = levelFromXP(state.xp);
  const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `careertak-${(p.name || 'profile').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const badges = [
    ['🚀', 'First steps', state.onboarded],
    ['🧮', 'Aptitude tested', !!state.tests.aptitude],
    ['🧭', 'Self-aware', !!state.tests.interest],
    ['📄', 'Resume ready', (state.resume?.analysis?.score || 0) >= 65],
    ['🎤', 'Interview pro', state.interviews.some((i) => i.score >= 70)],
    ['🗺️', 'Planner', !!state.roadmap],
    ['🔥', '7-day streak', state.streak.count >= 7],
    ['📨', 'Go-getter', state.applied.length >= 3],
  ];

  return (
    <>
      <TopBar title={lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'} back />
      <div className="page">
        <div className="card row" style={{ gap: 14 }}>
          <div className="avatar lg">{(p.name || '?')[0].toUpperCase()}</div>
          <div className="grow">
            <div className="title-md">{p.name || 'Student'}</div>
            <div className="small muted">{[p.course, p.district].filter(Boolean).join(' · ')}</div>
            <div className="row mt-8" style={{ gap: 8 }}><span className="badge">Level {lvl.level}</span><span className="tiny faint">{state.xp} XP</span></div>
            <div className="mt-8"><Bar value={(lvl.into / lvl.next) * 100} thin /></div>
          </div>
        </div>

        <div className="section">
          <div className="section-head"><h2>Badges</h2><span className="tiny faint">{badges.filter((b) => b[2]).length}/{badges.length}</span></div>
          <div className="grid-4">
            {badges.map(([e, l, on]) => (
              <div key={l} className="tool" style={{ opacity: on ? 1 : 0.35, cursor: 'default' }} title={l}><span style={{ fontSize: 26 }}>{e}</span><span className="tiny">{l}</span></div>
            ))}
          </div>
        </div>

        <div className="seg mt-24">
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Details</button>
          <button className={tab === 'exp' ? 'active' : ''} onClick={() => setTab('exp')}>Experience</button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
        </div>

        {tab === 'profile' && (
          <div className="mt-16">
            <div className="field"><label>Full name</label><input className="input" value={p.name} onChange={(e) => updateProfile({ name: e.target.value })} /></div>
            <div className="grid-2">
              <div className="field"><label>Mobile</label><input className="input" inputMode="tel" value={p.phone} onChange={(e) => updateProfile({ phone: e.target.value })} /></div>
              <div className="field"><label>Email</label><input className="input" type="email" value={p.email} onChange={(e) => updateProfile({ email: e.target.value })} /></div>
            </div>
            <div className="field"><label>District</label>
              <select className="select" value={p.district} onChange={(e) => updateProfile({ district: e.target.value })}><option value="">Select</option>{MP_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
            </div>
            <div className="grid-2">
              <div className="field"><label>Education</label>
                <select className="select" value={p.education} onChange={(e) => updateProfile({ education: e.target.value })}><option value="">Select</option>{EDUCATION_LEVELS.map((e) => <option key={e.id} value={e.id}>{e.label.split(' (')[0]}</option>)}</select>
              </div>
              <div className="field"><label>Stream</label>
                <select className="select" value={p.stream} onChange={(e) => updateProfile({ stream: e.target.value })}><option value="">Select</option>{STREAMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </div>
            </div>
            <div className="field"><label>Course / Trade</label><input className="input" value={p.course} onChange={(e) => updateProfile({ course: e.target.value })} /></div>
            <div className="field"><label>College</label><input className="input" value={p.college} onChange={(e) => updateProfile({ college: e.target.value })} /></div>
            <div className="grid-2">
              <div className="field"><label>Passing year</label><input className="input" inputMode="numeric" value={p.gradYear} onChange={(e) => updateProfile({ gradYear: e.target.value })} /></div>
              <div className="field"><label>CGPA / %</label><input className="input" value={p.cgpa} onChange={(e) => updateProfile({ cgpa: e.target.value })} /></div>
            </div>
            <div className="field"><label>Career goal</label>
              <select className="select" value={p.targetRole} onChange={(e) => updateProfile({ targetRole: e.target.value })}><option value="">Not decided</option>{CAREERS.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}</select>
            </div>
            <div className="field"><label>Languages (comma separated)</label><input className="input" value={p.languages.join(', ')} onChange={(e) => updateProfile({ languages: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></div>
            <div className="grid-2">
              <div className="field"><label>LinkedIn URL</label><input className="input" value={p.linkedin} onChange={(e) => updateProfile({ linkedin: e.target.value })} placeholder="linkedin.com/in/…" /></div>
              <div className="field"><label>GitHub / Portfolio</label><input className="input" value={p.github} onChange={(e) => updateProfile({ github: e.target.value })} placeholder="github.com/…" /></div>
            </div>
          </div>
        )}

        {tab === 'exp' && (
          <>
            <div className="card mt-16 row">
              <div className="grow"><div className="bold small">Experience score</div><div className="tiny muted">Projects, internships, certificates & achievements</div><div className="mt-8"><Bar value={experienceScore(p)} thin /></div></div>
              <div className="title-lg">{experienceScore(p)}</div>
            </div>
            <ListEditor title="Projects" items={p.projects} onChange={(v) => updateProfile({ projects: v })} empty="Add academic or personal projects — they matter a lot for freshers."
              fields={[{ key: 'title', label: 'Project title' }, { key: 'desc', label: 'What you built & impact (e.g. used by 50 students)' }, { key: 'link', label: 'Link (GitHub / Drive)' }]} />
            <ListEditor title="Internships / Work" items={p.internships} onChange={(v) => updateProfile({ internships: v })} empty="Internships, apprenticeships, part-time or freelance work."
              fields={[{ key: 'role', label: 'Role' }, { key: 'org', label: 'Organisation' }, { key: 'months', label: 'Duration (months)' }, { key: 'desc', label: 'Key achievement' }]} />
            <ListEditor title="Certifications" items={p.certifications} onChange={(v) => updateProfile({ certifications: v })} empty="NPTEL, SWAYAM, Skill India, Google, Microsoft…"
              fields={[{ key: 'name', label: 'Certificate name' }, { key: 'issuer', label: 'Issuer' }]} />
            <div className="section">
              <div className="section-head"><h2>Achievements & activities</h2></div>
              <textarea className="textarea" value={p.achievements} onChange={(e) => updateProfile({ achievements: e.target.value })} placeholder={'One per line, e.g.\nWinner, college hackathon 2025\nNSS volunteer – 120 hours'} />
            </div>
          </>
        )}

        {tab === 'settings' && (
          <div className="mt-16">
            <div className="field"><label>Language / भाषा</label>
              <div className="seg">
                <button className={lang === 'en' ? 'active' : ''} onClick={() => setSetting('lang', 'en')}>English</button>
                <button className={lang === 'hi' ? 'active' : ''} onClick={() => setSetting('lang', 'hi')}>हिंदी</button>
              </div>
            </div>
            <div className="field"><label>Theme</label>
              <div className="seg">
                {[['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'Auto']].map(([k, Icon, l]) => (
                  <button key={k} className={state.settings.theme === k ? 'active' : ''} onClick={() => setSetting('theme', k)}><Icon size={14} style={{ display: 'inline', verticalAlign: -2 }} /> {l}</button>
                ))}
              </div>
            </div>
            <div className="list mt-16">
              <button className="list-item" onClick={() => nav('/report')}><div className="li-ico">📊</div><div className="grow li-title">Readiness report card</div><ChevronRight size={18} /></button>
              <button className="list-item" onClick={() => nav('/institute')}><div className="li-ico">🏫</div><div className="grow li-title">Placement cell dashboard (demo)</div><ChevronRight size={18} /></button>
              <button className="list-item" onClick={exportData}><div className="li-ico"><Download size={20} /></div><div className="grow"><div className="li-title">Export my data</div><div className="li-sub">Download everything as JSON</div></div></button>
              <button className="list-item" onClick={() => { if (confirm('Delete all your data from this device? This cannot be undone.')) { reset(); nav('/onboarding'); } }}>
                <div className="li-ico" style={{ color: 'var(--bad)' }}><RotateCcw size={20} /></div><div className="grow"><div className="li-title" style={{ color: 'var(--bad)' }}>Reset app</div><div className="li-sub">Erase all data on this device</div></div>
              </button>
            </div>
            <p className="tiny faint center mt-24">CareerTak v1.0 · Privacy-first: data is stored only on your device.<br />Built for MPOnline Idea & Innovation Hackathon 2026.</p>
          </div>
        )}
      </div>
    </>
  );
}
