import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type UserRole = 'student' | 'parent' | 'teacher' | null;

interface AuthContextType {
  userRole: UserRole;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in persistently just like WhatsApp (session recovery)
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        // Recover and set active role from session metadata or email format
        const email = data.session.user.email || '';
        const role = email.includes('teacher') ? 'teacher' : email.includes('parent') ? 'parent' : 'student';
        localStorage.setItem('userRole', role);
        setUserRole(role);

        // If on authentication pages, auto-redirect to respective dashboards
        const publicPaths = ['/', '/login', '/signup'];
        if (publicPaths.includes(location.pathname)) {
          if (role === 'teacher') navigate('/teacher-dashboard');
          else if (role === 'parent') navigate('/parent-dashboard');
          else navigate('/activities');
        }
      } else {
        // Gracefully recover local storage fallback session if present
        const storedRole = localStorage.getItem('userRole') as UserRole;
        if (storedRole) {
          setUserRole(storedRole);
        } else {
          // Redirect to login if trying to access protected dashboards
          const protectedPaths = ['/dashboard', '/activities', '/teacher-dashboard', '/parent-dashboard', '/room', '/profile'];
          const isProtected = protectedPaths.some(p => location.pathname.startsWith(p));
          if (isProtected) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
          }
        }
      }
    };

    restoreSession();
  }, [userRole, location.pathname, navigate]);

  const login = async (role: UserRole, email?: string, password?: string) => {
    if (email && password) {
      // Connect to secure database auth
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const resolvedRole = email.includes('teacher') ? 'teacher' : email.includes('parent') ? 'parent' : 'student';
      localStorage.setItem('userRole', resolvedRole);
      setUserRole(resolvedRole);

      if (resolvedRole === 'teacher') navigate('/teacher-dashboard');
      else if (resolvedRole === 'parent') navigate('/parent-dashboard');
      else navigate('/dashboard');
    } else {
      // Graceful local login fallback
      localStorage.setItem('userRole', role!);
      setUserRole(role);
      
      if (role === 'teacher') navigate('/teacher-dashboard');
      else if (role === 'parent') navigate('/parent-dashboard');
      else navigate('/dashboard');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    setUserRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
