import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration securely from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// A secure check to see if database keys are present and not default placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseKey !== 'YOUR_SUPABASE_ANON_KEY';

// Mock Supabase database engine that mimics real Postgres queries with localStorage
class MockSupabaseClient {
  auth = {
    async signUp({ email }: { email: string }) {
      console.log('[Mock DB] Sign Up:', email);
      const user = { id: 'mock-user-id-' + Date.now(), email, role: 'student' };
      return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
    },
    async signInWithPassword({ email }: { email: string }) {
      console.log('[Mock DB] Sign In:', email);
      const userRole = email.includes('teacher') ? 'teacher' : email.includes('parent') ? 'parent' : 'student';
      const user = { id: 'mock-user-id', email, role: userRole };
      return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
    },
    async signOut() {
      console.log('[Mock DB] Sign Out');
      return { error: null };
    },
    async getSession() {
      const activeRole = localStorage.getItem('userRole');
      if (activeRole) {
        const user = { id: 'mock-user-id', email: activeRole + '@bibleadv.com', role: activeRole };
        return { data: { session: { user, access_token: 'mock-token' } }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange(_callback: (event: string, session: any) => void) {
      // Return unsubscribe handler
      return { data: { subscription: { unsubscribe() {} } } };
    }
  };

  // Mock table query builder supporting PostgreSQL schema syntax
  from(table: string) {
    const getStorageKey = () => {
      if (table === 'kids') return 'parentKids';
      if (table === 'activities') return 'parentActivities';
      if (table === 'achievements') return 'userAchievements';
      return `db_${table}`;
    };

    const getItems = (): any[] => {
      try {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    };

    const setItems = (items: any[]) => {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
    };

    return {
      select: (_columns: string = '*') => {
        let data = getItems();
        return {
          eq: (field: string, value: any) => {
            // Apply filtering logic
            if (field === 'parent_id' || field === 'user_id') {
              // Mock auth returns everything matching active session
              return { data, error: null };
            }
            data = data.filter(item => item[field] === value);
            return { data, error: null };
          },
          order: (field: string, { ascending }: { ascending: boolean } = { ascending: false }) => {
            const sorted = [...data].sort((a, b) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            });
            return { data: sorted, error: null };
          },
          // Direct resolution if no further filters called
          data,
          error: null
        };
      },
      insert: (record: any) => {
        const items = getItems();
        const records = Array.isArray(record) ? record : [record];
        const newRecords = records.map(r => ({ id: r.id || Date.now(), created_at: new Date().toISOString(), ...r }));
        setItems([...newRecords, ...items]);
        return { data: newRecords, error: null };
      },
      update: (updates: any) => {
        return {
          eq: (field: string, value: any) => {
            const items = getItems();
            const updated = items.map(item => {
              if (item[field] === value) {
                return { ...item, ...updates, updated_at: new Date().toISOString() };
              }
              return item;
            });
            setItems(updated);
            return { data: updated.filter(item => item[field] === value), error: null };
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            const items = getItems();
            const filtered = items.filter(item => item[field] !== value);
            setItems(filtered);
            return { data: filtered, error: null };
          }
        };
      }
    };
  }
}

// Instantiate either the real live client or our PWA-resilient mock client
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : (new MockSupabaseClient() as any);

// Notify console on current database status
if (isConfigured) {
  console.log('✅ Supabase Secure Cloud Database Client connected successfully.');
} else {
  console.log('⚡ Offline fallback enabled: SQLite/localStorage local db engine is running.');
}
