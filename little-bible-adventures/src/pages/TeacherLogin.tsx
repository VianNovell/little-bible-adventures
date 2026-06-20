import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './TeacherPortal.css';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (signInError) throw signInError;
      
      localStorage.setItem('teacherAuth', 'true');
      localStorage.setItem('teacherName', data.user?.user_metadata?.full_name || 'Teacher');
      navigate('/teacher-portal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
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
            <div style={{ position: 'relative' }}>
              <input
                id="tp-password"
                type={showPassword ? "text" : "password"}
                className="tp-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
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
