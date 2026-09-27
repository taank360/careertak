# CareerTak – AI-Powered Career Readiness Platform

> **Know where you stand today. Know what to do next.**
> Built for the **MPOnline Idea & Innovation Hackathon 2026** – challenge *“AI-Powered Career Readiness”*.

CareerTak is a mobile-first **Progressive Web App**. It installs on the home screen and works offline like a native app. It helps college, ITI and polytechnic students in Madhya Pradesh:

1. **Measure** their employability with an AI readiness score across 8 dimensions.
2. **Discover** careers that fit their interests, skills and stream.
3. **Close gaps** with a personalised 12-week roadmap of free courses, projects and tasks.
4. **Prove readiness** with an ATS resume builder/checker and AI mock interviews (voice, English/Hindi).
5. **Get placed** through matched jobs, internships and apprenticeships, plus MP and central government schemes.

Placement cells get a **cohort dashboard** that shows batch-wide skill gaps.

---

## ✨ Features

| Module | What it does |
|---|---|
| **Onboarding** | 4-step profile: district (all 55 MP districts), education, stream, goal, quick skill rating. English / हिंदी. |
| **Readiness Score** | Weighted score (0–100) across Role Skills 25%, Interview 15%, Resume 13%, Aptitude 12%, Communication 12%, Experience 10%, Workplace Skills 8%, Digital 5%. Shows coverage %, a band (Getting Started → Job Ready), a radar chart and a progress history. |
| **Assessments** | 9 modules: Aptitude, English Communication, Digital Literacy, Workplace Situations (SJT), Programming, Data & Excel, Finance & Banking, Digital Marketing, and a **RIASEC Career Interest Profiler**. Timed, with explanations. |
| **Skill-gap analysis** | Compares your level (self-rating blended with test evidence and roadmap practice) with employer requirements for 18 career paths relevant to MP. |
| **Career explorer** | Fit score = 45% interests + 30% skills + 25% stream. Salary, demand, growth, free courses (SWAYAM, NPTEL, Skill India Digital Hub…), projects, certifications. |
| **12-week roadmap** | Auto-generated Foundation → Build → Prove → Launch plan. Checking off learn/practice tasks raises your skill levels and XP. |
| **Resume** | Builder that turns your profile into an ATS-friendly one-page PDF, plus an analyser: section checks, action verbs, metrics, weak phrases, role keywords. AI adds a better summary and bullet rewrites. |
| **AI mock interview** | HR, behavioural and technical rounds per role. Questions are read aloud (TTS), you answer by **voice (speech-to-text, en-IN / hi-IN)** or by typing, and you get feedback on relevance, STAR structure, clarity and filler words. AI adds a sample answer. |
| **AI Career Coach** | A chat counsellor that knows your score, gaps and goal. Answers in Hindi or English. Includes a mental-health safety net (Tele-MANAS 14416). |
| **Opportunities** | Jobs, internships and apprenticeships ranked by skill match; save/apply tracking; eligibility-aware scheme cards (Seekho Kamao, PM Internship, NAPS, PMKVY…); links to official portals (MP Rojgar, NCS, NATS…). |
| **Report card** | Shareable (Web Share) and printable PDF readiness report. |
| **Placement Cell dashboard** | Cohort analytics (demo data): score distribution, department averages, most common skill gaps, students who need support, and “you vs cohort”. |
| **Gamification** | XP, levels, daily streaks and badges to keep students engaged. |
| **App-like UX** | Bottom tab bar, bottom sheets, safe-area insets, dark mode, offline service worker, installable manifest. On desktop the app shows inside a phone frame. |

## 🧠 How the AI works (hybrid, always available)

```
          ┌──────────────── React PWA (on device) ────────────────┐
Student → │ Readiness engine · Skill-gap · Roadmap · Resume rules │ ← works 100% offline
          │ Interview evaluator · Offline counsellor (EN/HI)      │
          └───────────────┬───────────────────────────────────────┘
                          │  if /api/health says AI is enabled
                          ▼
          ┌──── Node/Express API (server/index.js) ────┐
          │ /api/chat       → Claude career coach      │
          │ /api/resume     → Claude resume review     │ → Anthropic Claude API
          │ /api/interview  → Claude answer feedback   │
          └────────────────────────────────────────────┘
```

* **Deterministic on-device engines** (`src/engine/*`) run the scoring. Scores are transparent and explainable, they work offline, and there's no cost per student. That matters for scaling across MP.
* When the server has an `ANTHROPIC_API_KEY`, the app adds **Claude**. Claude handles free-form counselling, qualitative resume review and model interview answers. The student's live context (score, gaps, goal, district) goes with each request, so advice is personal.
* If the AI is unreachable, the app silently falls back to the offline engine. The UI shows which one answered (`✨ Claude AI` / `⚡ Offline AI`).
* The API key stays **server-side only**. The server also has per-IP rate limiting and input-size caps.

## 🚀 Run locally

```bash
npm install
npm run dev            # frontend on http://localhost:5173 (offline AI engine)
```

With real AI:

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run build
npm start              # serves app + API on http://localhost:8787
# for hot-reload dev with AI: run `npm run dev:server` and `npm run dev` together (Vite proxies /api)
```

Tests:

```bash
npm test               # engine unit tests (node:test)
```

To open it on your phone during development, run `npm run dev` and open `http://<your-laptop-ip>:5173` on a phone on the same Wi-Fi.

## 📱 Install as a mobile app

* **PWA (no store needed):** open the deployed URL in Chrome on Android, then tap **Install app** (or ⋮ → *Add to Home screen*). On iPhone: Safari → Share → *Add to Home Screen*. The app opens full-screen and works offline.
* **Android APK (Play Store):** the build is wrapper-ready (`capacitor.config.json`, relative asset paths, hash routing):
  ```bash
  npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/android
  npm run build
  npx cap add android
  npx cap sync android
  npx cap open android     # build APK / AAB in Android Studio
  ```
  For AI inside the APK, deploy the server and build with `VITE_API_BASE=https://your-server npm run build`.

## ☁️ Deploy

### GitHub Pages (free, automatic)
1. Repo → **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.
2. Push to `main` (or this branch), or run **Actions → Deploy to GitHub Pages → Run workflow**.
3. The site goes live at `https://<username>.github.io/careertak/`. It works on phones and can be installed as an app.

GitHub Pages is static hosting, so the app runs with the offline AI engine there. Claude AI needs the Node server (below).

### Other options

* **Full stack (recommended):** any Node host (Render, Railway, a VM or NIC cloud) → `npm install && npm run build && npm start`, and set `ANTHROPIC_API_KEY`.
* **Static only:** upload `dist/` to Netlify, Vercel, GitHub Pages or any web server. Everything works with the offline AI engine.

## 🗂️ Project structure

```
src/
  App.jsx               routes + app shell (bottom nav, toasts)
  store/AppContext.jsx  state, persistence (localStorage), XP/streaks, i18n
  engine/               readiness · roadmap · resume · interview · counselor (pure JS, unit-tested)
  ai/client.js          Claude API gateway with offline fallback
  data/                 careers, skills, assessments, interview bank, opportunities, schemes, MP districts
  pages/                Home, Onboarding, Assess, Quiz, Skills, Roadmap, Resume, Interview, Chat,
                        Jobs, Explore, CareerDetail, Report, Profile, Institute
  components/ui.jsx     ScoreRing, Radar, Bar, Sheet, TopBar, BottomNav, RichText…
server/index.js         Express API + static hosting
public/                 manifest, service worker, icons
tests/                  engine tests
```

## 🔐 Privacy

* No sign-up is needed. All student data stays **on the device** (localStorage). Users can export it as JSON or erase it from the Profile screen.
* Only the text a student sends to the AI (chat message, resume text, interview answer) and a short profile summary go to the server when AI is enabled.

## 🛣️ Production roadmap (post-hackathon)

* Aadhaar-less login via MPOnline / DigiLocker SSO. Sync to a central DB so the placement-cell view uses real institution data.
* Live job feeds through MP Rojgar Portal / NCS / PM Internship APIs, and district Rojgar Mela calendars.
* Question-bank CMS for institutions, adaptive testing (IRT) and proctoring.
* Verified credentials: DigiLocker certificates feeding the Experience score.
* More Indian languages via the i18n layer. Voice-first mode for low-literacy users.

## ⚠️ Notes

* Job listings in the prototype are **sample data** that shows the matching logic. Scheme descriptions are summaries, so always check the official portals.
* Salary ranges are indicative entry-level figures for Tier-2 cities.
