import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from './AppContext.jsx';
import { db, dbEnabled, sendCode, verifyCode, signOut as dbSignOut, pullState, pushState, isStaff } from '../lib/db.js';
import { computeReadiness } from '../engine/readiness.js';
import { computeSelfAnalysis } from '../engine/selfanalysis.js';

const Ctx = createContext(null);
const LAST_KEY = 'careertak:lastSync';

const readLast = () => { try { return localStorage.getItem(LAST_KEY) || ''; } catch { return ''; } };
const writeLast = (v) => { try { localStorage.setItem(LAST_KEY, v); } catch { /* ignore */ } };

function summarize(state) {
  const r = computeReadiness(state);
  const a = computeSelfAnalysis(state);
  return {
    readiness: r.coverage ? r.score : null,
    coverage: r.coverage,
    strengths: a.strengths.map((x) => x.label),
    weaknesses: a.weaknesses.map((x) => x.label),
    interest_code: a.interestCode,
    tests_done: Object.keys(state.tests || {}).length,
  };
}

/**
 * Keeps the on-device state in sync with Supabase when the student is signed in.
 * Strategy: on sign-in, take whichever copy is newer; afterwards push changes (debounced).
 */
export function SyncProvider({ children }) {
  const { state, update } = useApp();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(readLast);
  const [staff, setStaff] = useState(null);
  const ready = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!dbEnabled) return undefined;
    db.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = db.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Initial reconcile after sign-in.
  useEffect(() => {
    if (!user) { ready.current = false; setStaff(null); return; }
    let cancelled = false;
    (async () => {
      setStatus('syncing');
      try {
        const remote = await pullState(user.id);
        const local = stateRef.current;
        const remoteNewer = remote?.updated_at && (!readLast() || remote.updated_at > readLast() || !local.onboarded);
        if (remote?.data && remoteNewer) {
          update(() => ({ ...remote.data, settings: { ...remote.data.settings, ...local.settings } }));
          writeLast(remote.updated_at);
          setLastSync(remote.updated_at);
        } else if (local.onboarded) {
          const at = await pushState(user, local, summarize(local));
          writeLast(at);
          setLastSync(at);
        }
        if (!cancelled) {
          setStaff(await isStaff(user.id));
          ready.current = true;
          setStatus('synced');
          setError('');
        }
      } catch (e) {
        if (!cancelled) { setStatus('error'); setError(e.message); }
      }
    })();
    return () => { cancelled = true; };
  }, [user, update]);

  // Debounced auto-save.
  useEffect(() => {
    if (!user || !ready.current || !state.onboarded) return undefined;
    const t = setTimeout(async () => {
      try {
        setStatus('syncing');
        const at = await pushState(user, state, summarize(state));
        writeLast(at);
        setLastSync(at);
        setStatus('synced');
        setError('');
      } catch (e) {
        setStatus('error');
        setError(e.message);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [state, user]);

  const requestCode = useCallback((email) => sendCode(email), []);
  const verify = useCallback((email, code) => verifyCode(email, code), []);
  const signOut = useCallback(async () => { await dbSignOut(); writeLast(''); setLastSync(''); setStatus('idle'); }, []);

  return (
    <Ctx.Provider value={{ enabled: dbEnabled, user, status, error, lastSync, staff, requestCode, verify, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSync = () => useContext(Ctx);
