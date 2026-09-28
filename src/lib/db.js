// Optional cloud database (Supabase). When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// are not set, `db` is null and the app keeps working with on-device storage only.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const db = url && key
  ? createClient(url, key, { auth: { persistSession: true, storageKey: 'careertak-auth', detectSessionInUrl: false } })
  : null;
export const dbEnabled = Boolean(db);

/** Email a 6-digit login code (no password needed). */
export async function sendCode(email) {
  const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyCode(email, token) {
  const { data, error } = await db.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data.session;
}

export const signOut = () => db.auth.signOut();

export async function pullState(userId) {
  const { data, error } = await db.from('students').select('data, updated_at').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function pushState(user, state, summary) {
  const p = state.profile || {};
  const row = {
    id: user.id,
    email: user.email,
    name: p.name,
    district: p.district,
    college: p.college,
    education: p.education,
    stream: p.stream,
    target_role: p.targetRole || null,
    ...summary,
    data: state,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from('students').upsert(row);
  if (error) throw error;
  return row.updated_at;
}

export async function isStaff(userId) {
  const { data } = await db.from('staff').select('college').eq('user_id', userId).maybeSingle();
  return data ? { college: data.college } : null;
}

/** Students visible to this staff member (RLS limits it to their college). */
export async function loadCohort() {
  const { data, error } = await db
    .from('students')
    .select('id, name, college, stream, education, target_role, readiness, strengths, weaknesses, tests_done, updated_at')
    .order('readiness', { ascending: true })
    .limit(5000);
  if (error) throw error;
  return data;
}
