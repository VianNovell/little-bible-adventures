import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Plus, BookOpen, Edit, Settings, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>(() => {
    const defaultSessions = [
      { id: 1, day: 'Sun', time: '9:00 AM', title: 'Sunday School Live: Little Lambs', group: 'Ages 3-5' },
      { id: 2, day: 'Wed', time: '4:00 PM', title: 'Mid-week Arts & Crafts', group: 'Ages 3-5' },
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
            { id: 1, day: 'Sun', time: '9:00 AM', title: 'Sunday School Live: Little Lambs', group: 'Ages 3-5' },
            { id: 2, day: 'Wed', time: '4:00 PM', title: 'Mid-week Arts & Crafts', group: 'Ages 3-5' },
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
  }, []);

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
              <h3>45</h3>
              <p>Active Students</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon bg-blue"><BookOpen color="white" /></div>
            <div className="stat-info">
              <h3>12</h3>
              <p>Stories Posted</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Schedule Session</button>
          <button className="btn btn-secondary"><Edit size={18} /> Write a Story</button>
          <button className="btn btn-outline"><Settings size={18} /> Class Settings</button>
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
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/room/${s.id}`)}>Start Call</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card card">
            <h2 className="section-title-sm">Recent Stories</h2>
            <div className="story-list">
              <div className="story-item">
                <BookOpen size={24} className="story-icon" />
                <div className="story-info">
                  <h4>Noah and the Big Boat</h4>
                  <p>Published: 2 days ago</p>
                </div>
                <button className="btn btn-outline btn-sm">Edit</button>
              </div>
              <div className="story-item">
                <BookOpen size={24} className="story-icon" />
                <div className="story-info">
                  <h4>The Story of Creation</h4>
                  <p>Published: 1 week ago</p>
                </div>
                <button className="btn btn-outline btn-sm">Edit</button>
              </div>
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
                  placeholder="e.g. Teacher Sarah"
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
    </div>
  );
}
