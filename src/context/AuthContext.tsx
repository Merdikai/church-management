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

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function fetchRole(userId: string): Promise<RoleName> {
    try {
      const { data } = await supabase
        .from('team_roles')
        .select('role')
        .eq('user_id', userId)
        .is('team_id', null)
        .limit(1);

      if (data && data.length > 0) {
        const r = data[0].role;
        if (r === 'admin' || r === 'leader' || r === 'member') return r;
      }
      return 'member';
    } catch {
      return 'member';
    }
  }

  useEffect(() => {
    let mounted = true;

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
        }).catch(() => {
          if (mounted) {
            setRole('member');
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (!session) {
          setRole(null);
          setLoading(false);
          return;
        }

        if (session.user) {
          try {
            const r = await fetchRole(session.user.id);
            if (mounted) setRole(r);
          } catch {
            if (mounted) setRole('member');
          }
          if (mounted) setLoading(false);
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
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout errors
    }
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