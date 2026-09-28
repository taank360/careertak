# CareerTak – Free Hosting, Database & Devices Guide

Everything below is **free** (no credit card needed for Vercel, Supabase, Netlify or GitHub Pages free tiers).

| Part | Service | Free tier | Needed? |
|---|---|---|---|
| Website + AI API | **Vercel** | Hobby plan | ✅ Recommended |
| Database + login | **Supabase** | 500 MB Postgres, 50k monthly users | Optional (cloud sync, multi-device, real placement dashboard) |
| AI (Claude) | Anthropic API | Pay-as-you-go (not free) | Optional; app has a built-in offline AI |

Without Supabase or an AI key, the app still works fully: data is saved on the device and the built-in offline AI is used.

---

## 1. Create the database (Supabase) — 5 minutes

1. Go to **https://supabase.com** → *Start your project* → sign in with GitHub.
2. **New project** → name `careertak`, choose a database password, region **Mumbai (ap-south-1)** → *Create*.
3. Left menu → **SQL Editor** → *New query* → paste the whole file [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   This creates the `students` and `staff` tables with row-level security (each student can see only their own data).
4. Turn on **email login codes**:
   - **Authentication → Sign In / Providers → Email**: keep it enabled.
   - **Authentication → Emails → Templates → Magic Link**: replace the body with:
     ```html
     <h2>Your CareerTak login code</h2>
     <p>Enter this code in the app: <b style="font-size:22px">{{ .Token }}</b></p>
     ```
     (The app signs in with a 6-digit code, which works the same on phones, tablets and computers.)
5. **Project Settings → API**: copy the **Project URL** and the **anon public key**. You need them in step 2.

> The free Supabase email sender allows only a few emails per hour. For a real launch, add your own SMTP (for example Brevo or Resend, both free) under **Authentication → Emails → SMTP Settings**.

### Give placement-cell (TPO) access
After the staff member has signed in to the app once, run this in the SQL Editor:
```sql
insert into public.staff (user_id, college)
select id, 'SGSITS Indore' from auth.users where email = 'tpo@college.edu';
-- use null instead of a college name to allow all colleges
```
When they open **Placement Cell** in the app, they see their college's real student data instead of the demo data.

---

## 2. Host the app (Vercel) — 3 minutes

1. Go to **https://vercel.com** → sign up with GitHub.
2. **Add New → Project** → import `taank360/careertak`.
3. Settings are read from `vercel.json` (Vite, output `dist`). Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `ANTHROPIC_API_KEY` | *(optional)* your Claude API key, for real AI |

4. **Deploy**. You get a link like `https://careertak.vercel.app`.
   - The website and the AI API (`/api/chat`, `/api/resume`, `/api/interview`) run on the same free Vercel project.
   - Every `git push` redeploys automatically.
   - If your code is on a branch other than `main`, set it under **Settings → Git → Production Branch**, or merge it into `main`.

### Other free options
- **Netlify:** import the repo; `netlify.toml` is included. Add the two `VITE_SUPABASE_*` variables. The AI runs in offline mode here.
- **GitHub Pages:** repo **Settings → Pages → Source: GitHub Actions**. For the database, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions**. The AI runs in offline mode.
- **Render** (full Node server): New *Web Service* → build `npm install && npm run build`, start `npm start`, and add the same environment variables. The free tier sleeps after 15 minutes idle.

---

## 3. Use it on mobile, tablet and computer

The app is **fully responsive**:

| Device | Layout |
|---|---|
| Phone (<640 px) | App-style screens with a bottom tab bar |
| Tablet (640–1023 px) | Wider single column; cards in 2 columns; centred pop-ups |
| Laptop / desktop (≥1024 px) | Left sidebar with all tools, wide content area |

**Install it like an app (PWA):**
- **Android (Chrome):** open your link → ⋮ menu → **Install app** / *Add to Home screen*.
- **iPhone / iPad (Safari):** Share button → **Add to Home Screen**.
- **Windows / Mac (Chrome or Edge):** click the install icon in the address bar.

It opens full-screen, has its own icon, and works offline.

**Same progress on every device:** Profile → Settings → *Save progress & use on any device* → enter your email → type the 6-digit code. Sign in with the same email on another device and your tests, analysis, roadmap and resume appear there too.

**Play Store APK (optional):** see *Android APK* in [README.md](README.md) (Capacitor).

---

## 4. Checklist before the hackathon demo

- [ ] Supabase project created, `schema.sql` run, login-code email template set
- [ ] Vercel deployed with the environment variables
- [ ] Sign in on your phone and your laptop with the same email, and check the data syncs
- [ ] Add yourself as staff (SQL above) and open **Placement Cell** to show live data
- [ ] Install the app on your phone from the Vercel link
