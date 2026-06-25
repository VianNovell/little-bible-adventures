import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Plus, BookOpen, Edit, Settings, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, day: 'Mon', time: '4:30 PM EST', title: 'Monday Live: Little Angels (4:30 PM)', group: 'Little Angels' },
      { id: 2, day: 'Mon', time: '5:30 PM EST', title: 'Monday Live: Little Angels (5:30 PM)', group: 'Little Angels' },
      { id: 3, day: 'Tue', time: '4:30 PM EST', title: 'Tuesday Live: Redeemed (4:30 PM)', group: 'Redeemed' },
      { id: 4, day: 'Tue', time: '5:30 PM EST', title: 'Tuesday Live: Redeemed (5:30 PM)', group: 'Redeemed' },
      { id: 5, day: 'Wed', time: '4:30 PM EST', title: 'Wednesday Live: Chosen (4:30 PM)', group: 'Chosen' },
      { id: 6, day: 'Wed', time: '5:30 PM EST', title: 'Wednesday Live: Chosen (5:30 PM)', group: 'Chosen' },
      { id: 7, day: 'Thu', time: '4:30 PM EST', title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', group: 'Little Angels & Redeemed' },
      { id: 8, day: 'Thu', time: '5:30 PM EST', title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', group: 'Little Angels & Redeemed' },
      { id: 9, day: 'Fri', time: '4:30 PM EST', title: 'Friday Prayer: Chosen (4:30 PM)', group: 'Chosen' },
      { id: 10, day: 'Fri', time: '5:30 PM EST', title: 'Friday Prayer: Chosen (5:30 PM)', group: 'Chosen' },
    ];
    return defaultSessions;
  });

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Sunday 11:00 AM');
  const [newGroup, setNewGroup] = useState('6-7');
  const [newHost, setNewHost] = useState("Mrs. Sa'rah");
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [classSettings, setClassSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('class_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      muteAudioOnEntry: true,
      muteVideoOnEntry: true,
      requireWaitingRoom: false
    };
  });

  const saveSettings = () => {
    localStorage.setItem('class_settings', JSON.stringify(classSettings));
    setShowSettingsModal(false);
  };

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogGroup, setBlogGroup] = useState('all');
  const [blogImg, setBlogImg] = useState('');
  const [blogImgScale, setBlogImgScale] = useState(1);
  const [blogImgPos, setBlogImgPos] = useState(50);
  const [blogText, setBlogText] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const [showVerseModal, setShowVerseModal] = useState(false);
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [verseDifficulty, setVerseDifficulty] = useState('Easy');

  const [internalPosts, setInternalPosts] = useState<any[]>([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: postsData } = await supabase
          .from('internal_blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (postsData) {
          setInternalPosts(postsData);
        }

        const { data: prayersData } = await supabase
          .from('prayers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (prayersData) {
          setPrayers(prayersData);
        }

        const { count } = await supabase.from('achievements').select('*', { count: 'exact', head: true });
        if (count !== null) setActiveStudentsCount(count);

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const [prayers, setPrayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        if (!localStorage.getItem('cleared_old_sessions_v1_teacher')) {
          localStorage.removeItem('mock_db_sessions');
          localStorage.setItem('cleared_old_sessions_v1_teacher', 'true');
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
            { id: 1, day: 'Mon', time: '4:30 PM EST', title: 'Monday Live: Little Angels (4:30 PM)', group: 'Little Angels' },
            { id: 2, day: 'Mon', time: '5:30 PM EST', title: 'Monday Live: Little Angels (5:30 PM)', group: 'Little Angels' },
            { id: 3, day: 'Tue', time: '4:30 PM EST', title: 'Tuesday Live: Redeemed (4:30 PM)', group: 'Redeemed' },
            { id: 4, day: 'Tue', time: '5:30 PM EST', title: 'Tuesday Live: Redeemed (5:30 PM)', group: 'Redeemed' },
            { id: 5, day: 'Wed', time: '4:30 PM EST', title: 'Wednesday Live: Chosen (4:30 PM)', group: 'Chosen' },
            { id: 6, day: 'Wed', time: '5:30 PM EST', title: 'Wednesday Live: Chosen (5:30 PM)', group: 'Chosen' },
            { id: 7, day: 'Thu', time: '4:30 PM EST', title: 'Thursday Prayer: Little Angels & Redeemed (4:30 PM)', group: 'Little Angels & Redeemed' },
            { id: 8, day: 'Thu', time: '5:30 PM EST', title: 'Thursday Prayer: Little Angels & Redeemed (5:30 PM)', group: 'Little Angels & Redeemed' },
            { id: 9, day: 'Fri', time: '4:30 PM EST', title: 'Friday Prayer: Chosen (4:30 PM)', group: 'Chosen' },
            { id: 10, day: 'Fri', time: '5:30 PM EST', title: 'Friday Prayer: Chosen (5:30 PM)', group: 'Chosen' },
          ];

          const filteredDefaults = defaultSessions.filter(
            ds => !mappedSessions.some((ms: any) => ms.title === ds.title)
          );

          const combined = [...mappedSessions, ...filteredDefaults];
          setSessions(combined);
        }
      } catch (err) {
        console.warn('Offline teacher sessions fetch failed:', err);
      }
    };
    fetchLiveSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parts = newTime.split(' ');
    const day = parts[0] || 'Sun';
    const sessionObj = {
      id: Date.now(),
      title: newTitle,
      day: day,
      time: newTime,
      group: newGroup === '6-7' ? 'Little Angels (6-7)' : newGroup === '8-9' ? 'Redeemed (8-9)' : 'Chosen (10-12)',
      host: newHost
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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setBlogImg(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogText.trim()) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (editingPostId) {
      // Optimistic local update
      setInternalPosts(prev => prev.map(p => 
        p.id === editingPostId ? { 
          ...p, 
          title: blogTitle.trim(), 
          group: blogGroup, 
          img: blogImg, 
          imgScale: blogImgScale, 
          imgPos: blogImgPos, 
          text: blogText.trim() 
        } : p
      ));

      try {
        await supabase.from('internal_blog_posts').update({
          title: blogTitle.trim(),
          "group": blogGroup,
          image_url: blogImg,
          content: blogText.trim()
        }).eq('id', editingPostId);
      } catch (err) {
        console.error('Error updating post in Supabase', err);
      }
    } else {
      const newPost = {
        title: blogTitle.trim(),
        "group": blogGroup,
        image_url: blogImg,
        content: blogText.trim()
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
      } catch (err) {
        console.error('Error inserting post to Supabase', err);
      }
    }

    setBlogTitle('');
    setBlogText('');
    setBlogImg('/noah.png');
    setBlogImgScale(1);
    setBlogImgPos(50);
    setEditingPostId(null);
    setShowBlogModal(false);
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

  const handleEditClick = (post: any) => {
    setBlogTitle(post.title || '');
    setBlogGroup(post.group || 'all');
    setBlogImg(post.img || '/noah.png');
    setBlogImgScale(post.imgScale || 1);
    setBlogImgPos(post.imgPos !== undefined ? post.imgPos : 50);
    setBlogText(post.text || '');
    setEditingPostId(post.id);
    setShowBlogModal(true);
  };

  const handleNewBlogClick = () => {
    setBlogTitle('');
    setBlogGroup('all');
    setBlogImg('/noah.png');
    setBlogImgScale(1);
    setBlogImgPos(50);
    setBlogText('');
    setEditingPostId(null);
    setShowBlogModal(true);
  };

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header bg-blue">
        <div className="container">
          <h1 className="text-white animate-pulse">Teacher Portal</h1>
          <p className="text-white">Welcome back, Authorized Staff! Manage and schedule your Sunday School adventures.</p>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="stats-grid animate-fade-in">
          <div className="stat-card card">
            <div className="stat-icon bg-yellow"><Calendar color="white" /></div>
            <div className="stat-info">
              <h3>{sessions.length}</h3>
              <p>Upcoming Sessions</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon bg-purple"><Users color="white" /></div>
            <div className="stat-info">
              <h3>{activeStudentsCount}</h3>
              <p>Active Students</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon bg-blue"><BookOpen color="white" /></div>
            <div className="stat-info">
              <h3>{internalPosts.length}</h3>
              <p>Devotionals</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Schedule Session</button>
          <button className="btn btn-secondary" onClick={handleNewBlogClick}><Edit size={18} /> Write Devotional</button>
          <button className="btn btn-outline" onClick={() => setShowVerseModal(true)}><BookOpen size={18} /> Post Memory Verse</button>
          <button className="btn btn-outline" onClick={() => setShowSettingsModal(true)}><Settings size={18} /> Class Settings</button>
        </div>

        <div className="teacher-sections">
          <div className="section-card card">
            <h2 className="section-title-sm">Upcoming Live Sessions</h2>
            <div className="session-list">
              {sessions.map(s => (
                <div key={s.id} className="session-list-item animate-slide-up">
                  <div className="session-date bg-yellow">
                    <span className="day">{s.day}</span>
                    <span className="time">{s.time}</span>
                  </div>
                  <div className="session-info">
                    <h4>{s.title}</h4>
                    <p>Group: {s.group}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/room/${s.id}?role=teacher`)}>Start Call</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card card">
            <h2 className="section-title-sm">Recent Devotionals</h2>
            <div className="story-list">
              {internalPosts.length === 0 && <p style={{ fontSize: '0.9rem', color: '#666' }}>No devotionals yet.</p>}
              {internalPosts.slice(0, 3).map(post => (
                <div key={post.id} className="story-item">
                  <BookOpen size={24} className="story-icon" />
                  <div className="story-info">
                    <h4>{post.title}</h4>
                    <p>Published: {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(post)}>Edit</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card card">
            <h2 className="section-title-sm">Recent Prayer Requests</h2>
            <div className="story-list">
              {prayers.length > 0 ? prayers.slice(0, 3).map(prayer => (
                <div key={prayer.id} className="story-item" style={{ alignItems: 'flex-start' }}>
                  <div className="story-info">
                    <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>"{prayer.text}"</p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      - {prayer.author} · {new Date(prayer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem' }}>No recent prayer requests.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Live Session Modal */}
      {showModal && (
        <div className="tp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tp-modal card" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h2>Schedule Live Session</h2>
            <form onSubmit={handleCreateSession} className="auth-form" style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label htmlFor="sess-title">Session Title</label>
                <input
                  type="text"
                  id="sess-title"
                  className="input-control"
                  placeholder="e.g. Sunday School Live"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="sess-time">Day & Time</label>
                <input
                  type="text"
                  id="sess-time"
                  className="input-control"
                  placeholder="e.g. Sunday 11:00 AM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="sess-group">Age Group Filter</label>
                <select
                  id="sess-group"
                  className="input-control select-control"
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  required
                >
                  <option value="6-7">Little Angels (Ages 6-7)</option>
                  <option value="8-9">Redeemed (Ages 8-9)</option>
                  <option value="10-12">Chosen (Ages 10-12)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="sess-host">Host Teacher</label>
                <input
                  type="text"
                  id="sess-host"
                  className="input-control"
                  placeholder="e.g. Mrs. Sa'rah"
                  value={newHost}
                  onChange={e => setNewHost(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>{editingPostId ? 'Edit Devotional' : 'Write Devotional'}</h2>
            <form onSubmit={handleCreateBlogPost} className="auth-form">
              <div className="input-group">
                <label htmlFor="blog-title">Title</label>
                <input
                  type="text"
                  id="blog-title"
                  className="input-control"
                  placeholder="e.g. Noah's Ark Craft Results"
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="blog-group">Audience (Age Group)</label>
                <select
                  id="blog-group"
                  className="input-control"
                  style={{ appearance: 'none', background: 'white' }}
                  value={blogGroup}
                  onChange={e => setBlogGroup(e.target.value)}
                  required
                >
                  <option value="all">All Groups</option>
                  <option value="Little Angels">Little Angels</option>
                  <option value="Redeemed">Redeemed</option>
                  <option value="Chosen">Chosen</option>
                </select>
              </div>


              <div className="input-group">
                <label htmlFor="blog-text">Devotional Content</label>
                <textarea
                  id="blog-text"
                  className="input-control"
                  placeholder="Write your devotional here..."
                  rows={4}
                  value={blogText}
                  onChange={e => setBlogText(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Publish Devotional
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {comingSoonFeature && (
        <div className="tp-modal-overlay" onClick={() => setComingSoonFeature(null)}>
          <div className="tp-modal card animate-float" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '2rem' }}>
            <button className="tp-modal-close" onClick={() => setComingSoonFeature(null)}>
              <X size={20} />
            </button>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h2>{comingSoonFeature} is Coming Soon!</h2>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>Our team is working hard to bring you this feature. Check back soon!</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setComingSoonFeature(null)}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Class Settings Modal */}
      {showSettingsModal && (
        <div className="tp-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="tp-modal card animate-slide-up" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowSettingsModal(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={24} color="var(--primary-color)" /> Class Access Rights
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={classSettings.muteAudioOnEntry}
                  onChange={e => setClassSettings({...classSettings, muteAudioOnEntry: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Mute Students on Entry</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={classSettings.muteVideoOnEntry}
                  onChange={e => setClassSettings({...classSettings, muteVideoOnEntry: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Turn off Student Video on Entry</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={classSettings.requireWaitingRoom}
                  onChange={e => setClassSettings({...classSettings, requireWaitingRoom: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Require Waiting Room Approval (Coming Soon)</span>
              </label>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
              <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>Teacher Privileges Active</strong>
              <span style={{ color: '#15803d', fontSize: '0.9rem' }}>When you join a call from this dashboard, you will automatically be granted Moderator rights.</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      )}
      {/* Post Memory Verse Modal */}
      {showVerseModal && (
        <div className="tp-modal-overlay" onClick={() => setShowVerseModal(false)}>
          <div className="tp-modal card animate-slide-up" onClick={e => e.stopPropagation()}>
            <button className="tp-modal-close" onClick={() => setShowVerseModal(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={24} color="var(--primary-color)" /> Post Memory Verse
            </h2>
            <form onSubmit={handlePostVerse} className="auth-form">
              <div className="input-group">
                <label htmlFor="verse-ref">Scripture Reference</label>
                <input
                  type="text"
                  id="verse-ref"
                  className="input-control"
                  placeholder="e.g. John 3:16"
                  value={verseRef}
                  onChange={e => setVerseRef(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="verse-difficulty">Difficulty Level</label>
                <select
                  id="verse-difficulty"
                  className="input-control select-control"
                  value={verseDifficulty}
                  onChange={e => setVerseDifficulty(e.target.value)}
                  required
                >
                  <option value="Easy">Easy (Ages 6-7)</option>
                  <option value="Medium">Medium (Ages 8-9)</option>
                  <option value="Hard">Hard (Ages 10-12)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="verse-text">Verse Text</label>
                <textarea
                  id="verse-text"
                  className="input-control"
                  placeholder="For God so loved the world..."
                  rows={4}
                  value={verseText}
                  onChange={e => setVerseText(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Publish Verse to Kids
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
