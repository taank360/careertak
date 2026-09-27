import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, Bar, scoreColor } from '../components/ui.jsx';
import { MODULES } from '../data/assessments.js';
import { careerById } from '../data/careers.js';

const ROLE_MODULE = {
  'software-developer': 'programming', 'web-developer': 'programming', 'ai-ml-engineer': 'programming', 'cybersecurity-analyst': 'programming',
  'data-analyst': 'data', accountant: 'finance', 'banking-associate': 'finance', 'digital-marketer': 'marketing', entrepreneur: 'marketing',
};

export default function Assess() {
  const { state, t, lang } = useApp();
  const nav = useNavigate();
  const done = MODULES.filter((m) => state.tests[m.id]).length;
  const career = careerById(state.profile.targetRole);
  const recommended = ROLE_MODULE[career?.id];
  const core = MODULES.filter((m) => ['aptitude', 'communication', 'softskills', 'digital', 'interest'].includes(m.id));
  const domain = MODULES.filter((m) => !core.includes(m));

  const Item = ({ m }) => {
    const res = state.tests[m.id];
    return (
      <button className="list-item" onClick={() => nav(`/assess/${m.id}`)}>
        <div className="li-ico" style={{ background: `${m.color}1f` }}>{m.icon}</div>
        <div className="grow">
          <div className="li-title row" style={{ gap: 6 }}>
            {lang === 'hi' ? m.hi : m.title}
            {m.id === recommended && <span className="badge">For you</span>}
          </div>
          <div className="li-sub">{m.questions.length} {t('questions')} · {m.minutes} {t('minutes')}</div>
        </div>
        {res ? (
          m.type === 'likert'
            ? <span className="badge ok"><CheckCircle2 size={12} /> {res.code}</span>
            : <span className="bold" style={{ color: scoreColor(res.score) }}>{res.score}%</span>
        ) : <ChevronRight size={18} className="faint" />}
      </button>
    );
  };

  return (
    <>
      <TopBar title={t('assessments')} />
      <div className="page">
        <div className="card hero">
          <div className="small" style={{ opacity: 0.85 }}>{t('assessSub')}</div>
          <div className="title-lg mt-8" style={{ color: '#fff' }}>{done} / {MODULES.length} {t('completed').toLowerCase()}</div>
          <div className="mt-12"><Bar value={(done / MODULES.length) * 100} glass /></div>
          <p className="tiny mt-12" style={{ opacity: 0.85 }}>Tests verify your self-rated skills and power your Readiness Score. Retake anytime to track improvement.</p>
        </div>

        <div className="section">
          <div className="section-head"><h2>Core employability</h2></div>
          <div className="list">{core.map((m) => <Item key={m.id} m={m} />)}</div>
        </div>
        <div className="section">
          <div className="section-head"><h2>Domain skills</h2></div>
          <div className="list">{domain.map((m) => <Item key={m.id} m={m} />)}</div>
        </div>
        <div className="section">
          <button className="card tap row" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('/skills')}>
            <div className="li-ico">📋</div>
            <div className="grow"><div className="li-title">Self-rate all your skills</div><div className="li-sub">Needed for skill-gap analysis</div></div>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
