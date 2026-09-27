import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardCheck, Sparkles, Map, Briefcase, ChevronLeft, X } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';

export function Logo({ size = 34 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#lg)" />
      <path d="M136 330 L216 250 L276 300 L376 184" fill="none" stroke="#fff" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M316 180 H380 V244" fill="none" stroke="#fff" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="136" cy="330" r="26" fill="#fbbf24" />
    </svg>
  );
}

export function TopBar({ title, back, right, onBack }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      {back && (
        <button className="icon-btn" aria-label="Back" onClick={() => (onBack ? onBack() : window.history.length > 1 ? nav(-1) : nav('/'))}>
          <ChevronLeft size={24} />
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </header>
  );
}

export function BottomNav() {
  const { t } = useApp();
  const items = [
    { to: '/', icon: Home, label: t('home'), end: true },
    { to: '/assess', icon: ClipboardCheck, label: t('assess') },
    { to: '/chat', icon: Sparkles, label: t('coach'), center: true },
    { to: '/roadmap', icon: Map, label: t('roadmap') },
    { to: '/jobs', icon: Briefcase, label: t('jobs') },
  ];
  return (
    <nav className="bottom-nav" aria-label="Main">
      {items.map(({ to, icon: Icon, label, end, center }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${center ? ' center' : ''}`}>
          <span className="nav-ico"><Icon size={center ? 24 : 21} strokeWidth={2.2} /></span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function ScoreRing({ value = 0, size = 132, stroke = 12, color = '#fff', track = 'rgba(255,255,255,.22)', label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="ring-label">
        <div>
          <div className="ring-num" style={{ fontSize: size * 0.26 }}>{label ?? Math.round(pct)}</div>
          {sub && <div className="ring-sub">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function Bar({ value = 0, thin, glass, color }) {
  return (
    <div className={`bar${thin ? ' thin' : ''}${glass ? ' glass' : ''}`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, ...(color ? { background: color } : {}) }} />
    </div>
  );
}

export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {title && (
          <div className="row between mb-12">
            <h3 className="title-md">{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div key={toast.id} className={`toast ${toast.kind}`} role="status">{toast.msg}</div>;
}

/** Renders the light markdown the AI coach uses: **bold**, "- " bullets, numbered lists. */
export function RichText({ text }) {
  const lines = (text || '').split('\n');
  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`u${out.length}`}>{list}</ul>);
    list = [];
  };
  const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part));
  lines.forEach((line, i) => {
    const m = line.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/);
    if (m) list.push(<li key={i}>{inline(m[1])}</li>);
    else {
      flush();
      out.push(line.trim() ? <div key={i}>{inline(line)}</div> : <div key={i} style={{ height: 6 }} />);
    }
  });
  flush();
  return <>{out}</>;
}

export function Radar({ data, size = 240 }) {
  // data: [{ label, value (0-100) | null }]
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 58;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
  };
  const poly = data.map((d, i) => pt(i, (d.value ?? 0) / 100).join(',')).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size, margin: '0 auto' }} role="img" aria-label="Readiness radar chart">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={data.map((_, i) => pt(i, k).join(',')).join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(99,102,241,.25)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pt(i, (d.value ?? 0) / 100);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={d.value == null ? 'var(--text-3)' : '#6366f1'} />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.24);
        return (
          <text key={i} x={x} y={y} fontSize="9.5" fontWeight="600" textAnchor="middle" dominantBaseline="middle" fill={d.value == null ? 'var(--text-3)' : 'var(--text-2)'}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

export function Empty({ emoji = '✨', title, sub, action }) {
  return (
    <div className="empty">
      <div className="emoji">{emoji}</div>
      <div className="title-md" style={{ color: 'var(--text)' }}>{title}</div>
      {sub && <p className="small mt-8">{sub}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}

export const scoreColor = (v) => (v == null ? 'var(--text-3)' : v >= 75 ? 'var(--ok)' : v >= 50 ? 'var(--brand)' : v >= 35 ? 'var(--warn)' : 'var(--bad)');
