import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { RoleName } from '../types/Role';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: RoleName | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleName | null>(null);
  const [loading, setLoading] = useState(true);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  async function fetchRole(userId: string): Promise<RoleName> {
  try {
    const { data, error } = await supabase
      .from('team_roles')
      .select('role')
      .eq('user_id', userId)
      .is('team_id', null)
      .limit(1);

    if (error || !data || data.length === 0) {
      return 'member'; // Default to member silently
    }
    const role = data[0].role;
    if (role === 'admin' || role === 'leader' || role === 'member') {
      return role;
    }
    return 'member';
  } catch {
    return 'member';
  }
}

  useEffect(() => {
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id).then((r) => {
          if (mounted) {
            setRole(r);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
        // Immediately update session and user so routes react
        setSession(session);
        setUser(session?.user ?? null);

        // On sign-out, clear everything immediately
        if (!session) {
          setRole(null);
          setLoading(false);
          return;
        }

        // On sign-in, fetch role then finish loading
        if (session.user) {
          const r = await fetchRole(session.user.id);
          if (mounted) {
            setRole(r);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
  setLoading(true);
  await supabase.auth.signOut();
  setRole(null);
  setUser(null);
  setSession(null);
  setLoading(false);
};

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}