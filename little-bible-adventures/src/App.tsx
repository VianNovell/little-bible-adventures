import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import VideoRoom from './pages/VideoRoom';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Profile from './pages/Profile';
import Activities from './pages/Activities';
import TeacherLogin from './pages/TeacherLogin';
import TeacherPortalDashboard from './pages/TeacherPortalDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Wrapper: Teacher portal routes bypass the kids' mobile shell entirely
function AppShell() {
  const location = useLocation();
  const isTeacherPortal = location.pathname.startsWith('/teacher-portal');

  if (isTeacherPortal) {
    return (
      <div className="mobile-app-wrapper">
        <main className="mobile-content">
          <Routes>
            <Route path="/teacher-portal" element={<TeacherLogin />} />
            <Route path="/teacher-portal/dashboard" element={<TeacherPortalDashboard />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="mobile-app-wrapper">
        <main className="mobile-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/room/:id" element={<VideoRoom />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <AppShell />
      </Router>
    </>
  );
}

export default App;
