import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailInput = email.toLowerCase().trim();
    
    if (emailInput === 'viankamanzi50@gmail.com') {
      try {
        await login('teacher', emailInput, password);
        const queryParams = new URLSearchParams(location.search);
        const redirectUrl = queryParams.get('redirect') || '/teacher-dashboard';
        navigate(redirectUrl);
      } catch (err: any) {
        setError(err.message || 'Incorrect password or account does not exist.');
      }
    } else {
      if (emailInput.includes('teacher')) {
        setError('Access denied. Generic teacher logins are disabled. Please use the authorized teacher account.');
        return;
      }
      
      const role = emailInput.includes('parent') ? 'parent' : 'student';
      
      try {
        await login(role, emailInput, password);
        const queryParams = new URLSearchParams(location.search);
        const redirectUrl = queryParams.get('redirect') || '/dashboard';
        navigate(redirectUrl);
      } catch (err: any) {
        setError(err.message || 'Invalid credentials.');
      }
    }
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
            
            {error && (
              <div className="auth-error" style={{ color: '#e74c3c', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="input-control" 
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
