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
  const [starsEarned, setStarsEarned] = useState(() => parseInt(localStorage.getItem('starsEarned') || '0'));

  useEffect(() => {
    const handleRewardsUpdated = (e: CustomEvent) => {
      if (e.detail.badges !== undefined) setBadgesEarned(e.detail.badges);
      if (e.detail.stars !== undefined) setStarsEarned(e.detail.stars);
    };
    
    window.addEventListener('rewardsUpdated', handleRewardsUpdated as EventListener);
    return () => window.removeEventListener('rewardsUpdated', handleRewardsUpdated as EventListener);
  }, []);

  useEffect(() => {
    // Fetch live relational statistics from database achievements table
    const fetchStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          const { data, error } = await supabase.from('achievements').select('*').eq('user_id', userId);
          if (error) throw error;
          
          if (data && data.length > 0) {
            setStoriesRead(data[0].stories_read || 0);
            setBadgesEarned(data[0].badges_earned || 0);
            setStarsEarned(data[0].stars_earned || 0);
            localStorage.setItem('storiesRead', (data[0].stories_read || 0).toString());
            localStorage.setItem('badgesEarned', (data[0].badges_earned || 0).toString());
            localStorage.setItem('starsEarned', (data[0].stars_earned || 0).toString());
          } else {
            // New user, initialize their cloud stats with their current offline progress
            const currentStories = parseInt(localStorage.getItem('storiesRead') || '0');
            const currentBadges = parseInt(localStorage.getItem('badgesEarned') || '0');
            const currentStars = parseInt(localStorage.getItem('starsEarned') || '0');
            
            await supabase.from('achievements').insert({
              user_id: userId,
              stories_read: currentStories,
              badges_earned: currentBadges,
              stars_earned: currentStars
            });
            
            setStoriesRead(currentStories);
            setBadgesEarned(currentBadges);
            setStarsEarned(currentStars);
          }
        } else {
          // No user, just use what's in local storage
          setStoriesRead(parseInt(localStorage.getItem('storiesRead') || '0'));
          setBadgesEarned(parseInt(localStorage.getItem('badgesEarned') || '0'));
          setStarsEarned(parseInt(localStorage.getItem('starsEarned') || '0'));
        }
      } catch (err) {
        console.warn('Achievements stats fetch fallback:', err);
        setStoriesRead(parseInt(localStorage.getItem('storiesRead') || '0'));
        setBadgesEarned(parseInt(localStorage.getItem('badgesEarned') || '0'));
        setStarsEarned(parseInt(localStorage.getItem('starsEarned') || '0'));
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
          <div className="stat-card card">
            <div className="stat-icon bg-yellow"><Star color="white" /></div>
            <div className="stat-info">
              <h3>{starsEarned}</h3>
              <p>Stars</p>
            </div>
          </div>
        </div>

        <div className="profile-badges card mt-4">
          <h2 className="section-title-sm">My Badges</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#ed8936', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem' }}>📖</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>First Story</p>
            </div>
            {badgesEarned > 1 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#48bb78', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem' }}>🧠</div>
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Memory Champ</p>
              </div>
            )}
            {badgesEarned > 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#e53e3e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem' }}>🏆</div>
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Quiz Master</p>
              </div>
            )}
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
              <div style={{ width: '60px', height: '60px', background: '#cbd5e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem' }}>🔒</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Locked</p>
            </div>
          </div>
        </div>

        <div className="profile-menu card mt-4">

          <button className="menu-item text-danger" onClick={logout}>
            <LogOut size={20} className="menu-icon text-danger" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
