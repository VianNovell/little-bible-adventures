import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
