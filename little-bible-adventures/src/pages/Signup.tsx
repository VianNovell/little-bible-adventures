import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialGroup = queryParams.get('group') || '';
  const [ageGroup, setAgeGroup] = useState(initialGroup);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (document.getElementById('email') as HTMLInputElement).value.toLowerCase().trim();
    const passwordInput = (document.getElementById('password') as HTMLInputElement).value;
    
    // Removed restriction to allow the admin to register the teacher account directly via the app.
    
    let selectedRole: 'parent' | 'student' = 'student';
    if (emailInput.includes('parent')) {
      selectedRole = 'parent';
    }
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });

      if (signUpError) throw signUpError;

      if (data?.session) {
        await login(selectedRole, emailInput, passwordInput);
        const queryParams = new URLSearchParams(location.search);
        const redirectUrl = queryParams.get('redirect') || '/dashboard';
        navigate(redirectUrl);
      } else {
        alert("Account created successfully! Please check your email to confirm your account before logging in.");
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="Little Bible Adventures Logo" className="auth-logo-img animate-float" />
            <h2>Join the Adventure!</h2>
            <p>Create an account to start exploring.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSignup}>
            {error && (
              <div className="auth-error" style={{ color: '#e74c3c', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="input-control" 
                placeholder="What's your name?" 
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="ageGroup">My Age Group</label>
              <select 
                id="ageGroup" 
                className="input-control select-control" 
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                required
              >
                <option value="">Select your group</option>
                <option value="6-7">Little Angels (6-7 years)</option>
                <option value="8-9">Redeemed (8-9 years)</option>
                <option value="10-12">Chosen (10-12 years)</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email (or Parent's Email)</label>
              <input 
                type="email" 
                id="email" 
                className="input-control" 
                placeholder="Enter email" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="input-control" 
                  placeholder="Create a strong password" 
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
            
            <div className="input-group checkbox-group">
              <input type="checkbox" id="privacy" required />
              <label htmlFor="privacy">
                I have parental consent to join video sessions and agree to the <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Sign Up Let's Go!
            </button>
          </form>
          
          <p className="auth-footer">
            Already have an account? <Link to={`/login${location.search}`} className="auth-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
