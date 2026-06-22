import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, PlayCircle, BookHeart, MonitorPlay, BookMarked, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
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
  const { userRole } = useAuth();

  useEffect(() => {
    if (!userRole) {
      navigate('/login');
    }
  }, [userRole, navigate]);
  
  const [internalPosts, setInternalPosts] = useState<any[]>([]);

  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, title: 'Monday Live: Little Angels (4:30 PM)', time: 'Monday 4:30 PM EST', group: 'Little Angels', host: "Mrs. Sa'rah" },
      { id: 2, title: 'Monday Live: Little Angels (5:30 PM)', time: 'Monday 5:30 PM EST', group: 'Little Angels', host: "Mrs. Sa'rah" },
      { id: 3, title: 'Tuesday Live: Redeemed (4:30 PM)', time: 'Tuesday 4:30 PM EST', group: 'Redeemed', host: "Mrs. Sa'rah" },
      { id: 4, title: 'Tuesday Live: Redeemed (5:30 PM)', time: 'Tuesday 5:30 PM EST', group: 'Redeemed', host: "Mrs. Sa'rah" },
      { id: 5, title: 'Wednesday Live: Chosen (4:30 PM)', time: 'Wednesday 4:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
      { id: 6, title: 'Wednesday Live: Chosen (5:30 PM)', time: 'Wednesday 5:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
      { id: 7, title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', time: 'Thursday 4:30 PM EST', group: 'Little Angels & Redeemed', host: "Mrs. Sa'rah" },
      { id: 8, title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', time: 'Thursday 5:30 PM EST', group: 'Little Angels & Redeemed', host: "Mrs. Sa'rah" },
      { id: 9, title: 'Friday Prayer: Chosen (4:30 PM)', time: 'Friday 4:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
      { id: 10, title: 'Friday Prayer: Chosen (5:30 PM)', time: 'Friday 5:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
    ];
    return defaultSessions;
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

    const fetchPosts = async () => {
      try {
        const { data } = await supabase
          .from('internal_blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) {
          setInternalPosts(data);
        }
      } catch (err) {
        console.error('Error fetching internal posts:', err);
      }
    };
    fetchPosts();

    const fetchLiveSessions = async () => {
      try {
        if (!localStorage.getItem('cleared_old_sessions_v1')) {
          localStorage.removeItem('mock_db_sessions');
          localStorage.setItem('cleared_old_sessions_v1', 'true');
        }
        const { data } = await supabase.from('sessions').select('*');
        if (data && data.length > 0) {
          // Attempt to delete old test data from Supabase if possible
          if (!localStorage.getItem('cleared_test_data_v2')) {
            supabase.from('sessions').delete().neq('id', 0).then(() => {
              console.log('Cleared test data');
            });
            localStorage.setItem('cleared_test_data_v2', 'true');
          }

          // Filter out the old test records that were confusing the user
          const mappedSessions = data
            .filter((s: any) => {
              if (s.title === 'Little Angels' && (s.time === '12:00 PM' || s.time === ' PM' || !s.time)) return false;
              if (s.time === '12:00 PM' || s.time === ' PM' || s.time === '4:00 PM') return false; // aggressively filter out all test sessions
              if (s.title.includes('Mid-week') || s.title.includes('Sunday School')) return false; // filter out v1 defaults that were pushed to Supabase
              return true;
            })
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              time: s.time,
              group: s.group_name || s.group || '6-7',
              host: s.host || "Mrs. Sa'rah"
            }));

          const defaultSessions = [
            { id: 1, title: 'Monday Live: Little Angels (4:30 PM)', time: 'Monday 4:30 PM EST', group: 'Little Angels', host: "Mrs. Sa'rah" },
            { id: 2, title: 'Monday Live: Little Angels (5:30 PM)', time: 'Monday 5:30 PM EST', group: 'Little Angels', host: "Mrs. Sa'rah" },
            { id: 3, title: 'Tuesday Live: Redeemed (4:30 PM)', time: 'Tuesday 4:30 PM EST', group: 'Redeemed', host: "Mrs. Sa'rah" },
            { id: 4, title: 'Tuesday Live: Redeemed (5:30 PM)', time: 'Tuesday 5:30 PM EST', group: 'Redeemed', host: "Mrs. Sa'rah" },
            { id: 5, title: 'Wednesday Live: Chosen (4:30 PM)', time: 'Wednesday 4:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
            { id: 6, title: 'Wednesday Live: Chosen (5:30 PM)', time: 'Wednesday 5:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
            { id: 7, title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', time: 'Thursday 4:30 PM EST', group: 'Little Angels & Redeemed', host: "Mrs. Sa'rah" },
            { id: 8, title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', time: 'Thursday 5:30 PM EST', group: 'Little Angels & Redeemed', host: "Mrs. Sa'rah" },
            { id: 9, title: 'Friday Prayer: Chosen (4:30 PM)', time: 'Friday 4:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
            { id: 10, title: 'Friday Prayer: Chosen (5:30 PM)', time: 'Friday 5:30 PM EST', group: 'Chosen', host: "Mrs. Sa'rah" },
          ];

          const filteredDefaults = defaultSessions.filter(
            ds => !mappedSessions.some((ms: any) => ms.title === ds.title)
          );

          const combined = [...mappedSessions, ...filteredDefaults];
          setSessions(combined);
        }
      } catch (err) {
        console.warn('Offline live sessions fetch failed:', err);
      }
    };
    fetchLiveSessions();
  }, [location.search]);




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

  const filteredPosts = activeGroup === 'all' ? internalPosts : internalPosts.filter(p => p.group === activeGroup || p.group === 'all');
  const filteredSessions = activeGroup === 'all' ? sessions : sessions.filter(s => {
    if (activeGroup === '6-7') return s.group.includes('Little Angels');
    if (activeGroup === '8-9') return s.group.includes('Redeemed');
    if (activeGroup === '10-12') return s.group.includes('Chosen');
    return s.group === activeGroup;
  });
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
          stars_earned: parseInt(localStorage.getItem('starsEarned') || '0'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
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
              <BookHeart size={18} strokeWidth={2.5} /> Teacher Devotionals
            </button>

            <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
              <MonitorPlay size={18} strokeWidth={2.5} /> Live Sessions
            </button>
            <button className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
              <BookMarked size={18} strokeWidth={2.5} /> Children's Books
            </button>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="content-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="card dashboard-card">
                {((post.image_url || post.img) && post.image_url !== '/noah.png' && post.img !== '/noah.png') && (
                  <div style={{ width: '100%', height: '300px', overflow: 'hidden', borderBottom: '4px solid var(--accent-yellow)' }}>
                    <img src={post.image_url || post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center 50%` }} />
                  </div>
                )}
                <div className="card-body">
                  <h3>{post.title}</h3>
                  <button className="btn btn-primary mt-3" onClick={() => setSelectedStory(post)}>
                    Read Devotional
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
            {((selectedStory.image_url || selectedStory.img) && selectedStory.image_url !== '/noah.png' && selectedStory.img !== '/noah.png') && (
              <img src={selectedStory.image_url || selectedStory.img} alt={selectedStory.title} className="app-modal-img" />
            )}
            <h2 className="app-modal-title">{selectedStory.title}</h2>
            <div className="app-modal-text">
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedStory.content || selectedStory.text}</p>
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
