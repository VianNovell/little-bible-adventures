import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, LogIn, Heart } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <BookOpen className="logo-icon animate-pulse" />
          <span className="logo-text">Little Bible Adventures</span>
        </Link>
        <div className="navbar-links">
          <Link to="/login" className="nav-link">
            <LogIn size={20} />
            <span>Log In</span>
          </Link>
          <Link to="/signup" className="btn btn-primary nav-btn">
            <UserCircle size={20} />
            <span>Sign Up</span>
          </Link>
          <Link to="/parent-dashboard" className="nav-link">
            <span>Parent</span>
          </Link>
          <Link to="/teacher-dashboard" className="nav-link">
            <span>Teacher</span>
          </Link>
          <Link to="/dashboard" className="btn btn-secondary nav-btn">
            <Heart size={20} />
            <span>Kids Hub</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
