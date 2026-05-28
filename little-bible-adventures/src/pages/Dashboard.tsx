import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, PlayCircle, BookHeart, MonitorPlay, BookMarked, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './Dashboard.css';

interface Story {
  id: number;
  title: string;
  group: string;
  img: string;
  text: string;
}

interface BibleBook {
  id: number;
  title: string;
  category: 'Old Testament' | 'New Testament';
  summary: string;
  img: string;
  colorClass: string;
  link?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const initialTab = (tabParam === 'sessions' || tabParam === 'books') ? tabParam : 'posts';
  
  const initialGroup = queryParams.get('group') || 'all';
  const [activeTab, setActiveTab] = useState<'posts' | 'sessions' | 'books'>(initialTab);
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, title: 'Sunday School Live: Little Angels', time: 'Sunday 9:00 AM', group: '6-7', host: 'Teacher Sarah' },
      { id: 2, title: 'Bible Trivia & Fun: Redeemed', time: 'Sunday 10:00 AM', group: '8-9', host: 'Teacher Mark' },
      { id: 3, title: 'Deep Dive: Chosen', time: 'Sunday 11:00 AM', group: '10-12', host: 'Pastor John' },
    ];
    try {
      const saved = localStorage.getItem('db_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => {
          if (s.day && s.time) {
            const g = s.group.includes('6-7') ? '6-7' : s.group.includes('8-9') ? '8-9' : '10-12';
            return {
              id: s.id,
              title: s.title,
              time: `${s.day} ${s.time}`,
              group: g,
              host: s.host || 'Teacher Sarah'
            };
          }
          return s;
        });
      }
      return defaultSessions;
    } catch {
      return defaultSessions;
    }
  });

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab === 'sessions' || tab === 'posts' || tab === 'books') {
      setActiveTab(tab);
    }

    const group = queryParams.get('group');
    if (group) {
      setActiveGroup(group);
    }

    // Sync initial achievements stats from Supabase on load
    const syncStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          const { data } = await supabase.from('achievements').select('*').eq('user_id', userId);
          if (data && data.length > 0) {
            localStorage.setItem('storiesRead', data[0].stories_read.toString());
            localStorage.setItem('badgesEarned', data[0].badges_earned.toString());
          }
        }
      } catch (err) {
        console.warn('Offline achievements fetch failed:', err);
      }
    };
    syncStats();

    const fetchLiveSessions = async () => {
      try {
        const { data } = await supabase.from('sessions').select('*');
        if (data && data.length > 0) {
          const mappedSessions = data.map((s: any) => ({
            id: s.id,
            title: s.title,
            time: s.time,
            group: s.group_name || s.group || '6-7',
            host: s.host || 'Teacher Sarah'
          }));

          const defaultSessions = [
            { id: 1, title: 'Sunday School Live: Little Angels', time: 'Sunday 9:00 AM', group: '6-7', host: 'Teacher Sarah' },
            { id: 2, title: 'Bible Trivia & Fun: Redeemed', time: 'Sunday 10:00 AM', group: '8-9', host: 'Teacher Mark' },
            { id: 3, title: 'Deep Dive: Chosen', time: 'Sunday 11:00 AM', group: '10-12', host: 'Pastor John' },
          ];

          const filteredDefaults = defaultSessions.filter(
            ds => !mappedSessions.some((ms: any) => ms.title === ds.title)
          );

          const combined = [...mappedSessions, ...filteredDefaults];
          setSessions(combined);
          localStorage.setItem('db_sessions', JSON.stringify(combined));
        }
      } catch (err) {
        console.warn('Offline kids sessions sync failed:', err);
      }
    };
    fetchLiveSessions();
  }, [location.search]);

  const posts: Story[] = [
    { 
      id: 1, 
      title: 'Noah and the Big Boat', 
      group: '6-7', 
      img: '/noah.png',
      text: "A long time ago, God told Noah to build a giant boat called an Ark because a big rain was coming. Noah listened and gathered two of every animal. The rain came, but Noah, his family, and all the animals were safe and dry! God made a beautiful rainbow in the sky as a promise to never flood the earth again."
    },
    { 
      id: 2, 
      title: 'David and the Giant', 
      group: '8-9', 
      img: '/david.png',
      text: "David was a young shepherd boy who faced a giant warrior named Goliath. While all the soldiers were afraid, David trusted God. With just a small sling and a single stone, David defeated the giant! He showed everyone that with faith in God, no obstacle is too big to overcome."
    },
    { 
      id: 3, 
      title: 'Esther Saves Her People', 
      group: '10-12', 
      img: '/esther.png',
      text: "Esther was a brave queen who had to speak up to the king to save her people. It was scary, but her uncle Mordecai reminded her that she was chosen 'for such a time as this.' Esther prayed, found courage, spoke to the king, and saved everyone! She proved that God can use anyone to do great things."
    },
  ];


  const books: BibleBook[] = [
    {
      id: 1,
      title: 'In the Beginning - Coloring book',
      category: 'Old Testament',
      summary: '"In the beginning" is a perfect bedtime story and coloring book for kids aged 3-8 years based on the creation story in Genesis. Includes coloring pages, guided prayers, and Scriptures to encourage daily activities and cope with fears.',
      img: '/in-the-beginning.png',
      colorClass: 'card-yellow',
      link: 'https://www.amazon.ca/dp/B0GDXGWSZL?ref=sp_email'
    },
    {
      id: 2,
      title: 'Who Am I: My Identity in Christ (Hard Cover)',
      category: 'New Testament',
      summary: 'A 21-day devotional for young readers (ages 9-12) and teenagers to grow in their identity in Christ. Features daily prayers, guided parent-child exercises, and encouraging reminders of God\'s unconditional love. Hard cover copy on Amazon.com.',
      img: '/who-am-i-hardcover.png',
      colorClass: 'card-blue',
      link: 'https://www.amazon.com/dp/B0GBS7WC7R?ref=sp_email'
    },
    {
      id: 3,
      title: 'Who Am I: My Identity in Christ (Soft Cover)',
      category: 'New Testament',
      summary: 'A 21-day devotional for young readers (ages 9-12) and teenagers to know and grow in their identity in Christ. Features guided exercises, scriptures, and daily prayers to establish a foundation rooted in Christ. Soft cover copy on Amazon.ca.',
      img: '/who-am-i-softcover.png',
      colorClass: 'card-green',
      link: 'https://www.amazon.ca/dp/B0G6D2MV44?ref=sp_email'
    }
  ];

  const filteredPosts = activeGroup === 'all' ? posts : posts.filter(p => p.group === activeGroup);
  const filteredSessions = activeGroup === 'all' ? sessions : sessions.filter(s => s.group === activeGroup);
  const filteredBooks = books;

  const handleDoneReading = async () => {
    if (!selectedStory) return;

    const newStoriesRead = parseInt(localStorage.getItem('storiesRead') || '3') + 1;
    const newBadgesEarned = parseInt(localStorage.getItem('badgesEarned') || '1') + 1;

    localStorage.setItem('storiesRead', newStoriesRead.toString());
    localStorage.setItem('badgesEarned', newBadgesEarned.toString());

    // 1. Sync reading stats to Supabase Achievements table (Cloud Upsert)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await supabase.from('achievements').upsert({
          user_id: userId,
          stories_read: newStoriesRead,
          badges_earned: newBadgesEarned,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Achievements Database Sync Fallback:', err);
    }

    // 2. Sync registration activity log to Supabase Activities table (Cloud Insert)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      await supabase.from('activities').insert({
        parent_id: userId || 'mock-parent-id',
        child_name: 'Little Adventurer',
        message: `completed the story ${selectedStory.title}`,
        time_label: 'Just now',
        icon_bg: 'bg-yellow',
        icon_name: 'activity'
      });
    } catch (err) {
      console.warn('Activities Database Sync Fallback:', err);
    }

    // Local Storage backup for offline resilience
    try {
      const parentActivities = JSON.parse(localStorage.getItem('parentActivities') || '[]');
      parentActivities.unshift({
        id: Date.now(),
        childName: 'Little Adventurer',
        message: `completed the story ${selectedStory.title}`,
        time: 'Just now',
        iconBgClass: 'bg-yellow',
        icon: 'activity'
      });
      localStorage.setItem('parentActivities', JSON.stringify(parentActivities));
    } catch (e) {
      console.error(e);
    }

    // Close reading modal and open celebration modal
    setSelectedStory(null);
    setShowCongratulations(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header bg-purple">
        <div className="container header-container-flex">
          <img src="/logo.png" alt="Little Bible Adventures Logo" className="header-logo-img animate-float" />
          <div className="header-text-group">
            <h1 className="text-white animate-pulse">Kids Hub</h1>
            <p className="text-white">Welcome back! Pick your adventure for today.</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-filters">
          <div className="group-filters">
            <button className={`filter-btn ${activeGroup === 'all' ? 'active' : ''}`} onClick={() => setActiveGroup('all')}>All Groups</button>
            <button className={`filter-btn ${activeGroup === '6-7' ? 'active' : ''}`} onClick={() => setActiveGroup('6-7')}>Little Angels (6-7)</button>
            <button className={`filter-btn ${activeGroup === '8-9' ? 'active' : ''}`} onClick={() => setActiveGroup('8-9')}>Redeemed (8-9)</button>
            <button className={`filter-btn ${activeGroup === '10-12' ? 'active' : ''}`} onClick={() => setActiveGroup('10-12')}>Chosen (10-12)</button>
          </div>
          
          <div className="tab-filters">
            <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
              <BookHeart size={18} strokeWidth={2.5} /> Stories
            </button>
            <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
              <MonitorPlay size={18} strokeWidth={2.5} /> Live Sessions
            </button>
            <button className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
              <BookMarked size={18} strokeWidth={2.5} /> Bible Books
            </button>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="content-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="card dashboard-card">
                <img src={post.img} alt={post.title} className="card-image" />
                <div className="card-body">
                  <span className="badge badge-group">Ages {post.group}</span>
                  <h3>{post.title}</h3>
                  <button className="btn btn-primary mt-3" onClick={() => setSelectedStory(post)}>
                    Read Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="content-grid">
            {filteredSessions.map(session => (
              <div key={session.id} className="card session-card card-yellow">
                <div className="session-icon">
                  <PlayCircle size={40} color="var(--primary-color)" />
                </div>
                <div className="session-details">
                  <span className="badge badge-group">Ages {session.group}</span>
                  <h3>{session.title}</h3>
                  <p className="session-time"><Calendar size={14} /> {session.time}</p>
                  <p className="session-host">Host: {session.host}</p>
                  <button className="btn btn-secondary mt-3" onClick={() => navigate(`/room/${session.id}`)}>
                    Join Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'books' && (
          <div className="content-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="card dashboard-card">
                <img src={book.img} alt={book.title} className="card-image" style={{ height: '220px', objectFit: 'cover' }} />
                <div className="card-body">
                  <span className="badge badge-group">{book.category}</span>
                  <h3 style={{ marginTop: '0.5rem', fontSize: '1.2rem', lineHeight: '1.3' }}>{book.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1.25rem', minHeight: '3.5rem', lineHeight: '1.4' }}>
                    {book.summary}
                  </p>
                  <a 
                    href={book.link} 
                    target={book.link !== '#' ? '_blank' : undefined} 
                    rel="noopener noreferrer" 
                    className="btn btn-primary w-100" 
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={(e) => {
                      if (book.link === '#') {
                        e.preventDefault();
                        alert(`Amazon link for ${book.title} is coming soon! Stay tuned! 🛒`);
                      }
                    }}
                  >
                    Buy on Amazon 🛒
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {((activeTab === 'posts' && filteredPosts.length === 0) || 
          (activeTab === 'sessions' && filteredSessions.length === 0) ||
          (activeTab === 'books' && filteredBooks.length === 0)) && (
          <div className="empty-state">
            <h3>Oops! No adventures found here yet.</h3>
            <p>Check back later or try looking in another age group!</p>
          </div>
        )}
      </div>

      {/* Story Reading Modal */}
      {selectedStory && (
        <div className="app-modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="app-modal card" onClick={e => e.stopPropagation()}>
            <button className="app-modal-close" onClick={() => setSelectedStory(null)}>
              <X size={20} />
            </button>
            <img src={selectedStory.img} alt={selectedStory.title} className="app-modal-img" />
            <h2 className="app-modal-title">{selectedStory.title}</h2>
            <div className="app-modal-text">
              <p>{selectedStory.text}</p>
            </div>
            <button className="btn btn-primary w-100" onClick={handleDoneReading}>
              Done Reading! 🌟
            </button>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCongratulations && (
        <div className="app-modal-overlay" onClick={() => setShowCongratulations(false)}>
          <div className="app-modal card animate-float" onClick={e => e.stopPropagation()}>
            <button className="app-modal-close" onClick={() => setShowCongratulations(false)}>
              <X size={20} />
            </button>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
            <h2 className="app-modal-title">Sensational Job!</h2>
            <p style={{ margin: '1rem 0 1.5rem', color: 'var(--text-color)', fontSize: '1.1rem' }}>
              You completed your story adventure and earned a new reading badge! Keep up the amazing work!
            </p>
            <button className="btn btn-primary w-100" onClick={() => setShowCongratulations(false)}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
