import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Bookmark, BookmarkCheck, ExternalLink, Info } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar } from '../components/ui.jsx';
import { OPPORTUNITIES, PORTALS, SCHEMES } from '../data/opportunities.js';
import { effectiveLevel } from '../engine/readiness.js';
import { careerById } from '../data/careers.js';
import { SKILLS } from '../data/skills.js';

const TYPES = ['All', 'Job', 'Internship', 'Apprenticeship', 'Program'];

export function matchScore(o, state) {
  const avg = o.skills.reduce((s, id) => s + Math.min(1, effectiveLevel(id, state) / 3), 0) / o.skills.length;
  const goal = o.career && o.career === state.profile.targetRole ? 15 : 0;
  const near = o.city === state.profile.district || o.city === 'Remote' || o.city === 'Multiple' ? 5 : 0;
  return Math.min(99, Math.round(avg * 80 + goal + near));
}

export default function Jobs() {
  const { state, update, addXP, t } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'jobs';
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);

  const list = useMemo(() => OPPORTUNITIES
    .map((o) => ({ ...o, match: matchScore(o, state) }))
    .filter((o) => (type === 'All' || o.type === type) && (!savedOnly || state.saved.includes(o.id)))
    .filter((o) => !q || `${o.title} ${o.org} ${o.city}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.match - a.match), [state, type, q, savedOnly]);

  const toggleSave = (id) => update((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] }));
  const apply = (o) => {
    window.open(o.link || 'https://www.ncs.gov.in', '_blank', 'noopener');
    if (!state.applied.includes(o.id)) {
      update((s) => ({ ...s, applied: [...s.applied, o.id] }));
      addXP(15, 'Application tracked');
    }
  };
  const edu = state.profile.education;

  return (
    <>
      <TopBar title={t('opportunities')} />
      <div className="page">
        <div className="pill-tabs">
          {[['jobs', `${t('jobs')} & Internships`], ['schemes', t('schemes')], ['portals', t('portals')]].map(([k, l]) => (
            <button key={k} className={tab === k ? 'active' : ''} onClick={() => setParams({ tab: k }, { replace: true })}>{l}</button>
          ))}
        </div>

        {tab === 'jobs' && (
          <>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-3)' }} />
              <input className="input" style={{ paddingLeft: 42 }} placeholder="Search role, company or city" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="chips mt-12">
              {TYPES.map((x) => <button key={x} className={`chip${type === x ? ' active' : ''}`} onClick={() => setType(x)}>{x}</button>)}
              <button className={`chip${savedOnly ? ' active' : ''}`} onClick={() => setSavedOnly(!savedOnly)}><Bookmark size={13} /> {t('saved')}</button>
            </div>
            <div className="card flat row tiny muted mt-8" style={{ padding: 10, alignItems: 'flex-start' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Prototype shows sample listings ranked by your skill match. In production these sync from MP Rojgar, NCS & PM Internship portals. Applied: <b>{state.applied.length}</b></span>
            </div>
            <div className="stack mt-12">
              {list.map((o) => {
                const c = careerById(o.career);
                const applied = state.applied.includes(o.id);
                return (
                  <div key={o.id} className="card">
                    <div className="row" style={{ alignItems: 'flex-start' }}>
                      <div className="li-ico" style={{ fontSize: 22 }}>{c?.icon || '🏢'}</div>
                      <div className="grow">
                        <div className="li-title">{o.title}</div>
                        <div className="li-sub">{o.org}</div>
                      </div>
                      <button className="icon-btn" onClick={() => toggleSave(o.id)} aria-label="Save">{state.saved.includes(o.id) ? <BookmarkCheck size={20} color="var(--brand)" /> : <Bookmark size={20} />}</button>
                    </div>
                    <div className="row wrap mt-8" style={{ gap: 6 }}>
                      <span className="badge">{o.type}</span>
                      <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}><MapPin size={11} /> {o.city} · {o.mode}</span>
                      <span className="badge ok">{o.stipend}</span>
                    </div>
                    <div className="tiny muted mt-8">Skills: {o.skills.map((s) => SKILLS[s]?.name).join(', ')}</div>
                    <div className="row between mt-12">
                      <div>
                        <div className="bold" style={{ color: o.match >= 70 ? 'var(--ok)' : o.match >= 45 ? 'var(--brand)' : 'var(--warn)' }}>{o.match}% {t('match')}</div>
                        <div className="tiny faint">Closes in {o.deadline} days</div>
                      </div>
                      <button className={`btn sm ${applied ? 'soft' : 'primary'}`} onClick={() => apply(o)}>{applied ? '✓ Applied' : t('apply')} <ExternalLink size={13} /></button>
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && <div className="empty">No opportunities match your filters.</div>}
            </div>
          </>
        )}

        {tab === 'schemes' && (
          <div className="stack">
            <p className="small muted">Government schemes for skilling, stipends and self-employment. {edu && 'Highlighted ones match your education level.'}</p>
            {SCHEMES.map((s) => {
              const fit = edu && s.for.includes(edu);
              return (
                <a key={s.name} className="card tap" href={s.url} target="_blank" rel="noreferrer" style={{ display: 'block', color: 'var(--text)', borderColor: fit ? 'var(--brand)' : undefined }}>
                  <div className="row between"><span className="badge">{s.tag}</span>{fit && <span className="badge ok">Eligible level ✓</span>}</div>
                  <div className="li-title mt-8">{s.name}</div>
                  <div className="small muted mt-8">{s.desc}</div>
                  <div className="tiny mt-8" style={{ color: 'var(--brand)' }}>Official portal <ExternalLink size={11} style={{ display: 'inline' }} /></div>
                </a>
              );
            })}
            <p className="tiny faint">Always confirm current eligibility and benefits on the official website.</p>
          </div>
        )}

        {tab === 'portals' && (
          <div className="list">
            {PORTALS.map((p) => (
              <a key={p.name} className="list-item" href={p.url} target="_blank" rel="noreferrer">
                <div className="li-ico">{p.icon}</div>
                <div className="grow"><div className="li-title">{p.name}</div><div className="li-sub">{p.desc}</div></div>
                <ExternalLink size={16} className="faint" />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
