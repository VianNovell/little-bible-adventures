import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Calendar, BookOpen, Video, Plus, Edit,
  LogOut, BarChart2, ChevronRight, CheckCircle, Clock, X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './TeacherPortal.css';

const STORIES = [
  { id: 1, title: 'Noah and the Big Boat', group: 'Little Angels', date: '2 days ago', published: true },
  { id: 2, title: 'David and the Giant', group: 'Redeemed', date: '1 week ago', published: true },
  { id: 3, title: 'Esther Saves Her People', group: 'Chosen', date: '2 weeks ago', published: false },
];

const STUDENTS = [
  { name: 'Emma K.', group: 'Little Angels', joined: 'May 10' },
  { name: 'Liam O.', group: 'Redeemed', joined: 'May 12' },
  { name: 'Zoe M.', group: 'Chosen', joined: 'May 14' },
  { name: 'Noah R.', group: 'Little Angels', joined: 'May 15' },
  { name: 'Ava T.', group: 'Redeemed', joined: 'May 17' },
];

type Tab = 'overview' | 'sessions' | 'stories' | 'students';

export default function TeacherPortalDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const teacherName = localStorage.getItem('teacherName') || 'Teacher';

  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, day: 'Sun', time: '9:00 AM', title: 'Sunday School Live: Little Angels', group: 'Little Angels (6-7)' },
      { id: 2, day: 'Sun', time: '10:00 AM', title: 'Bible Trivia & Fun: Redeemed', group: 'Redeemed (8-9)' },
      { id: 3, day: 'Wed', time: '4:00 PM', title: 'Deep Dive: Chosen', group: 'Chosen (10-12)' },
    ];
    try {
      const saved = localStorage.getItem('db_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => {
          if (s.day && s.time) return s;
          const parts = (s.time_label || s.time || '').split(' ');
          const day = parts[0] || 'Sun';
          const time = parts.slice(1).join(' ') || '12:00 PM';
          return {
            id: s.id,
            day,
            time,
            title: s.title,
            group: s.group_name || s.group || 'All Groups'
          };
        });
      }
      return defaultSessions;
    } catch {
      return defaultSessions;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Sunday 11:00 AM');
  const [newGroup, setNewGroup] = useState('6-7');
  const [newHost, setNewHost] = useState('Teacher Sarah');

  useEffect(() => {
    const auth = localStorage.getItem('teacherAuth');
    if (auth !== 'true') {
      navigate('/teacher-portal');
    }

    const fetchLiveSessions = async () => {
      try {
        const { data } = await supabase.from('sessions').select('*');
        if (data && data.length > 0) {
          const mappedSessions = data.map((s: any) => {
            const parts = (s.time_label || s.time || '').split(' ');
            const day = parts[0] || 'Sun';
            const time = parts.slice(1).join(' ') || '12:00 PM';
            return {
              id: s.id,
              day,
              time,
              title: s.title,
              group: s.group_name || s.group || 'All Groups'
            };
          });

          const defaultSessions = [
            { id: 1, day: 'Sun', time: '9:00 AM', title: 'Sunday School Live: Little Angels', group: 'Little Angels (6-7)' },
            { id: 2, day: 'Sun', time: '10:00 AM', title: 'Bible Trivia & Fun: Redeemed', group: 'Redeemed (8-9)' },
            { id: 3, day: 'Wed', time: '4:00 PM', title: 'Deep Dive: Chosen', group: 'Chosen (10-12)' },
          ];

          const filteredDefaults = defaultSessions.filter(
            ds => !mappedSessions.some((ms: any) => ms.title === ds.title)
          );

          const combined = [...mappedSessions, ...filteredDefaults];
          setSessions(combined);
          localStorage.setItem('db_sessions', JSON.stringify(combined));
        }
      } catch (err) {
        console.warn('Offline teacher sessions fetch failed:', err);
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
    const time = parts.slice(1).join(' ') || '12:00 PM';

    const sessionObj = {
      id: Date.now(),
      day,
      time,
      title: newTitle.trim(),
      group: newGroup === '6-7' ? 'Little Angels (6-7)' : newGroup === '8-9' ? 'Redeemed (8-9)' : 'Chosen (10-12)'
    };

    const updatedSessions = [sessionObj, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('db_sessions', JSON.stringify(updatedSessions));

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
                <div><h3>12</h3><p>Stories</p></div>
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
                  <button className="tp-btn-start" onClick={() => navigate(`/room/${s.id}`)}>
                    <Video size={13} /> Start
                  </button>
                </div>
              ))}
            </div>

            <div className="card tp-card">
              <div className="tp-card-header">
                <h3>Recent Stories</h3>
                <button className="tp-text-btn" onClick={() => setActiveTab('stories')}>View all <ChevronRight size={14} /></button>
              </div>
              {STORIES.slice(0, 3).map(s => (
                <div key={s.id} className="tp-story-row">
                  <BookOpen size={16} className="tp-story-icon" />
                  <div className="tp-story-detail">
                    <strong>{s.title}</strong>
                    <span>{s.group} · {s.date}</span>
                  </div>
                  {s.published
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
                    <button className="tp-btn-start" onClick={() => navigate(`/room/${s.id}`)}>
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
              <h3>Bible Stories</h3>
              <button className="tp-btn-primary-sm"><Plus size={14} /> New</button>
            </div>
            <div className="card tp-card">
              {STORIES.map(s => (
                <div key={s.id} className="tp-story-row">
                  <BookOpen size={18} className="tp-story-icon" />
                  <div className="tp-story-detail">
                    <strong>{s.title}</strong>
                    <span>{s.group} · {s.date}</span>
                  </div>
                  <span className={`tp-status-badge ${s.published ? 'tp-published-badge' : 'tp-draft-badge'}`}>
                    {s.published ? 'Live' : 'Draft'}
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
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="tp-bottom-nav">
        {([
          { key: 'overview', icon: <BarChart2 size={22} />, label: 'Overview' },
          { key: 'sessions', icon: <Video size={22} />, label: 'Sessions' },
          { key: 'stories', icon: <BookOpen size={22} />, label: 'Stories' },
          { key: 'students', icon: <Users size={22} />, label: 'Students' },
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
                  placeholder="e.g. Teacher Sarah"
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
    </div>
  );
}
