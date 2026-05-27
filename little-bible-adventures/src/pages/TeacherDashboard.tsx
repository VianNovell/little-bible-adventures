import { Users, Calendar, Plus, BookOpen, Edit, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  return (
    <div className="teacher-dashboard">
      <div className="teacher-header bg-blue">
        <div className="container">
          <h1 className="text-white">Teacher Portal</h1>
          <p className="text-white">Welcome back, Teacher Sarah! Here's what's happening today.</p>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-yellow"><Calendar color="white" /></div>
            <div className="stat-info">
              <h3>3</h3>
              <p>Upcoming Sessions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-purple"><Users color="white" /></div>
            <div className="stat-info">
              <h3>45</h3>
              <p>Active Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-blue"><BookOpen color="white" /></div>
            <div className="stat-info">
              <h3>12</h3>
              <p>Stories Posted</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="btn btn-primary"><Plus size={18} /> Schedule Session</button>
          <button className="btn btn-secondary"><Edit size={18} /> Write a Story</button>
          <button className="btn btn-outline"><Settings size={18} /> Class Settings</button>
        </div>

        <div className="teacher-sections">
          <div className="section-card card">
            <h2 className="section-title-sm">My Upcoming Sessions</h2>
            <div className="session-list">
              <div className="session-list-item">
                <div className="session-date bg-yellow">
                  <span className="day">Sun</span>
                  <span className="time">9:00 AM</span>
                </div>
                <div className="session-info">
                  <h4>Sunday School Live: Little Lambs</h4>
                  <p>Group: Ages 3-5</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/room/1')}>Start Call</button>
              </div>
              <div className="session-list-item">
                <div className="session-date bg-yellow">
                  <span className="day">Wed</span>
                  <span className="time">4:00 PM</span>
                </div>
                <div className="session-info">
                  <h4>Mid-week Arts & Crafts</h4>
                  <p>Group: Ages 3-5</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/room/2')}>Start Call</button>
              </div>
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
    </div>
  );
}
