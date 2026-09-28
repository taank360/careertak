import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, Compass, BarChart3, Mic, Map, Briefcase } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { Logo } from '../components/ui.jsx';
import { CAREERS, careerById } from '../data/careers.js';
import { SKILLS, LEVELS } from '../data/skills.js';
import { MP_DISTRICTS, EDUCATION_LEVELS, STREAMS } from '../data/opportunities.js';

const SECTORS = [...new Set(CAREERS.map((c) => c.sector))];
const CORE = ['communication', 'aptitude', 'digital', 'problem', 'teamwork', 'presentation'];

export default function Onboarding() {
  const { state, update, updateProfile, addXP, t, lang } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [unsure, setUnsure] = useState(false);
  const p = state.profile;
  const total = 5;

  const career = careerById(p.targetRole);
  const rateSkills = career ? career.skills.slice(0, 7).map(([id]) => id) : CORE;

  const canNext = [true, p.name.trim().length > 1 && p.district, p.education && p.stream, unsure || p.targetRole, true][step];

  const finish = () => {
    update((s) => ({ ...s, onboarded: true }));
    addXP(50, 'Profile created');
    nav(unsure || !p.targetRole ? '/analysis' : '/', { replace: true });
  };

  return (
    <div className="onb">
      {step > 0 && (
        <div className="row between mb-12">
          <button className="icon-btn" onClick={() => setStep(step - 1)} aria-label="Back"><ChevronLeft size={24} /></button>
          <div className="dots">{Array.from({ length: total - 1 }, (_, i) => <i key={i} className={i < step ? 'on' : ''} />)}</div>
          <button className="link-btn" onClick={finish} style={{ visibility: step >= 3 ? 'visible' : 'hidden' }}>Skip</button>
        </div>
      )}

      {step === 0 && (
        <div className="onb-hero">
          <div className="row between">
            <div className="logo-brand"><Logo size={40} /><span className="brand-name">Career<span>Tak</span></span></div>
            <div className="seg" style={{ width: 130 }}>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => update((s) => ({ ...s, settings: { ...s.settings, lang: 'en' } }))}>EN</button>
              <button className={lang === 'hi' ? 'active' : ''} onClick={() => update((s) => ({ ...s, settings: { ...s.settings, lang: 'hi' } }))}>हिं</button>
            </div>
          </div>
          <div className="center mt-24">
            <div className="float-emoji">🎯</div>
            <h1 className="title-xl mt-16">{t('welcome')}</h1>
            <p className="muted mt-8" style={{ fontSize: 16 }}>{t('tagline')}</p>
          </div>
          <div className="card mt-24 stack">
            {[
              [Target, '#0b7a75', 'Self analysis', 'Find your strong and weak areas with 5 short tests'],
              [BarChart3, '#b86e00', 'Future-ready career & business picks', 'Matched to your interests, with demand forecast to 2031'],
              [Map, '#15803d', '12-week personalised roadmap', 'Fix weak areas with free courses & projects'],
              [Mic, '#c9382a', 'AI mock interviews', 'Practise by voice in English or Hindi, get instant feedback'],
              [Briefcase, '#2563eb', 'Jobs, internships & MP schemes', 'Matched to your profile and district'],
            ].map(([Icon, color, title, sub]) => (
              <div className="row" key={title}>
                <div className="li-ico" style={{ background: `${color}1a`, color }}><Icon size={20} /></div>
                <div className="grow"><div className="li-title">{title}</div><div className="li-sub">{sub}</div></div>
              </div>
            ))}
          </div>
          <button className="btn primary block mt-24" onClick={() => setStep(1)}>{lang === 'hi' ? 'शुरू करें' : 'Get started — it’s free'}</button>
          <p className="tiny faint center mt-12">Your data stays on your device. No sign-up needed.</p>
        </div>
      )}

      {step === 1 && (
        <div className="grow">
          <h2 className="title-lg">{lang === 'hi' ? 'अपने बारे में बताइए' : 'Tell us about you'}</h2>
          <p className="muted mt-8 mb-12">We use this to personalise your plan.</p>
          <div className="field"><label>Full name *</label><input className="input" value={p.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="e.g. Priya Sharma" autoFocus /></div>
          <div className="field">
            <label>District *</label>
            <select className="select" value={p.district} onChange={(e) => updateProfile({ district: e.target.value })}>
              <option value="">Select district</option>
              {MP_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="field"><label>Mobile (optional)</label><input className="input" inputMode="tel" value={p.phone} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="10-digit" /></div>
            <div className="field"><label>Email (optional)</label><input className="input" type="email" value={p.email} onChange={(e) => updateProfile({ email: e.target.value })} placeholder="you@mail.com" /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grow">
          <h2 className="title-lg">{lang === 'hi' ? 'आपकी पढ़ाई' : 'Your education'}</h2>
          <p className="muted mt-8 mb-12">Current or highest qualification.</p>
          <div className="field">
            <label>Level *</label>
            {EDUCATION_LEVELS.map((e) => (
              <button key={e.id} className={`option${p.education === e.id ? ' selected' : ''}`} onClick={() => updateProfile({ education: e.id })}>{e.label}</button>
            ))}
          </div>
          <div className="field">
            <label>Stream *</label>
            <div className="chips wrap">
              {STREAMS.map((s) => <button key={s.id} className={`chip brand${p.stream === s.id ? ' active' : ''}`} onClick={() => updateProfile({ stream: s.id })}>{s.label}</button>)}
            </div>
          </div>
          <div className="field"><label>Course / Trade</label><input className="input" value={p.course} onChange={(e) => updateProfile({ course: e.target.value })} placeholder="e.g. B.Tech CSE, B.Com, ITI Electrician" /></div>
          <div className="grid-2">
            <div className="field"><label>College / Institute</label><input className="input" value={p.college} onChange={(e) => updateProfile({ college: e.target.value })} placeholder="Institute name" /></div>
            <div className="field"><label>Passing year</label><input className="input" inputMode="numeric" value={p.gradYear} onChange={(e) => updateProfile({ gradYear: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2026" /></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grow">
          <h2 className="title-lg">{lang === 'hi' ? 'आपका करियर लक्ष्य' : 'Your career goal'}</h2>
          <p className="muted mt-8 mb-12">Pick a target role — you can change it anytime.</p>
          <button className={`option${unsure ? ' selected' : ''}`} onClick={() => { setUnsure(true); updateProfile({ targetRole: '' }); }}>
            <Compass size={22} color="#c9382a" />
            <div className="grow"><div className="bold">I’m not sure yet</div><div className="small muted">Take a 5-min interest test and get AI suggestions</div></div>
          </button>
          <div className="section-head mt-16"><h2>Or choose a role</h2></div>
          <div className="grid-2">
            {CAREERS.map((c) => (
              <button key={c.id} className={`option${p.targetRole === c.id ? ' selected' : ''}`} style={{ marginTop: 0, flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: 12 }}
                onClick={() => { setUnsure(false); updateProfile({ targetRole: c.id }); }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <span className="small bold" style={{ lineHeight: 1.25 }}>{lang === 'hi' ? c.hi : c.title}</span>
                <span className="tiny faint">₹{c.salary[0]}–{c.salary[1]} LPA</span>
              </button>
            ))}
          </div>
          <div className="field mt-16">
            <label>Sectors you like (optional)</label>
            <div className="chips wrap">
              {SECTORS.map((s) => {
                const on = p.interests.includes(s);
                return <button key={s} className={`chip brand${on ? ' active' : ''}`} onClick={() => updateProfile({ interests: on ? p.interests.filter((x) => x !== s) : [...p.interests, s] })}>{s}</button>;
              })}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grow">
          <h2 className="title-lg">{lang === 'hi' ? 'अपने कौशल रेट करें' : 'Quick skill check'}</h2>
          <p className="muted mt-8 mb-12">Rate honestly (0 = none, 5 = expert). Tests will verify these later.</p>
          <div className="stack">
            {rateSkills.map((id) => (
              <div key={id} className="card flat" style={{ padding: 12 }}>
                <div className="row between mb-8">
                  <span className="bold small">{SKILLS[id]?.name}</span>
                  <span className="tiny faint">{LEVELS[state.skills[id] ?? 0]}</span>
                </div>
                <div className="level-picker">
                  {[0, 1, 2, 3, 4, 5].map((l) => (
                    <button key={l} className={(state.skills[id] ?? -1) >= l && state.skills[id] != null ? 'on' : ''} onClick={() => update((s) => ({ ...s, skills: { ...s.skills, [id]: l } }))}>{l}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step > 0 && (
        <div className="mt-24">
          <button className="btn primary block" disabled={!canNext} onClick={() => (step === total - 1 ? finish() : setStep(step + 1))}>
            {step === total - 1 ? (unsure || !p.targetRole ? 'Finish & start self-analysis' : 'See my readiness') : t('continue')}
          </button>
        </div>
      )}
    </div>
  );
}
