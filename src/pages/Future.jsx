import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, DemandChart, TrendBadge, RiskMeter, Sheet } from '../components/ui.jsx';
import { recommendCareers, recommendBusinesses } from '../engine/readiness.js';
import { DECLINING, TREND_SOURCE, riskLabel, trendOf, growthBy, demandSeries, START_YEAR, END_YEAR } from '../data/future.js';
import { careerById } from '../data/careers.js';
import { SKILLS } from '../data/skills.js';

const FILTERS = [
  ['all', 'All'],
  ['growth', 'High growth'],
  ['safe', 'Low automation risk'],
];

function OptionCard({ item, lang, onOpen, showFit }) {
  const f = item.future;
  return (
    <button className="card tap" style={{ width: '100%', textAlign: 'left', display: 'block' }} onClick={onOpen}>
      <div className="row top">
        <div className="li-ico" style={{ fontSize: 22 }}>{item.icon}</div>
        <div className="grow">
          <div className="li-title">{lang === 'hi' ? item.hi : item.title}</div>
          <div className="li-sub">
            {item.kind === 'business' ? `Investment ₹${item.invest[0]}–${item.invest[1]} lakh` : `₹${item.salary[0]}–${item.salary[1]} LPA · ${item.sector}`}
          </div>
        </div>
        {showFit && <span className="badge accent">{item.fit}% fit</span>}
      </div>
      <div className="row mt-12" style={{ alignItems: 'flex-end' }}>
        <div className="grow"><DemandChart series={f.series} height={46} compact /></div>
        <div style={{ textAlign: 'right' }}>
          <div className="bold num" style={{ color: f.growth2030 >= 0 ? 'var(--ok)' : 'var(--bad)', fontSize: 18 }}>{f.growth2030 >= 0 ? '+' : ''}{f.growth2030}%</div>
          <div className="tiny faint">demand by 2030</div>
        </div>
      </div>
      <div className="row between mt-8">
        <TrendBadge trend={f.trend} lang={lang} />
        <div className="row" style={{ gap: 8, width: 150 }}>
          <span className="tiny faint" style={{ whiteSpace: 'nowrap' }}>AI risk</span>
          <div className="grow"><RiskMeter risk={item.risk ?? f.risk} /></div>
        </div>
      </div>
    </button>
  );
}

export default function Future() {
  const { state, lang } = useApp();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'jobs';
  const [filter, setFilter] = useState('all');
  const [biz, setBiz] = useState(null);
  useEffect(() => setBiz(null), [tab]);

  const jobs = useMemo(() => recommendCareers(state, 50).map((c) => ({ ...c, risk: c.future.risk })), [state]);
  const businesses = useMemo(() => recommendBusinesses(state, 50), [state]);
  const hasProfile = !!state.tests.interest || Object.keys(state.tests).length >= 2;

  const apply = (list) => {
    let l = [...list];
    if (filter === 'growth') l = l.filter((x) => x.future.trend.id === 'boom' || x.future.trend.id === 'rising');
    if (filter === 'safe') l = l.filter((x) => (x.risk ?? x.future.risk) < 35);
    return hasProfile ? l : l.sort((a, b) => b.future.score - a.future.score);
  };

  return (
    <>
      <TopBar title={lang === 'hi' ? 'भविष्य के करियर' : 'Future Careers'} />
      <div className="page">
        <div className="pill-tabs">
          {[['jobs', 'Jobs'], ['business', 'Businesses'], ['risk', 'At risk']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'active' : ''} onClick={() => setParams({ tab: k }, { replace: true })}>{l}</button>
          ))}
        </div>

        {tab !== 'risk' && (
          <>
            <div className="card soft row top small">
              <TrendingUp size={18} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {hasProfile
                  ? <>Ranked for <b>you</b>: your interests, strengths and each option’s <b>future demand</b>. Careers likely to shrink are pushed down.</>
                  : <>Ranked by <b>future demand</b>. Complete your <button className="link-btn" onClick={() => nav('/analysis')}>self-analysis</button> to get personal matches.</>}
              </span>
            </div>
            <div className="chips mt-12">
              {FILTERS.map(([k, l]) => <button key={k} className={`chip${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}
            </div>
            <div className="stack mt-8">
              {tab === 'jobs' && apply(jobs).map((c) => <OptionCard key={c.id} item={c} lang={lang} showFit={hasProfile} onOpen={() => nav(`/explore/${c.id}`)} />)}
              {tab === 'business' && apply(businesses).map((b) => <OptionCard key={b.id} item={b} lang={lang} showFit={hasProfile} onOpen={() => setBiz(b)} />)}
            </div>
          </>
        )}

        {tab === 'risk' && (
          <>
            <div className="card accent small row top">
              <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--accent-ink)" />
              <span>These jobs are shrinking because of automation and digital services. Avoid starting a career here. If you are already in one, switch to the suggested option.</span>
            </div>
            <div className="stack mt-12">
              {DECLINING.map((d) => {
                const alt = careerById(d.switchTo);
                return (
                  <div key={d.title} className="card">
                    <div className="row top">
                      <div className="li-ico" style={{ background: 'var(--bad-soft)', fontSize: 22 }}>{d.icon}</div>
                      <div className="grow">
                        <div className="li-title">{lang === 'hi' ? d.hi : d.title}</div>
                        <div className="li-sub">{d.why}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="bold num" style={{ color: 'var(--bad)', fontSize: 18 }}>{growthBy(d.cagr)}%</div>
                        <div className="tiny faint">by 2030</div>
                      </div>
                    </div>
                    <div className="mt-8"><DemandChart series={demandSeries(d.cagr)} height={44} compact /></div>
                    <div className="row between mt-8">
                      <TrendBadge trend={trendOf(d.cagr)} lang={lang} />
                      <span className="tiny faint">Automation risk: <b style={{ color: 'var(--bad)' }}>{d.risk}%</b></span>
                    </div>
                    {alt && (
                      <button className="btn soft sm block mt-12" onClick={() => nav(`/explore/${alt.id}`)}>
                        Switch to: {alt.icon} {alt.title} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="tiny faint mt-16"><Info size={11} style={{ display: 'inline', verticalAlign: -1 }} /> {TREND_SOURCE} Demand index: {START_YEAR} = 100, projected to {END_YEAR}.</p>
      </div>

      <Sheet open={!!biz} onClose={() => setBiz(null)} title={biz ? `${biz.icon} ${lang === 'hi' ? biz.hi : biz.title}` : ''}>
        {biz && (
          <>
            <p className="small muted">{biz.about}</p>
            <div className="grid-3 mt-12">
              <div className="stat"><div className="bold num">₹{biz.invest[0]}–{biz.invest[1]}L</div><div className="stat-label">Investment</div></div>
              <div className="stat"><div className="bold num" style={{ color: 'var(--ok)' }}>+{biz.future.growth2030}%</div><div className="stat-label">Demand 2030</div></div>
              <div className="stat"><div className="bold">{riskLabel(biz.risk)}</div><div className="stat-label">Disruption risk</div></div>
            </div>
            <div className="card mt-12">
              <div className="row between mb-8"><span className="bold small">Market demand forecast</span><TrendBadge trend={biz.future.trend} lang={lang} /></div>
              <DemandChart series={biz.future.series} />
            </div>
            <div className="mt-12">
              <div className="eyebrow mb-8">Skills you need</div>
              <div className="chips wrap">{biz.skills.map((s) => <span key={s} className={`badge ${biz.strengths.includes(SKILLS[s]?.name) ? 'ok' : 'plain'}`}>{biz.strengths.includes(SKILLS[s]?.name) ? '✓ ' : ''}{SKILLS[s]?.name}</span>)}</div>
            </div>
            <div className="mt-12">
              <div className="eyebrow mb-8">Government support</div>
              <div className="chips wrap">{biz.schemes.map((s) => <span key={s} className="badge accent">{s}</span>)}</div>
            </div>
            <div className="card flat small mt-12 row top"><ShieldCheck size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} /> Start small: test with 10–20 real customers before investing fully. Check loan and subsidy eligibility on official scheme portals.</div>
            <button className="btn primary block mt-16" onClick={() => { setBiz(null); nav('/chat'); }}>Ask AI Coach how to start</button>
          </>
        )}
      </Sheet>
    </>
  );
}
