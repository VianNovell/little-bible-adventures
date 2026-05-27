import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialGroup = queryParams.get('group') || '';
  const [ageGroup, setAgeGroup] = useState(initialGroup);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (document.getElementById('email') as HTMLInputElement).value.toLowerCase().trim();
    
    if (emailInput === 'viankamanzi50@gmail.com') {
      setError('This email is reserved for the authorized teacher account and cannot be registered.');
      return;
    }
    
    if (emailInput.includes('teacher')) {
      setError('Teacher registration is restricted. Please contact your administrator.');
      return;
    }
    
    let selectedRole: 'parent' | 'student' = 'student';
    if (emailInput.includes('parent')) {
      selectedRole = 'parent';
    }
    
    login(selectedRole);
    
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect') || '/dashboard';
    navigate(redirectUrl);
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
              <input 
                type="password" 
                id="password" 
                className="input-control" 
                placeholder="Create a strong password" 
                required 
              />
            </div>
            
            <div className="input-group checkbox-group">
              <input type="checkbox" id="privacy" required />
              <label htmlFor="privacy">
                I have parental consent to join video sessions and agree to the <a href="#" className="auth-link">Privacy Policy</a>.
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
