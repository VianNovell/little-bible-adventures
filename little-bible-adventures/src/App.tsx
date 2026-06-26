import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VideoRoom = lazy(() => import('./pages/VideoRoom'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Activities = lazy(() => import('./pages/Activities'));
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'));
const TeacherPortalDashboard = lazy(() => import('./pages/TeacherPortalDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: 'var(--primary-color)' }}>
    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Wrapper: Teacher portal routes bypass the kids' mobile shell entirely
function AppShell() {
  const location = useLocation();
  const isTeacherPortal = location.pathname.startsWith('/teacher-portal');

  if (isTeacherPortal) {
    return (
      <div className="mobile-app-wrapper">
        <main className="mobile-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/teacher-portal" element={<TeacherLogin />} />
              <Route path="/teacher-portal/dashboard" element={<TeacherPortalDashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="mobile-app-wrapper">
        <main className="mobile-content">
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
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
