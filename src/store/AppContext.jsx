import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeT } from '../i18n/index.js';

const KEY = 'careertak:v1';
const Ctx = createContext(null);

export const initialState = {
  onboarded: false,
  profile: {
    name: '', email: '', phone: '', district: '', education: '', stream: '', course: '', college: '', gradYear: '', cgpa: '',
    targetRole: '', interests: [], languages: ['Hindi', 'English'], hoursPerWeek: 10,
    projects: [], internships: [], certifications: [], achievements: '', linkedin: '', github: '', summary: '',
  },
  skills: {},
  skillBoost: {},
  tests: {},
  resume: null,
  interviews: [],
  roadmap: null,
  saved: [],
  applied: [],
  chat: [],
  xp: 0,
  streak: { count: 0, last: '' },
  history: [],
  settings: { lang: 'en', theme: 'system' },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const s = JSON.parse(raw);
    return { ...initialState, ...s, profile: { ...initialState.profile, ...s.profile }, settings: { ...initialState.settings, ...s.settings } };
  } catch {
    return initialState;
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState(null);
  const [confirmReq, setConfirmReq] = useState(null);

  /** In-app confirmation (window.confirm is blocked in embedded/webview contexts). */
  const ask = useCallback((message, okLabel = 'Yes') => new Promise((resolve) => {
    setConfirmReq({ message, okLabel, resolve });
  }), []);
  const answer = useCallback((ok) => {
    setConfirmReq((r) => { r?.resolve(ok); return null; });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or disabled – app still works in-memory */
    }
  }, [state]);

  // Daily streak.
  useEffect(() => {
    setState((s) => {
      const t = today();
      if (s.streak.last === t) return s;
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      return { ...s, streak: { count: s.streak.last === y ? s.streak.count + 1 : 1, last: t } };
    });
  }, []);

  // Theme.
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', state.settings.theme);
    root.lang = state.settings.lang === 'hi' ? 'hi' : 'en';
  }, [state.settings.theme, state.settings.lang]);

  const update = useCallback((fn) => setState((s) => (typeof fn === 'function' ? fn(s) : { ...s, ...fn })), []);
  const updateProfile = useCallback((patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })), []);

  const notify = useCallback((msg, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToast({ msg, kind, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2500);
  }, []);

  const addXP = useCallback((n, reason) => {
    setState((s) => ({ ...s, xp: s.xp + n }));
    if (reason) notify(`+${n} XP · ${reason}`, 'xp');
  }, [notify]);

  /** Record a readiness snapshot (for the progress chart). Max one per day. */
  const snapshot = useCallback((score) => {
    setState((s) => {
      const t = today();
      const hist = s.history.filter((h) => h.date !== t);
      return { ...s, history: [...hist, { date: t, score }].slice(-60) };
    });
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setState(initialState);
  }, []);

  const t = useMemo(() => makeT(state.settings.lang), [state.settings.lang]);

  const value = useMemo(() => ({ state, update, updateProfile, addXP, notify, snapshot, reset, toast, t, lang: state.settings.lang, ask, answer, confirmReq }), [state, update, updateProfile, addXP, notify, snapshot, reset, toast, t, ask, answer, confirmReq]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);

export const levelFromXP = (xp) => {
  const level = Math.floor(xp / 200) + 1;
  return { level, into: xp % 200, next: 200 };
};
