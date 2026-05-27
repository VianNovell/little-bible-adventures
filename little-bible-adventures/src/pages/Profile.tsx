import { useRef, useState, useEffect } from 'react';
import { LogOut, Star, Award, Settings, Camera, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './Profile.css';

export default function Profile() {
  const { logout, userRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string | null>(
    localStorage.getItem('profilePic')
  );

  const [storiesRead, setStoriesRead] = useState(() => parseInt(localStorage.getItem('storiesRead') || '3'));
  const [badgesEarned, setBadgesEarned] = useState(() => parseInt(localStorage.getItem('badgesEarned') || '1'));

  useEffect(() => {
    // Fetch live relational statistics from database achievements table
    const fetchStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          const { data } = await supabase.from('achievements').select('*').eq('user_id', userId);
          if (data && data.length > 0) {
            setStoriesRead(data[0].stories_read);
            setBadgesEarned(data[0].badges_earned);
            localStorage.setItem('storiesRead', data[0].stories_read.toString());
            localStorage.setItem('badgesEarned', data[0].badges_earned.toString());
          }
        }
      } catch (err) {
        console.warn('Achievements stats fetch fallback:', err);
      }
    };
    fetchStats();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePic(dataUrl);
      localStorage.setItem('profilePic', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <div className="profile-header bg-purple">
        <div className="container header-container-flex">
          <img src="/logo.png" alt="Little Bible Adventures Logo" className="header-logo-img animate-float" />
          <div className="header-text-group">
            <h1 className="text-white">My Profile</h1>
            <p className="text-white">Your adventure details</p>
          </div>
        </div>
      </div>

      <div className="container profile-content">
        <div className="profile-card card">
          <div
            className="profile-avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            title="Tap to change photo"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar bg-yellow">
                <UserCircle size={64} color="white" />
              </div>
            )}
            <div className="profile-camera-badge">
              <Camera size={14} color="white" />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <h2 className="profile-name">Little Adventurer</h2>
          <span className="badge badge-group profile-role">
            {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Student'}
          </span>
          <p className="profile-photo-hint">Tap photo to change</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon bg-blue"><Star color="white" /></div>
            <div className="stat-info">
              <h3>{storiesRead}</h3>
              <p>Stories Read</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon bg-purple"><Award color="white" /></div>
            <div className="stat-info">
              <h3>{badgesEarned}</h3>
              <p>Badges Earned</p>
            </div>
          </div>
        </div>

        <div className="profile-menu card">
          <button className="menu-item">
            <Settings size={20} className="menu-icon" />
            <span>Account Settings</span>
          </button>
          <button className="menu-item text-danger" onClick={logout}>
            <LogOut size={20} className="menu-icon text-danger" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
