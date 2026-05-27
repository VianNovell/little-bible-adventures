import { useState, useEffect } from 'react';
import { Activity, Star, Settings, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './ParentDashboard.css';

interface Kid {
  id: number | string;
  name: string;
  group: string;
  avatar: string;
  colorClass: string;
  badgeClass: string;
}

interface ActivityItem {
  id: number | string;
  message: React.ReactNode;
  time: string;
  iconBgClass: string;
  icon: 'activity' | 'star' | 'shield';
}

const defaultActs: ActivityItem[] = [
  {
    id: 1,
    message: <><strong>Jimmy</strong> completed the story <em>David and the Giant</em></>,
    time: '2 hours ago',
    iconBgClass: 'bg-yellow',
    icon: 'activity'
  },
  {
    id: 2,
    message: <><strong>Sarah</strong> joined the <em>Sunday School Live</em> session</>,
    time: 'Yesterday',
    iconBgClass: 'bg-blue',
    icon: 'star'
  },
  {
    id: 3,
    message: <><strong>Parent Settings</strong> updated successfully.</>,
    time: 'Last week',
    iconBgClass: 'bg-purple',
    icon: 'shield'
  }
];

export default function ParentDashboard() {
  const [kids, setKids] = useState<Kid[]>(() => {
    const saved = localStorage.getItem('parentKids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, name: 'Jimmy', group: 'Redeemed (8-9)', avatar: 'J', colorClass: 'card-yellow', badgeClass: 'badge-kids' },
      { id: 2, name: 'Sarah', group: 'Little Angels (6-7)', avatar: 'S', colorClass: 'card-purple', badgeClass: 'badge-toddler' },
    ];
  });

  const [activities, setActivities] = useState<ActivityItem[]>(defaultActs);

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Little Angels (6-7)');

  useEffect(() => {
    // Dynamically retrieve synced kids profiles and activities from the cloud database
    const syncParentData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          // 1. Fetch children from Postgres
          const { data: dbKids } = await supabase.from('kids').select('*').eq('parent_id', userId);
          if (dbKids && dbKids.length > 0) {
            const mappedKids = dbKids.map((k: any) => ({
              id: k.id,
              name: k.name,
              group: k.group_name,
              avatar: k.avatar,
              colorClass: k.color_theme,
              badgeClass: k.color_theme === 'card-yellow' ? 'badge-kids' : k.color_theme === 'card-purple' ? 'badge-toddler' : k.color_theme === 'card-blue' ? 'badge-tweens' : 'badge-kids'
            }));
            setKids(mappedKids);
            localStorage.setItem('parentKids', JSON.stringify(mappedKids));
          }

          // 2. Fetch parent activities from Postgres
          const { data: dbActs } = await supabase.from('activities').select('*').eq('parent_id', userId).order('created_at', { ascending: false });
          if (dbActs && dbActs.length > 0) {
            const mappedActs = dbActs.map((a: any) => {
              const isStory = a.message.includes('completed the story');
              return {
                id: a.id,
                message: isStory 
                  ? <><strong>{a.child_name}</strong> completed the story <em>{a.message.replace('completed the story ', '')}</em></>
                  : <><strong>{a.child_name}</strong> {a.message}</>,
                time: a.time_label,
                iconBgClass: a.icon_bg,
                icon: a.icon_name as 'activity' | 'star' | 'shield'
              };
            });
            setActivities([...mappedActs, ...defaultActs]);
          }
        }
      } catch (err) {
        console.warn('Parent Dashboard offline sync fallback:', err);
      }
    };

    syncParentData();
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Dynamically cycle color themes based on the length of kids list
    const colorThemes = [
      { colorClass: 'card-blue', badgeClass: 'badge-tweens' },
      { colorClass: 'card-green', badgeClass: 'badge-kids' },
      { colorClass: 'card-yellow', badgeClass: 'badge-toddler' },
      { colorClass: 'card-purple', badgeClass: 'badge-teens' }
    ];
    const theme = colorThemes[kids.length % colorThemes.length];

    const childId = Date.now();
    const newChild: Kid = {
      id: childId,
      name: newName.trim(),
      group: newGroup,
      avatar: newName.trim().charAt(0).toUpperCase(),
      colorClass: theme.colorClass,
      badgeClass: theme.badgeClass
    };

    // Prepend a new real-time activity for this child registration
    const actId = childId + 1;
    const newAct: ActivityItem = {
      id: actId,
      message: <><strong>{newName.trim()}</strong> registered successfully as a new adventurer!</>,
      time: 'Just now',
      iconBgClass: theme.colorClass.replace('card-', 'bg-'),
      icon: 'star'
    };

    const updatedKids = [...kids, newChild];
    setKids(updatedKids);
    localStorage.setItem('parentKids', JSON.stringify(updatedKids));

    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);

    // 1. Sync child registration to Supabase Kids table (Cloud Insert)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      await supabase.from('kids').insert({
        parent_id: userId || 'mock-parent-id',
        name: newChild.name,
        group_name: newChild.group,
        avatar: newChild.avatar,
        color_theme: newChild.colorClass
      });
    } catch (err) {
      console.warn('Supabase Kids Insert offline fallback:', err);
    }

    // 2. Sync registration activity log to Supabase Activities table (Cloud Insert)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      await supabase.from('activities').insert({
        parent_id: userId || 'mock-parent-id',
        child_name: newChild.name,
        message: 'registered successfully as a new adventurer!',
        time_label: 'Just now',
        icon_bg: theme.colorClass.replace('card-', 'bg-'),
        icon_name: 'star'
      });
    } catch (err) {
      console.warn('Supabase Activities Insert offline fallback:', err);
    }

    // Local Storage backup for offline resilience
    try {
      const parentActivities = JSON.parse(localStorage.getItem('parentActivities') || '[]');
      parentActivities.unshift({
        id: actId,
        childName: newName.trim(),
        message: 'registered successfully as a new adventurer!',
        time: 'Just now',
        iconBgClass: theme.colorClass.replace('card-', 'bg-'),
        icon: 'star'
      });
      localStorage.setItem('parentActivities', JSON.stringify(parentActivities));
    } catch (err) {
      console.error(err);
    }

    setNewName('');
    setNewGroup('Little Angels (6-7)');
    setShowModal(false);
  };

  return (
    <div className="parent-dashboard">
      <div className="parent-header bg-purple">
        <div className="container header-container-flex">
          <img src="/logo.png" alt="Little Bible Adventures Logo" className="header-logo-img animate-float" />
          <div className="header-text-group">
            <h1 className="text-white">Parent Portal</h1>
            <p className="text-white">Manage your kids' accounts and track their learning progress.</p>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="parent-sections">
          
          <div className="section-card card">
            <h2 className="section-title-sm">My Kids</h2>
            <div className="kids-list">
              {kids.map(kid => (
                <div key={kid.id} className={`kid-card ${kid.colorClass}`}>
                  <div className="kid-avatar">{kid.avatar}</div>
                  <div className="kid-info">
                    <h3>{kid.name}</h3>
                    <p className={`badge ${kid.badgeClass}`}>{kid.group}</p>
                  </div>
                  <div className="kid-actions">
                    <button className="btn btn-outline btn-sm">Edit Profile</button>
                  </div>
                </div>
              ))}

              <button className="btn btn-outline w-100 mt-2" onClick={() => setShowModal(true)}>
                + Add Another Child
              </button>
            </div>
          </div>

          <div className="section-card card">
            <h2 className="section-title-sm">Recent Activity</h2>
            <div className="activity-feed">
              {activities.map(act => (
                <div key={act.id} className="activity-item">
                  <div className={`activity-icon ${act.iconBgClass}`}>
                    {act.icon === 'activity' && <Activity size={16} color="white" />}
                    {act.icon === 'star' && <Star size={16} color="white" />}
                    {act.icon === 'shield' && <ShieldCheck size={16} color="white" />}
                  </div>
                  <div className="activity-content">
                    <p>{act.message}</p>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="parent-settings card mt-4">
          <h2 className="section-title-sm">Account Settings</h2>
          <div className="settings-grid">
            <button className="btn btn-outline"><Settings size={18} /> Manage Notifications</button>
            <button className="btn btn-outline"><ShieldCheck size={18} /> Privacy Controls</button>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {showModal && (
        <div className="parent-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="parent-modal card" onClick={e => e.stopPropagation()}>
            <button className="parent-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h2>Add Another Child</h2>
            <form onSubmit={handleAddChild} className="auth-form">
              <div className="input-group">
                <label htmlFor="childName">Child's Name</label>
                <input
                  type="text"
                  id="childName"
                  className="input-control"
                  placeholder="Enter name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="childGroup">Age Group</label>
                <select
                  id="childGroup"
                  className="input-control select-control"
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  required
                >
                  <option value="Little Angels (6-7)">Little Angels (Ages 6-7)</option>
                  <option value="Redeemed (8-9)">Redeemed (Ages 8-9)</option>
                  <option value="Chosen (10-12)">Chosen (Ages 10-12)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
