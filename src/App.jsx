import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext.jsx';
import { BottomNav, Toast } from './components/ui.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Assess from './pages/Assess.jsx';
import Quiz from './pages/Quiz.jsx';
import Skills from './pages/Skills.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Resume from './pages/Resume.jsx';
import Interview from './pages/Interview.jsx';
import Jobs from './pages/Jobs.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';
import CareerDetail from './pages/CareerDetail.jsx';
import Report from './pages/Report.jsx';
import Institute from './pages/Institute.jsx';

// Routes that hide the bottom navigation (focused, full-screen flows).
const FULLSCREEN = [/^\/assess\/.+/, /^\/interview/, /^\/onboarding/];

function Shell() {
  const { state } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('.app .scroll')?.scrollTo(0, 0);
  }, [pathname]);

  if (!state.onboarded && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  const hideNav = FULLSCREEN.some((re) => re.test(pathname));

  return (
    <>
      <div className="scroll">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/assess" element={<Assess />} />
          <Route path="/assess/:id" element={<Quiz />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:id" element={<CareerDetail />} />
          <Route path="/report" element={<Report />} />
          <Route path="/institute" element={<Institute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="app">
          <Shell />
        </div>
        <div className="desk-note">
          <b>📱 Best on mobile.</b> Open this page on your phone and tap <b>“Add to Home Screen”</b> to install CareerTak as an app.
        </div>
      </HashRouter>
    </AppProvider>
  );
}
