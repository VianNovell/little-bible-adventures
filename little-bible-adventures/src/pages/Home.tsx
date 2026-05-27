import { Link, useNavigate } from 'react-router-dom';
import { Star, Users, BookOpen, Music, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleGroupClick = (group: string) => {
    if (userRole) {
      navigate(`/dashboard?group=${group}`);
    } else {
      navigate(`/signup?group=${group}`);
    }
  };

  const features = [
    {
      icon: <BookOpen size={28} />,
      label: 'Amazing Stories',
      desc: 'Fun Bible stories tailored for your age group.',
      cardClass: 'card-yellow',
      iconClass: 'bg-yellow',
      redirect: '/dashboard?tab=posts',
    },
    {
      icon: <Users size={28} />,
      label: 'Live Sessions',
      desc: 'Join Sunday School classes with kids your age.',
      cardClass: 'card-blue',
      iconClass: 'bg-blue',
      redirect: '/dashboard?tab=sessions',
    },
    {
      icon: <BookMarked size={28} />,
      label: 'Bible Books',
      desc: 'Explore books of the Bible in a fun, easy way.',
      cardClass: 'card-green',
      iconClass: 'bg-green',
      redirect: '/dashboard?tab=books',
    },
    {
      icon: <Music size={28} />,
      label: 'Fun Activities',
      desc: 'Sing along, play games, and learn together.',
      cardClass: 'card-purple',
      iconClass: 'bg-purple',
      redirect: '/dashboard?tab=activities',
    },
  ];

  return (
    <div className="home">
      <header className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover <span className="highlight-text animate-pulse">God's Word</span> in a Fun Way!
            </h1>
            <p className="hero-subtitle">
              Join the coolest online Sunday School! Exciting Bible stories, fun activities, and interactive sessions for kids ages 6 to 12.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary hero-btn">
                Start Adventure <Star className="btn-icon" />
              </Link>
              <Link to="/login" className="btn btn-outline hero-btn">
                Welcome Back!
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <img
              src="/hero-image.png"
              alt="Little Bible Adventures Train Logo"
              className="hero-img animate-float"
            />
          </div>
        </div>
      </header>

      <section className="features container">
        <h2 className="section-title text-center">What's Inside?</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div
              key={f.label}
              className={`feature-card-new ${f.cardClass}`}
              onClick={() => navigate(`/signup?redirect=${encodeURIComponent(f.redirect)}`)}
            >
              <div className={`feature-icon-new ${f.iconClass}`}>
                {f.icon}
              </div>
              <div className="feature-card-text">
                <h3>{f.label}</h3>
                <p>{f.desc}</p>
              </div>
              <span className="feature-arrow">›</span>
            </div>
          ))}
        </div>
      </section>

      <section className="age-groups">
        <div className="container">
          <h2 className="section-title text-center text-white">Groups For Everyone!</h2>
          <div className="groups-grid">
            <div className="group-badge badge-toddler" onClick={() => handleGroupClick('6-7')}>Little Angels (6-7)</div>
            <div className="group-badge badge-kids" onClick={() => handleGroupClick('8-9')}>Redeemed (8-9)</div>
            <div className="group-badge badge-tweens" onClick={() => handleGroupClick('10-12')}>Chosen (10-12)</div>
          </div>
        </div>
      </section>
    </div>
  );
}
