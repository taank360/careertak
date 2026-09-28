import { useState } from 'react';
import { Cloud, CloudOff, LogOut, Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSync } from '../store/SyncContext.jsx';

const friendly = (e) => (/fetch|network/i.test(e.message) ? 'Cannot reach the server. Check your internet connection and try again.' : e.message);

const ago = (iso) => {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Sign in with an emailed code to back up progress and use it on any device. */
export default function Account({ compact = false }) {
  const sync = useSync();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!sync?.enabled) {
    return (
      <div className="card flat row top small">
        <CloudOff size={18} className="faint" style={{ flexShrink: 0, marginTop: 2 }} />
        <span className="muted">Cloud sync is not set up on this deployment, so your progress is saved on this device only. (Admins: add Supabase keys to enable it.)</span>
      </div>
    );
  }

  if (sync.user) {
    const icon = sync.status === 'error' ? <AlertCircle size={16} color="var(--bad)" /> : sync.status === 'syncing' ? <RefreshCw size={16} className="faint" /> : <CheckCircle2 size={16} color="var(--ok)" />;
    return (
      <div className="card">
        <div className="row">
          <div className="li-ico"><Cloud size={20} /></div>
          <div className="grow">
            <div className="li-title ellipsis">{sync.user.email}</div>
            <div className="li-sub row" style={{ gap: 6 }}>{icon} {sync.status === 'error' ? `Sync failed: ${sync.error}` : sync.status === 'syncing' ? 'Saving…' : `Saved to cloud · ${ago(sync.lastSync)}`}</div>
          </div>
        </div>
        {sync.staff && <div className="badge accent mt-12">Placement-cell access{sync.staff.college ? `: ${sync.staff.college}` : ' (all colleges)'}</div>}
        {!compact && <p className="tiny muted mt-12">Sign in with the same email on any phone, tablet or computer to continue where you left off.</p>}
        <button className="btn sm mt-12" onClick={sync.signOut}><LogOut size={14} /> Sign out</button>
      </div>
    );
  }

  const send = async () => {
    setBusy(true); setMsg('');
    try { await sync.requestCode(email.trim()); setStep('code'); setMsg(`We emailed a 6-digit code to ${email.trim()}.`); }
    catch (e) { setMsg(friendly(e)); }
    setBusy(false);
  };
  const verify = async () => {
    setBusy(true); setMsg('');
    try { await sync.verify(email.trim(), code.trim()); }
    catch (e) { setMsg(e.message.includes('expired') || e.message.includes('invalid') ? 'That code is wrong or expired. Request a new one.' : friendly(e)); }
    setBusy(false);
  };

  return (
    <div className="card">
      <div className="row mb-12">
        <div className="li-ico"><Cloud size={20} /></div>
        <div className="grow"><div className="li-title">Save progress & use on any device</div><div className="li-sub">Free · login with an email code, no password</div></div>
      </div>
      {step === 'email' ? (
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input id="acct-email" className="input" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <button className="btn primary block mt-12" disabled={busy || !email.includes('@')}><Mail size={16} /> {busy ? 'Sending…' : 'Email me a login code'}</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <input id="acct-code" className="input num" inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }} />
          <button className="btn primary block mt-12" disabled={busy || code.length < 6}>{busy ? 'Checking…' : 'Verify & sign in'}</button>
          <button type="button" className="link-btn mt-12" onClick={() => { setStep('email'); setCode(''); }}>Use a different email</button>
        </form>
      )}
      {msg && <p className="small mt-12" style={{ color: step === 'code' && !msg.includes('wrong') ? 'var(--text-2)' : 'var(--bad)' }}>{msg}</p>}
    </div>
  );
}
