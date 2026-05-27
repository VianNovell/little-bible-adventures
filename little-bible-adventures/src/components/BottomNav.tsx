import { Link, useLocation } from 'react-router-dom';
import { Home, Rocket, Smile, HeartHandshake, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const { userRole } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  // Logged-in students see Activities instead of Home
  if (userRole === 'student') {
    return (
      <nav className="bottom-nav">
        <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard')}`}>
          <Rocket size={24} strokeWidth={2.5} />
          <span>Hub</span>
        </Link>
        <Link to="/activities" className={`bottom-nav-item ${isActive('/activities')}`}>
          <Gamepad2 size={24} strokeWidth={2.5} />
          <span>Activities</span>
        </Link>
        <Link to="/parent-dashboard" className={`bottom-nav-item ${isActive('/parent-dashboard')}`}>
          <HeartHandshake size={24} strokeWidth={2.5} />
          <span>Parents</span>
        </Link>
        <Link to="/profile" className={`bottom-nav-item ${isActive('/profile')}`}>
          <Smile size={24} strokeWidth={2.5} />
          <span>Profile</span>
        </Link>
      </nav>
    );
  }

  // Logged-out users see Home
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive('/')}`}>
        <Home size={24} strokeWidth={2.5} />
        <span>Home</span>
      </Link>
      <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard')}`}>
        <Rocket size={24} strokeWidth={2.5} />
        <span>Hub</span>
      </Link>
      <Link to="/parent-dashboard" className={`bottom-nav-item ${isActive('/parent-dashboard')}`}>
        <HeartHandshake size={24} strokeWidth={2.5} />
        <span>Parents</span>
      </Link>
      <Link to="/profile" className={`bottom-nav-item ${isActive('/profile')}`}>
        <Smile size={24} strokeWidth={2.5} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
