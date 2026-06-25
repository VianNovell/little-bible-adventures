import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Calendar, BookOpen, Video, Plus, Edit,
  LogOut, BarChart2, ChevronRight, CheckCircle, Clock, X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './TeacherPortal.css';



const STUDENTS = [
  { name: 'Emma K.', group: 'Little Angels', joined: 'May 10' },
  { name: 'Liam O.', group: 'Redeemed', joined: 'May 12' },
  { name: 'Zoe M.', group: 'Chosen', joined: 'May 14' },
  { name: 'Noah R.', group: 'Little Angels', joined: 'May 15' },
  { name: 'Ava T.', group: 'Redeemed', joined: 'May 17' },
];

type Tab = 'overview' | 'sessions' | 'stories' | 'students' | 'prayers';

export default function TeacherPortalDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const teacherName = localStorage.getItem('teacherName') || 'Teacher';

  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, day: 'Mon', time: '4:30 PM', title: 'Monday Live: Little Angels (4:30 PM)', group: 'Little Angels' },
      { id: 2, day: 'Mon', time: '5:30 PM', title: 'Monday Live: Little Angels (5:30 PM)', group: 'Little Angels' },
      { id: 3, day: 'Tue', time: '4:30 PM', title: 'Tuesday Live: Redeemed (4:30 PM)', group: 'Redeemed' },
      { id: 4, day: 'Tue', time: '5:30 PM', title: 'Tuesday Live: Redeemed (5:30 PM)', group: 'Redeemed' },
      { id: 5, day: 'Wed', time: '4:30 PM', title: 'Wednesday Live: Chosen (4:30 PM)', group: 'Chosen' },
      { id: 6, day: 'Wed', time: '5:30 PM', title: 'Wednesday Live: Chosen (5:30 PM)', group: 'Chosen' },
      { id: 7, day: 'Thu', time: '4:30 PM', title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', group: 'Little Angels & Redeemed' },
      { id: 8, day: 'Thu', time: '5:30 PM', title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', group: 'Little Angels & Redeemed' },
      { id: 9, day: 'Fri', time: '4:30 PM', title: 'Friday Prayer: Chosen (4:30 PM)', group: 'Chosen' },
      { id: 10, day: 'Fri', time: '5:30 PM', title: 'Friday Prayer: Chosen (5:30 PM)', group: 'Chosen' },
    ];
    return defaultSessions;
  });

  const [internalPosts, setInternalPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Sunday 11:00 AM');
  const [newGroup, setNewGroup] = useState('6-7');
  const [newHost, setNewHost] = useState("Mrs. Sa'rah");

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogGroup, setBlogGroup] = useState('all');
  const [blogImg, setBlogImg] = useState('');
  const [blogText, setBlogText] = useState('');

  const [showVerseModal, setShowVerseModal] = useState(false);
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [verseDifficulty, setVerseDifficulty] = useState('Easy');

  useEffect(() => {
    const auth = localStorage.getItem('teacherAuth');
    if (auth !== 'true') {
      navigate('/teacher-portal');
    }

    const fetchLiveSessions = async () => {
      try {
        if (!localStorage.getItem('cleared_old_sessions_v1_teacher_portal')) {
          localStorage.removeItem('mock_db_sessions');
          localStorage.setItem('cleared_old_sessions_v1_teacher_portal', 'true');
        }
        const { data } = await supabase.from('sessions').select('*');
        if (data && data.length > 0) {
          const mappedSessions = data.map((s: any) => {
            return {
              id: s.id,
              day: s.day || 'Mon',
              time: s.time || '12:00 PM',
              title: s.title,
              group: s.group_name || s.group || 'All Groups'
            };
          });

          const defaultSessions = [
            { id: 1, day: 'Mon', time: '4:30 PM', title: 'Monday Live: Little Angels (4:30 PM)', group: 'Little Angels' },
            { id: 2, day: 'Mon', time: '5:30 PM', title: 'Monday Live: Little Angels (5:30 PM)', group: 'Little Angels' },
            { id: 3, day: 'Tue', time: '4:30 PM', title: 'Tuesday Live: Redeemed (4:30 PM)', group: 'Redeemed' },
            { id: 4, day: 'Tue', time: '5:30 PM', title: 'Tuesday Live: Redeemed (5:30 PM)', group: 'Redeemed' },
            { id: 5, day: 'Wed', time: '4:30 PM', title: 'Wednesday Live: Chosen (4:30 PM)', group: 'Chosen' },
            { id: 6, day: 'Wed', time: '5:30 PM', title: 'Wednesday Live: Chosen (5:30 PM)', group: 'Chosen' },
            { id: 7, day: 'Thu', time: '4:30 PM', title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', group: 'Little Angels & Redeemed' },
            { id: 8, day: 'Thu', time: '5:30 PM', title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', group: 'Little Angels & Redeemed' },
            { id: 9, day: 'Fri', time: '4:30 PM', title: 'Friday Prayer: Chosen (4:30 PM)', group: 'Chosen' },
            { id: 10, day: 'Fri', time: '5:30 PM', title: 'Friday Prayer: Chosen (5:30 PM)', group: 'Chosen' },
          ];

          const filteredDefaults = defaultSessions.filter(
            ds => !mappedSessions.some((ms: any) => ms.title === ds.title)
          );

          const combined = [...mappedSessions, ...filteredDefaults];
          setSessions(combined);
        }

        const { data: postsData } = await supabase
          .from('internal_blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (postsData) setInternalPosts(postsData);

        const { data: prayersData } = await supabase
          .from('prayers')
          .select('*')
          .order('created_at', { ascending: false });
        if (prayersData) setPrayers(prayersData);

      } catch (err) {
        console.warn('Data fetch failed:', err);
      }
    };
    fetchLiveSessions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('teacherName');
    navigate('/teacher-portal');
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parts = newTime.split(' ');
    const day = parts[0] || 'Sun';
    const sessionObj = {
      id: Date.now(),
      title: newTitle.trim(),
      day: day,
      time: newTime,
      group: newGroup === '6-7' ? 'Little Angels (6-7)' : newGroup === '8-9' ? 'Redeemed (8-9)' : 'Chosen (10-12)',
      host: teacherName
    };
    const updatedSessions = [sessionObj, ...sessions];
    setSessions(updatedSessions);

    // Save to Supabase (Cloud Insert)
    try {
      await supabase.from('sessions').insert({
        title: sessionObj.title,
        time: newTime,
        group_name: newGroup,
        host: newHost
      });
    } catch (err) {
      console.warn('Supabase sessions insert offline fallback:', err);
    }

    setNewTitle('');
    setNewTime('Sunday 11:00 AM');
    setNewGroup('6-7');
    setShowModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogText.trim()) return;

    const newPost = {
      title: blogTitle.trim(),
      image_url: blogImg,
      content: blogText.trim(),
      group: blogGroup
    };

    try {
      const { data, error } = await supabase.from('internal_blog_posts').insert([newPost]).select();
      if (error) {
        console.error("Supabase insert error:", error);
        alert("Failed to publish post: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setInternalPosts(prev => [data[0], ...prev]);
      }
      
      setBlogTitle('');
      setBlogText('');
      setBlogImg('');
      setShowBlogModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verseRef.trim() || !verseText.trim()) return;

    try {
      const { error } = await supabase.from('memory_verses').insert([{
        reference: verseRef.trim(),
        text: verseText.trim(),
        difficulty: verseDifficulty
      }]);
      
      if (error) {
        console.error("Error posting verse:", error);
        alert("Failed to post verse: " + error.message);
      } else {
        setShowVerseModal(false);
        setVerseRef('');
        setVerseText('');
        setVerseDifficulty('Easy');
        alert("Memory Verse Posted!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tp-dashboard">

      {/* Mobile Top Header */}
      <div className="tp-mobile-header">
        <div className="tp-mobile-header-left">
          <div className="tp-mobile-shield"><Shield size={18} color="white" /></div>
          <div>
            <p className="tp-mobile-greeting">Hello, {teacherName.charAt(0).toUpperCase() + teacherName.slice(1)} 👋</p>
            <p className="tp-mobile-sub">Teacher Portal</p>
          </div>
        </div>
        <button className="tp-mobile-logout" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="tp-mobile-content">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="tp-stats-row">
              <div className="tp-stat-card">
                <div className="tp-stat-icon tp-icon-yellow"><Calendar size={18} /></div>
                <div><h3>{sessions.length}</h3><p>Sessions</p></div>
              </div>
              <div className="tp-stat-card">
                <div className="tp-stat-icon tp-icon-blue"><Users size={18} /></div>
                <div><h3>47</h3><p>Students</p></div>
              </div>
              <div className="tp-stat-card">
                <div className="tp-stat-icon tp-icon-green"><BookOpen size={18} /></div>
                <div><h3>{internalPosts.length}</h3><p>Internal Posts</p></div>
              </div>
            </div>

            <div className="card tp-card">
              <div className="tp-card-header">
                <h3>Next Sessions</h3>
                <button className="tp-text-btn" onClick={() => setActiveTab('sessions')}>View all <ChevronRight size={14} /></button>
              </div>
              {sessions.slice(0, 2).map(s => (
                <div key={s.id} className="tp-session-row">
                  <div className="tp-session-badge"><span>{s.day}</span><span>{s.time}</span></div>
                  <div className="tp-session-detail">
                    <strong>{s.title}</strong>
                    <span>{s.group}</span>
                  </div>
                  <button className="tp-btn-start" onClick={() => navigate(`/room/${s.id}?role=teacher`)}>
                    <Video size={13} /> Start
                  </button>
                </div>
              ))}
            </div>

            <div className="card tp-card">
              <div className="tp-card-header">
                <h3>Recent Internal Posts</h3>
                <button className="tp-text-btn" onClick={() => setActiveTab('stories')}>View all <ChevronRight size={14} /></button>
              </div>
              {internalPosts.length === 0 && <p style={{fontSize:'0.9rem', color:'#666', padding:'0.5rem 1rem'}}>No posts yet. Write one!</p>}
              {internalPosts.slice(0, 3).map(s => (
                <div key={s.id} className="tp-story-row">
                  <BookOpen size={16} className="tp-story-icon" />
                  <div className="tp-story-detail">
                    <strong>{s.title}</strong>
                    <span>{s.audience || s.group} · {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  {s.published !== false
                    ? <CheckCircle size={15} className="tp-published" />
                    : <Clock size={15} className="tp-draft" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <div className="tp-section-header">
              <h3>All Sessions</h3>
              <button className="tp-btn-primary-sm" onClick={() => setShowModal(true)}><Plus size={14} /> New</button>
            </div>
            <div className="card tp-card">
              {sessions.map(s => (
                <div key={s.id} className="tp-session-row">
                  <div className="tp-session-badge"><span>{s.day}</span><span>{s.time}</span></div>
                  <div className="tp-session-detail">
                    <strong>{s.title}</strong>
                    <span>{s.group}</span>
                  </div>
                  <div className="tp-session-actions">
                    <button className="tp-btn-outline-sm"><Edit size={12} /></button>
                    <button className="tp-btn-start" onClick={() => navigate(`/room/${s.id}?role=teacher`)}>
                      <Video size={13} /> Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div>
            <div className="tp-section-header">
              <h3>Devotionals</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="tp-btn-outline-sm" onClick={() => setShowVerseModal(true)}><BookOpen size={14} /> Post Verse</button>
                <button className="tp-btn-primary-sm" onClick={() => setShowBlogModal(true)}><Plus size={14} /> Write Devotional</button>
              </div>
            </div>
            <div className="card tp-card">
              {internalPosts.length === 0 && <p style={{padding:'1rem', textAlign:'center', color:'#666'}}>You haven't written any devotionals yet.</p>}
              {internalPosts.map(s => (
                <div key={s.id} className="tp-story-row">
                  <BookOpen size={18} className="tp-story-icon" />
                  <div className="tp-story-detail">
                    <strong>{s.title}</strong>
                    <span>{s.group} · {s.date}</span>
                  </div>
                  <span className={`tp-status-badge ${s.published !== false ? 'tp-published-badge' : 'tp-draft-badge'}`}>
                    {s.published !== false ? 'Live' : 'Draft'}
                  </span>
                  <button className="tp-btn-outline-sm"><Edit size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="tp-section-header">
              <h3>Students</h3>
              <span className="tp-count-badge">{STUDENTS.length} enrolled</span>
            </div>
            {STUDENTS.map((s, i) => (
              <div key={i} className="card tp-student-row">
                <div className="tp-student-avatar">{s.name[0]}</div>
                <div className="tp-student-info">
                  <strong>{s.name}</strong>
                  <span>{s.group} · Joined {s.joined}</span>
                </div>
                <button className="tp-btn-outline-sm">View</button>
              </div>
            ))}
          </div>
        )}
        {/* Prayers Tab */}
        {activeTab === 'prayers' && (
          <div>
            <div className="tp-section-header">
              <h3>Prayer Requests</h3>
              <span className="tp-count-badge">{prayers.length} prayers</span>
            </div>
            {prayers.length === 0 && <p style={{fontSize:'0.9rem', color:'#666', padding:'0.5rem 1rem'}}>No prayer requests yet.</p>}
            {prayers.map((prayer) => (
              <div key={prayer.id} className="card tp-student-row" style={{ alignItems: 'flex-start' }}>
                <div className="tp-student-avatar" style={{ backgroundColor: '#ed8936' }}>{prayer.author[0]?.toUpperCase() || '?'}</div>
                <div className="tp-student-info" style={{ width: '100%' }}>
                  <strong>{prayer.author}</strong>
                  <span style={{ marginBottom: '0.5rem', display: 'block' }}>{new Date(prayer.created_at).toLocaleDateString()}</span>
                  <p style={{ color: '#333', lineHeight: '1.4', background: '#f7fafc', padding: '0.8rem', borderRadius: '8px' }}>
                    "{prayer.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="tp-bottom-nav">
        {([
          { key: 'overview', icon: <BarChart2 size={22} />, label: 'Home' },
          { key: 'sessions', icon: <Video size={22} />, label: 'Live' },
          { key: 'stories', icon: <BookOpen size={22} />, label: 'Blog' },
          { key: 'prayers', icon: <Users size={22} />, label: 'Prayers' },
        ] as { key: Tab; icon: React.ReactNode; label: string }[]).map(item => (
          <button
            key={item.key}
            className={`tp-tab-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Schedule Live Session Modal */}
      {showModal && (
        <div className="tp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tp-modal card" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h2>Schedule Live Session</h2>
            <form onSubmit={handleCreateSession} className="tp-form">
              <div className="tp-input-group">
                <label htmlFor="sess-title">Session Title</label>
                <input
                  type="text"
                  id="sess-title"
                  className="tp-input"
                  placeholder="e.g. Sunday School Live"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="tp-input-group">
                <label htmlFor="sess-time">Day & Time</label>
                <input
                  type="text"
                  id="sess-time"
                  className="tp-input"
                  placeholder="e.g. Sunday 11:00 AM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  required
                />
              </div>

              <div className="tp-input-group">
                <label htmlFor="sess-group">Age Group Filter</label>
                <select
                  id="sess-group"
                  className="tp-input"
                  style={{ appearance: 'none', background: 'white' }}
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  required
                >
                  <option value="6-7">Little Angels (Ages 6-7)</option>
                  <option value="8-9">Redeemed (Ages 8-9)</option>
                  <option value="10-12">Chosen (Ages 10-12)</option>
                </select>
              </div>

              <div className="tp-input-group">
                <label htmlFor="sess-host">Host Teacher</label>
                <input
                  type="text"
                  id="sess-host"
                  className="tp-input"
                  placeholder="e.g. Mrs. Sa'rah"
                  value={newHost}
                  onChange={e => setNewHost(e.target.value)}
                  required
                />
              </div>

              <div className="tp-modal-actions">
                <button type="button" className="tp-btn-outline-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="tp-btn-primary" style={{ marginTop: 0 }}>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Blog Post Modal */}
      {showBlogModal && (
        <div className="tp-modal-overlay" onClick={() => setShowBlogModal(false)}>
          <div className="tp-modal card" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowBlogModal(false)}>
              <X size={20} />
            </button>
            <h2>Write Devotional</h2>
            <form onSubmit={handleCreateBlogPost} className="tp-form">
              <div className="tp-input-group">
                <label htmlFor="blog-title">Title</label>
                <input
                  type="text"
                  id="blog-title"
                  className="tp-input"
                  placeholder="e.g. Noah's Ark Craft Results"
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  required
                />
              </div>

              <div className="tp-input-group">
                <label htmlFor="blog-group">Audience (Age Group)</label>
                <select
                  id="blog-group"
                  className="tp-input"
                  style={{ appearance: 'none', background: 'white' }}
                  value={blogGroup}
                  onChange={e => setBlogGroup(e.target.value)}
                  required
                >
                  <option value="all">All Groups</option>
                  <option value="6-7">Little Angels (Ages 6-7)</option>
                  <option value="8-9">Redeemed (Ages 8-9)</option>
                  <option value="10-12">Chosen (Ages 10-12)</option>
                </select>
              </div>


              <div className="tp-input-group">
                <label htmlFor="blog-text">Devotional Content</label>
                <textarea
                  id="blog-text"
                  className="tp-input"
                  placeholder="Write your devotional here..."
                  rows={4}
                  value={blogText}
                  onChange={e => setBlogText(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="tp-modal-actions">
                <button type="button" className="tp-btn-outline-sm" onClick={() => setShowBlogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="tp-btn-primary" style={{ marginTop: 0 }}>
                  Publish Devotional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Post Memory Verse Modal */}
      {showVerseModal && (
        <div className="tp-modal-overlay" onClick={() => setShowVerseModal(false)}>
          <div className="tp-modal card" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowVerseModal(false)}>
              <X size={20} />
            </button>
            <h2>Post Memory Verse</h2>
            <form onSubmit={handlePostVerse} className="tp-form">
              <div className="tp-input-group">
                <label htmlFor="verse-ref">Scripture Reference</label>
                <input
                  type="text"
                  id="verse-ref"
                  className="tp-input"
                  placeholder="e.g. John 3:16"
                  value={verseRef}
                  onChange={e => setVerseRef(e.target.value)}
                  required
                />
              </div>

              <div className="tp-input-group">
                <label htmlFor="verse-difficulty">Difficulty Level</label>
                <select
                  id="verse-difficulty"
                  className="tp-input"
                  style={{ appearance: 'none', background: 'white' }}
                  value={verseDifficulty}
                  onChange={e => setVerseDifficulty(e.target.value)}
                  required
                >
                  <option value="Easy">Easy (Ages 6-7)</option>
                  <option value="Medium">Medium (Ages 8-9)</option>
                  <option value="Hard">Hard (Ages 10-12)</option>
                </select>
              </div>

              <div className="tp-input-group">
                <label htmlFor="verse-text">Verse Text</label>
                <textarea
                  id="verse-text"
                  className="tp-input"
                  placeholder="For God so loved the world..."
                  rows={4}
                  value={verseText}
                  onChange={e => setVerseText(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="tp-modal-actions">
                <button type="button" className="tp-btn-outline-sm" onClick={() => setShowVerseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="tp-btn-primary" style={{ marginTop: 0 }}>
                  Publish Verse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
