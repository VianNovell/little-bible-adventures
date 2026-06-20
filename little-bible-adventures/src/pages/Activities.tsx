import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Star, BookOpen, Mic2, Gamepad2, Heart } from 'lucide-react';
import './Activities.css';

import BibleQuiz from '../components/activities/BibleQuiz';
import MemoryVerse from '../components/activities/MemoryVerse';
import PrayerCorner from '../components/activities/PrayerCorner';
import BibleGames from '../components/activities/BibleGames';

const activities = [
  {
    id: 1,
    icon: <HelpCircle size={28} />,
    title: 'Bible Quiz',
    desc: 'Test your Bible knowledge!',
    tag: 'Quiz',
    color: 'act-yellow',
    emoji: '🎯',
  },

  {
    id: 4,
    icon: <BookOpen size={28} />,
    title: 'Memory Verse',
    desc: 'Learn a new verse each week.',
    tag: 'Learning',
    color: 'act-green',
    emoji: '📖',
  },
  {
    id: 5,
    icon: <Mic2 size={28} />,
    title: 'Prayer Corner',
    desc: 'Share your prayer requests.',
    tag: 'Prayer',
    color: 'act-pink',
    emoji: '🙏',
  },
  {
    id: 6,
    icon: <Gamepad2 size={28} />,
    title: 'Bible Games',
    desc: 'Fun games with Bible themes.',
    tag: 'Games',
    color: 'act-orange',
    emoji: '🎮',
  },
];

const featured = {
  title: "This Week's Memory Verse",
  verse: '"For God so loved the world that He gave His one and only Son."',
  ref: 'John 3:16',
};

export default function Activities() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  return (
    <div className="activities-page">
      {/* Header */}
      <div className="act-header bg-purple">
        <div className="container header-container-flex">
          <img src="/logo.png" alt="Little Bible Adventures Logo" className="header-logo-img animate-float" />
          <div className="header-text-group">
            <h1 className="text-white">Fun Activities 🎉</h1>
            <p className="text-white">Games, songs & Bible fun — just for you!</p>
          </div>
        </div>
      </div>

      <div className="container act-content">
        {/* Featured verse card */}
        <div className="act-featured card card-yellow">
          <div className="act-featured-icon">⭐</div>
          <div>
            <span className="act-tag">This Week</span>
            <h3>{featured.title}</h3>
            <p className="act-verse">{featured.verse}</p>
            <p className="act-ref">— {featured.ref}</p>
          </div>
        </div>

        {/* Activities grid */}
        <h2 className="act-section-title">Pick an Activity</h2>
        <div className="act-grid">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`act-card card ${act.color}`}
              onClick={() => setSelectedActivity(act.title)}
            >
              <div className="act-emoji">{act.emoji}</div>
              <h3>{act.title}</h3>
              <p>{act.desc}</p>
              <span className="act-pill">{act.tag}</span>
            </div>
          ))}
        </div>

        {/* Streak banner */}
        <div className="act-streak card">
          <div className="act-streak-left">
            <Star size={24} className="act-star" fill="#f6ad55" color="#f6ad55" />
            <div>
              <strong>You're on a 3-day streak! 🔥</strong>
              <p>Keep coming back every day to earn badges.</p>
            </div>
          </div>
          <button className="btn btn-primary act-claim-btn" onClick={() => navigate('/profile')}>
            <Heart size={16} /> My Badges
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedActivity === 'Bible Quiz' && <BibleQuiz onClose={() => setSelectedActivity(null)} />}
      {selectedActivity === 'Memory Verse' && <MemoryVerse onClose={() => setSelectedActivity(null)} />}
      {selectedActivity === 'Prayer Corner' && <PrayerCorner onClose={() => setSelectedActivity(null)} />}
      {selectedActivity === 'Bible Games' && <BibleGames onClose={() => setSelectedActivity(null)} />}
    </div>
  );
}
