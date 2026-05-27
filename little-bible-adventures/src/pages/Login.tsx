import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple mock logic: if email has 'teacher' log in as teacher, etc.
    if (email.includes('teacher')) {
      login('teacher');
    } else if (email.includes('parent')) {
      login('parent');
    } else {
      login('student');
    }
    
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect') || '/activities';
    navigate(redirectUrl);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="Little Bible Adventures Logo" className="auth-logo-img animate-float" />
            <h2>Welcome Back!</h2>
            <p>Ready for more adventures?</p>
          </div>
          
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="input-control" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="input-control" 
                placeholder="Enter your password" 
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary auth-submit">
              Log In
            </button>
          </form>
          
          <p className="auth-footer">
            Don't have an account? <Link to={`/signup${location.search}`} className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
