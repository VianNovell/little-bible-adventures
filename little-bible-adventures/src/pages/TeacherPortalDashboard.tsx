import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Calendar, BookOpen, Video, Plus, Edit,
  LogOut, BarChart2, ChevronRight, CheckCircle, Clock
} from 'lucide-react';
import './TeacherPortal.css';

const SESSIONS = [
  { id: 1, day: 'Sun', time: '9:00 AM', title: 'Sunday School Live: Little Angels', group: 'Little Angels (6-7)' },
  { id: 2, day: 'Sun', time: '10:00 AM', title: 'Bible Trivia & Fun: Redeemed', group: 'Redeemed (8-9)' },
  { id: 3, day: 'Wed', time: '4:00 PM', title: 'Deep Dive: Chosen', group: 'Chosen (10-12)' },
];

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

  const handleLogout = () => {
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('teacherName');
    navigate('/teacher-portal');
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
                <div><h3>3</h3><p>Sessions</p></div>
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
              {SESSIONS.slice(0, 2).map(s => (
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
              <button className="tp-btn-primary-sm"><Plus size={14} /> New</button>
            </div>
            <div className="card tp-card">
              {SESSIONS.map(s => (
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
    </div>
  );
}
