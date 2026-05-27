import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import './TeacherPortal.css';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().trim() === 'viankamanzi50@gmail.com' && password.trim() === '78910') {
      localStorage.setItem('teacherAuth', 'true');
      localStorage.setItem('teacherName', 'Vian');
      navigate('/teacher-portal/dashboard');
    } else {
      setError('Invalid credentials. Access restricted to the authorized teacher account only.');
    }
  };

  return (
    <div className="tp-page">
      <div className="card auth-card tp-login-card">
        <div className="tp-login-header">
          <div className="tp-shield-icon">
            <Shield size={36} color="white" />
          </div>
          <h1>Teacher Portal</h1>
          <p>Little Bible Adventures — Staff Access Only</p>
        </div>

        <form className="tp-form" onSubmit={handleLogin}>
          {error && <div className="tp-error">{error}</div>}

          <div className="tp-input-group">
            <label htmlFor="tp-email">Work Email</label>
            <input
              id="tp-email"
              type="email"
              className="tp-input"
              placeholder="name@church.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="tp-input-group">
            <label htmlFor="tp-password">Password</label>
            <input
              id="tp-password"
              type="password"
              className="tp-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="tp-btn-primary">
            <LogIn size={18} /> Sign In to Portal
          </button>
        </form>

        <p className="tp-footer-note">
          This portal is for authorised church staff only.<br />
          <span onClick={() => navigate('/')} className="tp-back-link">← Back to Kids App</span>
        </p>
      </div>
    </div>
  );
}
